package com.brainspace.app.reels

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.accessibilityservice.GestureDescription
import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.app.KeyguardManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.graphics.Color
import android.graphics.Path
import android.graphics.Rect
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.os.SystemClock
import android.provider.Settings
import android.text.SpannableString
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.view.animation.AccelerateDecelerateInterpolator
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import java.lang.ref.WeakReference

/** Universal short-form video counter & Spotify-themed floating overlay with brand Brain logo. */
class ReelAccessibilityService : AccessibilityService() {
    private val counter = ReelCounter()
    private val handler = Handler(Looper.getMainLooper())
    private lateinit var store: ReelStore
    private var bubble: View? = null
    private var bubbleText: TextView? = null
    private var currentApp = ""
    private var lastScan = 0L
    private var hideRunnable: Runnable? = null

    private fun scheduleHide(delayMs: Long = 650) {
        if (hideRunnable == null && bubble != null) {
            hideRunnable = Runnable {
                hide()
                counter.reset()
                currentApp = ""
                hideRunnable = null
            }
            handler.postDelayed(hideRunnable!!, delayMs)
        }
    }

    private fun cancelHide() {
        hideRunnable?.let { handler.removeCallbacks(it) }
        hideRunnable = null
    }

    private val actionReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == "com.brainspace.app.SWIPE_REEL") {
                performReelSwipe()
            }
        }
    }

    private val monitor = object : Runnable {
        override fun run() {
            try {
                if (!::store.isInitialized || !store.active || !unlocked()) {
                    hide()
                    counter.reset()
                    currentApp = ""
                } else {
                    val root = try { rootInActiveWindow } catch (_: Throwable) { null }
                    val app = try { root?.packageName?.toString() ?: "" } catch (_: Throwable) { "" }
                    if (app !in store.apps) {
                        scheduleHide(400)
                    } else {
                        val inReel = detectReelStatus(root, app)
                        if (inReel) {
                            cancelHide()
                            currentApp = app
                            if (store.overlay && Settings.canDrawOverlays(this@ReelAccessibilityService)) {
                                show()
                            }
                        } else {
                            scheduleHide(650)
                        }
                    }
                }
            } catch (t: Throwable) {
                android.util.Log.e("BrainSpace", "Error in monitor loop", t)
            } finally {
                handler.postDelayed(this, 300)
            }
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        try {
            store = ReelStore(this)
            instance = WeakReference(this)
            refreshConfiguration()
            handler.removeCallbacks(monitor)
            handler.post(monitor)
            try {
                val filter = IntentFilter("com.brainspace.app.SWIPE_REEL")
                if (Build.VERSION.SDK_INT >= 33) {
                    registerReceiver(actionReceiver, filter, Context.RECEIVER_EXPORTED)
                } else {
                    registerReceiver(actionReceiver, filter)
                }
            } catch (_: Throwable) {}
        } catch (t: Throwable) {
            android.util.Log.e("BrainSpace", "Error in onServiceConnected", t)
        }
    }

    fun refreshConfiguration() {
        try {
            counter.reset()
            hide()
            currentApp = ""
            val info = serviceInfo ?: AccessibilityServiceInfo()
            // Setting packageNames = null ensures Android delivers events for all reel apps without OEM filtering
            info.packageNames = null
            info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED or
                AccessibilityEvent.TYPE_VIEW_SCROLLED or
                AccessibilityEvent.TYPE_VIEW_CLICKED or
                AccessibilityEvent.TYPE_VIEW_SELECTED or
                AccessibilityEvent.TYPE_WINDOWS_CHANGED
            info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
            info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            info.notificationTimeout = 40
            serviceInfo = info
        } catch (t: Throwable) {
            android.util.Log.e("BrainSpace", "Error refreshing configuration", t)
        }
    }

    private fun unlocked(): Boolean {
        return try {
            val pm = getSystemService(Context.POWER_SERVICE) as? PowerManager
            val km = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
            (pm?.isInteractive == true) && (km?.isKeyguardLocked == false)
        } catch (_: Throwable) {
            true
        }
    }

    fun detectReelStatus(root: AccessibilityNodeInfo?, app: String): Boolean {
        try {
            if (root == null) return false
            val rootPkg = try { root.packageName?.toString() } catch (_: Throwable) { null }
            if (rootPkg != app) return false
            val displayMetrics = resources.displayMetrics
            val minPageHeight = (displayMetrics.heightPixels * 0.55).toInt()

            val reelIds = ReelCounter.PAGERS[app] ?: emptySet()
            val nonReelTabs = ReelCounter.NON_REEL_TABS[app] ?: emptySet()

            var hasReelContainer = false
            var isBlocked = false

            val queue = java.util.ArrayDeque<AccessibilityNodeInfo>()
            queue.add(root)
            var visited = 0

            while (queue.isNotEmpty() && visited++ < 180) {
                val node = queue.removeFirst()
                val isVisible = try { node.isVisibleToUser } catch (_: Throwable) { false }
                if (!isVisible) continue

                val id = try { ReelCounter.localId(node.viewIdResourceName) } catch (_: Throwable) { "" }
                val desc = try { node.contentDescription?.toString()?.lowercase() ?: "" } catch (_: Throwable) { "" }
                val text = try { node.text?.toString()?.lowercase() ?: "" } catch (_: Throwable) { "" }

                // 1. Comments sheet or blocker over reel -> immediately blocked
                if (id in ReelCounter.BLOCKERS) {
                    val r = Rect()
                    try { node.getBoundsInScreen(r) } catch (_: Throwable) {}
                    if (r.height() > dp(250)) {
                        isBlocked = true
                        break
                    }
                }

                // 2. Exact match against known reel container IDs
                if (id in reelIds) {
                    val r = Rect()
                    try {
                        node.getBoundsInScreen(r)
                        if (r.height() >= minPageHeight || id in setOf(
                            "reel_watch_player", "reel_recycler", "root_clips_layout",
                            "clips_viewer_view_pager", "reel_watch_fragment_root"
                        )) {
                            hasReelContainer = true
                        }
                    } catch (_: Throwable) {}
                }

                // 3. YouTube specific detections (Shorts tab or full-screen Shorts player)
                if (app == "com.google.android.youtube") {
                    if (id.startsWith("reel_") || id.contains("shorts") || desc == "shorts" || text == "shorts") {
                        if (id in setOf(
                            "reel_recycler", "reel_watch_player", "reel_watch_fragment_root",
                            "reel_player_page_container", "reel_player_overlay_container",
                            "reel_player_page_content", "reel_video_interactions"
                        ) || (desc == "shorts" && (try { node.isSelected } catch (_: Throwable) { false }))) {
                            hasReelContainer = true
                        }
                    }
                }

                // 4. Snapchat specific detections (Spotlight tab or Spotlight pager)
                if (app == "com.snapchat.android") {
                    if (id == "ngs_spotlight_icon_container" || id.contains("spotlight") || desc.contains("spotlight")) {
                        val isSel = try { node.isSelected } catch (_: Throwable) { false }
                        if (isSel || desc.contains("spotlight")) {
                            hasReelContainer = true
                        }
                    }
                }

                // 5. Instagram specific detections
                if (app == "com.instagram.android") {
                    if (id in reelIds || id.contains("clips_viewer") || id == "root_clips_layout") {
                        val r = Rect()
                        try {
                            node.getBoundsInScreen(r)
                            if (r.height() >= minPageHeight) hasReelContainer = true
                        } catch (_: Throwable) {}
                    }
                }

                // 6. Generic short-form detection for Facebook, TikTok, Reddit, Twitter, etc.
                if (id.contains("reel") || id.contains("vertical_video") || id.contains("watch_pager") || id == "fb_shorts") {
                    val r = Rect()
                    try {
                        node.getBoundsInScreen(r)
                        if (r.height() >= minPageHeight) hasReelContainer = true
                    } catch (_: Throwable) {}
                }

                val childCount = try { node.childCount } catch (_: Throwable) { 0 }
                for (i in 0 until minOf(childCount, 25)) {
                    try {
                        node.getChild(i)?.let { queue.add(it) }
                    } catch (_: Throwable) {}
                }
            }

            return hasReelContainer && !isBlocked
        } catch (t: Throwable) {
            return false
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        try {
            if (event == null || !::store.isInitialized || !store.active || !unlocked()) {
                hide()
                counter.reset()
                return
            }

            val app = try { event.packageName?.toString() ?: return } catch (_: Throwable) { return }
            if (app !in store.apps) {
                if (bubble != null) {
                    hide()
                    counter.reset()
                    currentApp = ""
                }
                return
            }

            val root = try { rootInActiveWindow } catch (_: Throwable) { null }
            val rootPkg = try { root?.packageName?.toString() } catch (_: Throwable) { null }
            if (root == null || rootPkg != app) {
                hide()
                counter.reset()
                currentApp = ""
                return
            }

            val isReel = detectReelStatus(root, app)

            if (!isReel) {
                scheduleHide(650)
                return
            }

            cancelHide()
            currentApp = app
            if (store.overlay && Settings.canDrawOverlays(this)) {
                show()
            }

            // ONLY count reel advances on genuine scroll events (NO TYPE_WINDOW_CONTENT_CHANGED!)
            if (event.eventType == AccessibilityEvent.TYPE_VIEW_SCROLLED) {
                val now = SystemClock.elapsedRealtime()
                val source = try { event.source } catch (_: Throwable) { null }
                val sourceId = try { ReelCounter.localId(source?.viewIdResourceName) } catch (_: Throwable) { "" }
                val rect = Rect()
                try { source?.getBoundsInScreen(rect) } catch (_: Throwable) {}
                val displayMetrics = resources.displayMetrics
                val minPageHeight = (displayMetrics.heightPixels * 0.55).toInt()
                val reelIds = ReelCounter.PAGERS[app] ?: emptySet()

                val isPager = sourceId in reelIds ||
                    sourceId.startsWith("reel_") ||
                    sourceId.contains("clips") ||
                    sourceId.contains("spotlight") ||
                    sourceId.contains("shorts") ||
                    sourceId.contains("opera") ||
                    rect.height() >= minPageHeight

                val changed = counter.observe(
                    ReelCounter.Sample(
                        app, true, false, isPager,
                        if (isPager) event.fromIndex else -1,
                        if (isPager) event.scrollY else -1,
                        rect.height(), now
                    )
                )

                if (changed) {
                    store.increment(app)
                    updateBubble()
                }
            }
        } catch (t: Throwable) {
            android.util.Log.e("BrainSpace", "Error in onAccessibilityEvent", t)
        }
    }

    private fun dp(dp: Float): Int = (dp * resources.displayMetrics.density).toInt()
    private fun dp(dp: Int): Int = (dp * resources.displayMetrics.density).toInt()

    private fun show() {
        try {
            if (bubble == null) {
                val context = this
                val poppinsBold = try {
                    Typeface.createFromAsset(assets, "fonts/Poppins-Bold.ttf")
                } catch (_: Throwable) {
                    Typeface.DEFAULT_BOLD
                }

                val container = LinearLayout(context).apply {
                    orientation = LinearLayout.HORIZONTAL
                    gravity = Gravity.CENTER_VERTICAL
                    setPadding(dp(14), dp(6), dp(14), dp(6))
                    elevation = dp(8).toFloat()
                    background = GradientDrawable().apply {
                        setColor(Color.parseColor("#F4121212")) // Spotify Deep Midnight Black
                        cornerRadius = dp(20).toFloat() // Sleek Spotify capsule
                        setStroke(dp(1.5f), Color.parseColor("#1DB954")) // Spotify Green stroke
                    }
                    contentDescription = "BrainSpace Reel Counter"
                }

                // Text Label with Spotify Green count + White suffix (Only count, no icon)
                val label = TextView(context).apply {
                    layoutParams = LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.WRAP_CONTENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT
                    )
                    textSize = 13.5f
                    typeface = poppinsBold
                    gravity = Gravity.CENTER_VERTICAL
                    includeFontPadding = false
                    letterSpacing = -0.01f
                }
                container.addView(label)
                bubbleText = label

                // Window parameters
                val params = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    if (Build.VERSION.SDK_INT >= 26) WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY else @Suppress("DEPRECATION") WindowManager.LayoutParams.TYPE_PHONE,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                    android.graphics.PixelFormat.TRANSLUCENT
                ).apply {
                    gravity = Gravity.TOP or Gravity.END
                    x = dp(16)
                    y = dp(75) // Comfortably positioned in top corner
                }

                // Draggable & Tappable
                var initialX = 0
                var initialY = 0
                var initialTouchX = 0f
                var initialTouchY = 0f
                var hasMoved = false

                container.setOnTouchListener { _, motionEvent ->
                    try {
                        when (motionEvent.action) {
                            MotionEvent.ACTION_DOWN -> {
                                initialX = params.x
                                initialY = params.y
                                initialTouchX = motionEvent.rawX
                                initialTouchY = motionEvent.rawY
                                hasMoved = false
                                true
                            }
                            MotionEvent.ACTION_MOVE -> {
                                val dx = (motionEvent.rawX - initialTouchX).toInt()
                                val dy = (motionEvent.rawY - initialTouchY).toInt()
                                if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                                    hasMoved = true
                                }
                                params.x = initialX - dx
                                params.y = initialY + dy
                                try {
                                    (getSystemService(WINDOW_SERVICE) as WindowManager).updateViewLayout(container, params)
                                } catch (_: Throwable) {}
                                true
                            }
                            MotionEvent.ACTION_UP -> {
                                if (!hasMoved) {
                                    try {
                                        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                                        launchIntent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                        startActivity(launchIntent)
                                    } catch (_: Throwable) {}
                                }
                                true
                            }
                            else -> false
                        }
                    } catch (_: Throwable) {
                        false
                    }
                }

                try {
                    (getSystemService(WINDOW_SERVICE) as WindowManager).addView(container, params)
                    bubble = container
                } catch (_: Throwable) {}
            }
            updateBubble()
        } catch (t: Throwable) {
            android.util.Log.e("BrainSpace", "Error in show()", t)
        }
    }

    private fun updateBubble() {
        try {
            val count = if (::store.isInitialized) store.todayTotal() else 0
            val countStr = count.toString()
            val suffix = if (count == 1) " Reel" else " Reels"
            val full = "$countStr$suffix"

            val spannable = SpannableString(full)
            // Set count number in vibrant Spotify Green (#1DB954)
            spannable.setSpan(
                ForegroundColorSpan(Color.parseColor("#1DB954")),
                0,
                countStr.length,
                Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
            )
            // Set suffix in pure white (#FFFFFF)
            spannable.setSpan(
                ForegroundColorSpan(Color.WHITE),
                countStr.length,
                full.length,
                Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
            )
            bubbleText?.text = spannable
        } catch (_: Throwable) {}
    }

    fun performReelSwipe() {
        if (Build.VERSION.SDK_INT >= 24) {
            val displayMetrics = resources.displayMetrics
            val startX = displayMetrics.widthPixels / 2f
            val startY = displayMetrics.heightPixels * 0.78f
            val endY = displayMetrics.heightPixels * 0.22f

            val path = Path().apply {
                moveTo(startX, startY)
                lineTo(startX, endY)
            }

            val stroke = GestureDescription.StrokeDescription(path, 0, 220)
            val gesture = GestureDescription.Builder().addStroke(stroke).build()

            dispatchGesture(gesture, null, null)
        }
    }

    private fun hide() {
        try {
            bubble?.let {
                runCatching { (getSystemService(WINDOW_SERVICE) as WindowManager).removeView(it) }
            }
            bubble = null
            bubbleText = null
        } catch (_: Throwable) {}
    }

    override fun onInterrupt() {
        try {
            hide()
            counter.reset()
        } catch (_: Throwable) {}
    }

    override fun onDestroy() {
        try {
            unregisterReceiver(actionReceiver)
        } catch (_: Throwable) {}
        try {
            handler.removeCallbacksAndMessages(null)
            hide()
            instance = null
        } catch (_: Throwable) {}
        super.onDestroy()
    }

    companion object {
        private var instance: WeakReference<ReelAccessibilityService>? = null
        val connected get() = instance?.get() != null
        fun swipe() {
            instance?.get()?.let { service ->
                service.handler.post { service.performReelSwipe() }
            }
        }
        fun refresh() {
            instance?.get()?.let { service ->
                service.handler.post { service.refreshConfiguration() }
            }
        }
    }
}
