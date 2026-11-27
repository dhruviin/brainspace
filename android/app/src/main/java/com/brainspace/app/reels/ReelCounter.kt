package com.brainspace.app.reels

/** Universal metadata-only estimator for Instagram Reels, YouTube Shorts, Snapchat Spotlight, etc. */
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
        if (s.blocked) return false

        // When first entering a reel or switching apps:
        if (!inside || app != s.app) {
            inside = true
            app = s.app
            page = if (s.pagerScroll) s.page else -1
            offset = if (s.pagerScroll) s.scrollY else -1
            countedAt = s.now
            return true
        }

        if (!s.pagerScroll) return false
        var changed = false

        // 1. Adapter item index (Instagram, YouTube reel_recycler)
        if (s.page >= 0) {
            changed = page >= 0 && page != s.page
            page = s.page
        }
        // 2. Continuous scroll quantized to page height
        else if (s.scrollY >= 0 && s.pageHeight > 0) {
            val position = kotlin.math.round(s.scrollY.toDouble() / s.pageHeight).toInt()
            val previous = if (offset < 0) -1 else kotlin.math.round(offset.toDouble() / s.pageHeight).toInt()
            changed = previous >= 0 && previous != position
            if (s.scrollY >= 0) offset = s.scrollY
        }
        // 3. Pager swipe event without index reporting (Snapchat, custom ViewPagers)
        else {
            changed = true
        }

        // Must be at least 700ms since the last reel was counted to prevent double-swiping
        if (!changed || s.now - countedAt < 700) return false
        countedAt = s.now
        return true
    }

    companion object {
        val SUPPORTED = setOf(
            "com.instagram.android",
            "com.google.android.youtube",
            "com.snapchat.android",
            "com.facebook.katana",
            "com.facebook.lite",
            "com.zhiliaoapp.musically",
            "com.ss.android.ugc.trill",
            "com.reddit.frontpage",
            "com.twitter.android",
            "com.pinterest",
            "in.moj.app",
            "com.roposo.android",
            "com.sharechat.android"
        )
        val PAGERS = mapOf(
            "com.instagram.android" to setOf(
                "clips_viewer_view_pager", "clips_viewer_viewpager", "clips_viewer_recycler_view",
                "reel_viewer", "clips", "clips_viewer_container", "root_clips_layout",
                "clips_linear_layout_container", "clips_swipe_refresh_container",
                "clips_video_container", "clips_media_component"
            ),
            "com.google.android.youtube" to setOf(
                "reel_recycler", "reel_watch_player", "reel_player_page_container",
                "shorts_pager", "shorts_recycler", "reel_player_fragment",
                "reel_watch_fragment_root", "reel_player_overlay_container",
                "reel_player_page_content", "reel_video_interactions", "reel_a11y_controls"
            ),
            "com.snapchat.android" to setOf(
                "opera_viewer", "spotlight_container", "spotlight_cta_one_tap_share",
                "ngs_spotlight_icon_container", "spotlight", "spotlight_view_pager",
                "spotlight_feed", "vertical_swipe", "snap_feed", "spotlight_carousel"
            ),
            "com.zhiliaoapp.musically" to setOf(
                "viewpager", "vertical_viewpager", "view_pager", "feed_viewpager",
                "feed_item", "texture_view", "video_view"
            ),
            "com.ss.android.ugc.trill" to setOf(
                "viewpager", "vertical_viewpager", "view_pager", "feed_viewpager",
                "feed_item", "texture_view", "video_view"
            ),
            "com.facebook.katana" to setOf(
                "reels_viewer", "fb_shorts", "reels_fullscreen", "unified_reels", "watch_view", "video_view"
            ),
            "com.facebook.lite" to setOf(
                "reels_viewer", "video_view", "shorts"
            ),
            "com.reddit.frontpage" to setOf(
                "video_feed", "watch_pager", "media_player", "video_player"
            ),
            "com.twitter.android" to setOf(
                "video_player", "immersive_video_feed", "media_container", "immersive_player"
            ),
            "com.pinterest" to setOf(
                "watch_view", "video_player"
            )
        )
        val NON_REEL_TABS = mapOf(
            "com.instagram.android" to setOf("feed_tab", "search_tab", "profile_tab", "direct_tab", "news_tab", "activity_tab"),
            "com.google.android.youtube" to setOf("watch_player", "player_fragment", "watch_while_layout", "fullscreen_player_layout"),
            "com.snapchat.android" to setOf("ngs_camera_icon_container", "ngs_chat_icon_container", "ngs_map_icon_container", "ngs_community_icon_container"),
            "com.zhiliaoapp.musically" to setOf("profile_tab", "inbox_tab", "friends_tab", "search_container", "user_profile"),
            "com.ss.android.ugc.trill" to setOf("profile_tab", "inbox_tab", "friends_tab", "search_container", "user_profile"),
            "com.facebook.katana" to setOf("newsfeed", "feed_view", "tab_feed", "marketplace", "notifications", "menu")
        )
        val BLOCKERS = setOf("comments_bottom_sheet", "comments_container", "comment_thread", "live_chat", "reel_comments", "bottom_sheet_container")
        const val RULE_VERSION = "metadata-pager-v3"
        fun localId(value: String?) = value?.substringAfter(":id/") ?: ""
    }
}
