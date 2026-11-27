package com.brainspace.app.reels

import android.app.AppOpsManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.view.accessibility.AccessibilityManager
import android.accessibilityservice.AccessibilityServiceInfo
import com.facebook.react.bridge.*

class PermissionModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
    override fun getName() = "BrainSpacePermissions"
    private val store get() = ReelStore(context)
    private val oem get() = context.getSharedPreferences("brainspace_permission_setup", Context.MODE_PRIVATE)
    private val xiaomi get() = listOf("xiaomi", "redmi", "poco").any { Build.MANUFACTURER.contains(it, true) || Build.BRAND.contains(it, true) }
    private fun usage(): Boolean {
        val manager = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= 29) manager.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), context.packageName)
        else @Suppress("DEPRECATION") manager.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), context.packageName)
        return mode == AppOpsManager.MODE_ALLOWED
    }
    private fun accessibility(): Boolean {
        return try {
            val expectedComponent = ComponentName(context, ReelAccessibilityService::class.java).flattenToString()
            val expectedShortComponent = ComponentName(context, ReelAccessibilityService::class.java).flattenToShortString()
            val enabledServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: ""
            if (enabledServices.contains(expectedComponent) || enabledServices.contains(expectedShortComponent)) {
                return true
            }
            val manager = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as? AccessibilityManager
            manager?.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_ALL_MASK)?.any {
                val service = it.resolveInfo.serviceInfo
                service.packageName == context.packageName && service.name == ReelAccessibilityService::class.java.name
            } ?: false
        } catch (_: Throwable) {
            false
        }
    }
    @ReactMethod fun getSnapshot(promise: Promise) {
        try {
            val s = store
            promise.resolve(Arguments.createMap().apply {
                putBoolean("available", true); putBoolean("xiaomi", xiaomi)
                putString("manufacturer", Build.MANUFACTURER); putInt("sdk", Build.VERSION.SDK_INT)
                putBoolean("usage", usage()); putBoolean("overlay", Settings.canDrawOverlays(context))
                putBoolean("battery", (context.getSystemService(Context.POWER_SERVICE) as PowerManager).isIgnoringBatteryOptimizations(context.packageName))
                putBoolean("accessibility", accessibility()); putBoolean("connected", ReelAccessibilityService.connected)
                putBoolean("consent", s.consent); putBoolean("paused", s.paused); putBoolean("showCounter", s.overlay)
                putBoolean("popupConfirmed", oem.getBoolean("popup", false)); putBoolean("autostartConfirmed", oem.getBoolean("autostart", false))
                putBoolean("batteryConfirmed", oem.getBoolean("battery", false))
                putArray("apps", Arguments.fromList(s.apps.toList()))
                putInt("instagram", s.count("com.instagram.android")); putInt("youtube", s.count("com.google.android.youtube"))
                putDouble("updated", s.updated.toDouble()); putString("ruleVersion", ReelCounter.RULE_VERSION)
            })
        } catch (e: Exception) { promise.reject("PERMISSION_STATUS", "Could not check device access", e) }
    }
    @ReactMethod fun configureReels(apps: ReadableArray, accepted: Boolean, promise: Promise) {
        try {
            val selected = (0 until apps.size()).mapNotNull { apps.getString(it) }.toSet()
            store.configure(selected, accepted); ReelAccessibilityService.refresh(); promise.resolve(true)
        } catch (e: Exception) { promise.reject("CONSENT_SAVE", "Could not save your choice", e) }
    }
    @ReactMethod fun setPaused(paused: Boolean, promise: Promise) {
        try { store.pause(paused); ReelAccessibilityService.refresh(); promise.resolve(true) }
        catch (e: Exception) { promise.reject("PAUSE_SAVE", e) }
    }
    @ReactMethod fun setCounter(visible: Boolean, promise: Promise) {
        try { store.showOverlay(visible); ReelAccessibilityService.refresh(); promise.resolve(true) }
        catch (e: Exception) { promise.reject("COUNTER_SAVE", e) }
    }
    @ReactMethod fun eraseReelData(promise: Promise) {
        try { store.erase(); ReelAccessibilityService.refresh(); promise.resolve(true) }
        catch (e: Exception) { promise.reject("ERASE_REELS", e) }
    }
    @ReactMethod fun confirmOem(key: String, value: Boolean, promise: Promise) {
        if (key !in setOf("popup", "autostart", "battery")) { promise.resolve(false); return }
        promise.resolve(oem.edit().putBoolean(key, value).commit())
    }
    @ReactMethod fun openSettings(key: String, promise: Promise) {
        val pkg = context.packageName
        val appInfo = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$pkg"))
        val intents = when (key) {
            "usage" -> listOf(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS, Uri.parse("package:$pkg")), Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
            "overlay" -> listOf(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:$pkg")))
            "accessibility" -> {
                if (!store.consent || store.apps.isEmpty()) { promise.resolve(false); return }
                listOf(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
            }
            "popup" -> if (xiaomi) listOf(Intent("miui.intent.action.APP_PERM_EDITOR").setPackage("com.miui.securitycenter").putExtra("extra_pkgname", pkg)) else emptyList()
            "autostart" -> if (xiaomi) listOf(Intent().setComponent(ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"))) else emptyList()
            "battery" -> if (xiaomi) listOf(Intent().setComponent(ComponentName("com.miui.powerkeeper", "com.miui.powerkeeper.ui.HiddenAppsConfigActivity")).putExtra("package_name", pkg).putExtra("package_label", "BrainSpace")) else listOf(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
            else -> emptyList()
        }
        context.runOnUiQueueThread {
            var opened = false
            for (intent in intents + appInfo) {
                try { context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); opened = true; break }
                catch (_: Exception) { /* OEM routes vary; fall back to app settings. */ }
            }
            promise.resolve(opened)
        }
    }
}
