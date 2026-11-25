package com.brainspace.app.reels

/** Pure metadata-only estimator. A generic scroll is never evidence of a reel. */
class ReelCounter {
    data class Sample(
        val app: String, val feedVisible: Boolean, val blocked: Boolean = false,
        val pagerScroll: Boolean = false, val page: Int = -1, val scrollY: Int = -1,
        val pageHeight: Int = 0, val now: Long
    )
    private var app = ""
    private var inside = false
    private var page = -1
    private var offset = -1
    private var countedAt = Long.MIN_VALUE

    fun reset() { app = ""; inside = false; page = -1; offset = -1 }

    fun observe(s: Sample): Boolean {
        if (s.app !in SUPPORTED || !s.feedVisible) { reset(); return false }
        // A sheet over the feed must not turn comment scrolls into reel views.
        if (s.blocked) return false
        if (!inside || app != s.app) {
            inside = true; app = s.app; page = if (s.pagerScroll) s.page else -1
            offset = if (s.pagerScroll) s.scrollY else -1
            countedAt = s.now
            return true
        }
        if (!s.pagerScroll) return false
        var changed = false
        if (s.page >= 0) {
            changed = page >= 0 && page != s.page
            page = s.page
        } else if (s.scrollY >= 0 && s.pageHeight > 0) {
            // Quantized page position; partial swipes and seek bars do not count.
            val position = kotlin.math.round(s.scrollY.toDouble() / s.pageHeight).toInt()
            val previous = if (offset < 0) -1 else kotlin.math.round(offset.toDouble() / s.pageHeight).toInt()
            changed = previous >= 0 && previous != position
        }
        if (s.scrollY >= 0) offset = s.scrollY
        if (!changed || s.now - countedAt < 450) return false
        countedAt = s.now
        return true
    }

    companion object {
        val SUPPORTED = setOf("com.instagram.android", "com.google.android.youtube")
        val PAGERS = mapOf(
            "com.instagram.android" to setOf("clips_viewer_view_pager", "clips_viewer_viewpager", "clips_viewer_recycler_view"),
            "com.google.android.youtube" to setOf("reel_recycler", "reel_watch_player", "reel_player_page_container")
        )
        val BLOCKERS = setOf("comments_bottom_sheet", "comments_container", "comment_thread", "live_chat", "reel_comments", "bottom_sheet_container")
        const val RULE_VERSION = "metadata-pager-v1"
        fun localId(value: String?) = value?.substringAfter(":id/") ?: ""
    }
}
