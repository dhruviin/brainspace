package com.brainspace.app.usagestats

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Build
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import java.util.Calendar

class UsageStatsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "BrainSpaceUsageStats"

    /**
     * Checks if PACKAGE_USAGE_STATS permission has been granted by the user.
     */
    @ReactMethod
    fun checkPermission(promise: Promise) {
        try {
            val appOps = reactContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactContext.packageName
                )
            } else {
                @Suppress("DEPRECATION")
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactContext.packageName
                )
            }
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            promise.reject("CHECK_PERMISSION_ERROR", e.localizedMessage, e)
        }
    }

    /**
     * Opens Android System Settings directly to the Usage Access authorization screen.
     */
    @ReactMethod
    fun requestPermission(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("REQUEST_PERMISSION_ERROR", e.localizedMessage, e)
        }
    }

    /**
     * Queries Android UsageStatsManager for today's foreground usage from midnight to now.
     */
    @ReactMethod
    fun getDailyUsage(promise: Promise) {
        try {
            val usageStatsManager =
                reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            if (usageStatsManager == null) {
                promise.reject("NO_USAGE_SERVICE", "UsageStatsManager service is not available")
                return
            }

            // Calculate start of day (midnight) in local device timezone
            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
            val startOfDay = calendar.timeInMillis
            val now = System.currentTimeMillis()

            val statsMap = usageStatsManager.queryAndAggregateUsageStats(startOfDay, now)
            val pm = reactContext.packageManager

            val appsArray: WritableArray = Arguments.createArray()
            var totalForegroundMs: Long = 0
            var productiveMs: Long = 0
            var neutralMs: Long = 0
            var distractingMs: Long = 0

            // Filter and sort apps with > 30 seconds of foreground usage
            val relevantStats = statsMap.values.filter { it.totalTimeInForeground > 30_000 }
                .sortedByDescending { it.totalTimeInForeground }

            for (stat in relevantStats) {
                val pkg = stat.packageName
                // Skip BrainSpace itself and common system launcher loops
                if (pkg == reactContext.packageName) continue

                val appLabel = try {
                    val appInfo = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        pm.getApplicationInfo(pkg, PackageManager.ApplicationInfoFlags.of(0))
                    } else {
                        @Suppress("DEPRECATION")
                        pm.getApplicationInfo(pkg, 0)
                    }
                    pm.getApplicationLabel(appInfo).toString()
                } catch (e: PackageManager.NameNotFoundException) {
                    pkg.substringAfterLast('.')
                }

                val category = classifyApp(pkg)
                val foregroundMs = stat.totalTimeInForeground
                totalForegroundMs += foregroundMs

                when (category) {
                    "Productive" -> productiveMs += foregroundMs
                    "Distracting" -> distractingMs += foregroundMs
                    else -> neutralMs += foregroundMs
                }

                val item: WritableMap = Arguments.createMap().apply {
                    putString("packageName", pkg)
                    putString("appName", appLabel)
                    putDouble("foregroundMs", foregroundMs.toDouble())
                    putInt("foregroundMinutes", (foregroundMs / 60_000).toInt())
                    putDouble("lastTimeUsed", stat.lastTimeUsed.toDouble())
                    putString("category", category)
                }
                appsArray.pushMap(item)
            }

            val result: WritableMap = Arguments.createMap().apply {
                putDouble("startOfDayUtc", startOfDay.toDouble())
                putDouble("timestampUtc", now.toDouble())
                putDouble("totalForegroundMs", totalForegroundMs.toDouble())
                putInt("totalForegroundMinutes", (totalForegroundMs / 60_000).toInt())
                putInt("productiveMinutes", (productiveMs / 60_000).toInt())
                putInt("neutralMinutes", (neutralMs / 60_000).toInt())
                putInt("distractingMinutes", (distractingMs / 60_000).toInt())
                putArray("apps", appsArray)
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("GET_USAGE_ERROR", e.localizedMessage, e)
        }
    }

    /**
     * Classifies packages into Productive, Neutral, or Distracting baselines.
     * Users can override classifications in subsequent phases.
     */
    private fun classifyApp(pkg: String): String {
        val lower = pkg.lowercase()
        return when {
            // Distracting short-form & social feeds
            lower.contains("instagram") || lower.contains("youtube") || lower.contains("tiktok") ||
            lower.contains("twitter") || lower.contains("reddit") || lower.contains("facebook") ||
            lower.contains("snapchat") || lower.contains("netflix") || lower.contains("primevideo") ||
            lower.contains("twitch") || lower.contains("pinterest") -> "Distracting"

            // Productive tools & deep work
            lower.contains("slack") || lower.contains("notion") || lower.contains("github") ||
            lower.contains("asana") || lower.contains("trello") || lower.contains("jira") ||
            lower.contains("docs") || lower.contains("sheets") || lower.contains("keep") ||
            lower.contains("vscode") || lower.contains("duolingo") || lower.contains("kindle") ||
            lower.contains("linear") || lower.contains("figma") || lower.contains("calendar") -> "Productive"

            // Neutral utilities & communication
            else -> "Neutral"
        }
    }
}
