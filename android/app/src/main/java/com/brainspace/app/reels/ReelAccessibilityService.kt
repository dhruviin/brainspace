package com.brainspace.app.reels

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.app.KeyguardManager
import android.content.Context
import android.graphics.Color
import android.graphics.Rect
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.os.SystemClock
import android.provider.Settings
import android.view.Gravity
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.TextView
import java.lang.ref.WeakReference

/** Opt-in experimental counting. Never reads node text/contentDescription or performs actions. */
class ReelAccessibilityService : AccessibilityService() {
    private val counter = ReelCounter()
    private val handler = Handler(Looper.getMainLooper())
    private lateinit var store: ReelStore
    private var bubble: TextView? = null
    private var currentApp = ""
    private var lastScan = 0L
    private val monitor = object : Runnable {
        override fun run() {
            if (!store.active || !unlocked() || currentApp.isEmpty()) { hide(); counter.reset() }
            else {
                // Check package before examining any node metadata. Nothing from other apps is inspected.
                val root = rootInActiveWindow
                if (root?.packageName?.toString() != currentApp) { hide(); counter.reset(); currentApp = "" }
                else if (bubble != null) updateBubble()
            }
            handler.postDelayed(this, 1000)
        }
    }
    override fun onServiceConnected() {
        store = ReelStore(this)
        instance = WeakReference(this)
        refreshConfiguration()
        handler.post(monitor)
    }
    fun refreshConfiguration() {
        counter.reset(); hide(); currentApp = ""
        // An empty package array can mean ALL apps; use our own package as a harmless disabled filter.
        serviceInfo = serviceInfo.apply {
            packageNames = if (store.active) store.apps.toTypedArray() else arrayOf(packageName)
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED or AccessibilityEvent.TYPE_VIEW_SCROLLED
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
            notificationTimeout = 120
        }
    }
    private fun unlocked() = (getSystemService(Context.POWER_SERVICE) as PowerManager).isInteractive &&
        !(getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager).isKeyguardLocked

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || !::store.isInitialized || !store.active || !unlocked()) { hide(); counter.reset(); return }
        val app = event.packageName?.toString() ?: return
        if (app !in store.apps) return
        val now = SystemClock.elapsedRealtime()
        if (event.eventType != AccessibilityEvent.TYPE_VIEW_SCROLLED && now - lastScan < 180) return
        lastScan = now
        val root = rootInActiveWindow ?: return
        if (root.packageName?.toString() != app) { hide(); counter.reset(); return }
        val ids = ReelCounter.PAGERS[app] ?: return
        var feed = false
        var blocked = false
        val queue = java.util.ArrayDeque<AccessibilityNodeInfo>()
        queue.add(root)
        var visited = 0
        while (queue.isNotEmpty() && visited++ < 220) {
            val node = queue.removeFirst()
            if (!node.isVisibleToUser || node.isPassword || node.isEditable) continue
            val id = ReelCounter.localId(node.viewIdResourceName)
            if (id in ids) feed = true
            if (id in ReelCounter.BLOCKERS) blocked = true
            for (i in 0 until minOf(node.childCount, 40)) node.getChild(i)?.let { queue.add(it) }
        }
        val source = event.source
        val sourceId = ReelCounter.localId(source?.viewIdResourceName)
        val isPager = event.eventType == AccessibilityEvent.TYPE_VIEW_SCROLLED && sourceId in ids
        val rect = Rect()
        source?.getBoundsInScreen(rect)
        val changed = counter.observe(ReelCounter.Sample(app, feed, blocked, isPager,
            if (isPager) event.fromIndex else -1, if (isPager) event.scrollY else -1, rect.height(), now))
        if (changed) store.increment(app)
        currentApp = if (feed) app else ""
        if (currentApp.isNotEmpty() && !blocked && store.overlay && Settings.canDrawOverlays(this)) show() else hide()
    }
    private fun show() {
        if (bubble == null) {
            val view = TextView(this).apply {
                setTextColor(Color.WHITE); textSize = 13f; setPadding(22, 12, 22, 12)
                background = android.graphics.drawable.GradientDrawable().apply {
                    setColor(Color.rgb(24,24,24)); cornerRadius = 40f; setStroke(2, Color.rgb(29,185,84))
                }
                contentDescription = "Estimated reel views today. Tap to hide counter."
                setOnClickListener { store.showOverlay(false); hide() }
            }
            val params = WindowManager.LayoutParams(WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.WRAP_CONTENT,
                if (Build.VERSION.SDK_INT >= 26) WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY else @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                android.graphics.PixelFormat.TRANSLUCENT).apply { gravity = Gravity.TOP or Gravity.END; x = 16; y = 160 }
            try { (getSystemService(WINDOW_SERVICE) as WindowManager).addView(view, params); bubble = view }
            catch (_: Exception) { /* OEM may deny overlays independently. Counting still works. */ }
        }
        updateBubble()
    }
    private fun updateBubble() { bubble?.text = "Est. ${store.apps.sumOf { store.count(it) }} today  ×" }
    private fun hide() { bubble?.let { runCatching { (getSystemService(WINDOW_SERVICE) as WindowManager).removeView(it) } }; bubble = null }
    override fun onInterrupt() { hide(); counter.reset() }
    override fun onDestroy() { handler.removeCallbacksAndMessages(null); hide(); instance = null; super.onDestroy() }
    companion object {
        private var instance: WeakReference<ReelAccessibilityService>? = null
        val connected get() = instance?.get() != null
        fun refresh() { instance?.get()?.let { service -> service.handler.post { service.refreshConfiguration() } } }
    }
}
