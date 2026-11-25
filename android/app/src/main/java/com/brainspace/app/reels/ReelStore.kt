package com.brainspace.app.reels

import android.content.Context
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Aggregate counts only. No event log, text, nodes or media is persisted. */
class ReelStore(context: Context) {
    private val prefs = context.getSharedPreferences("brainspace_reels_private", Context.MODE_PRIVATE)
    val consent get() = prefs.getInt("disclosure", 0) == 1
    val paused get() = prefs.getBoolean("paused", false)
    val overlay get() = prefs.getBoolean("overlay", false)
    val apps get() = prefs.getStringSet("apps", emptySet())!!.intersect(ReelCounter.SUPPORTED)
    val active get() = consent && !paused && apps.isNotEmpty()
    fun configure(selected: Set<String>, accepted: Boolean) {
        check(prefs.edit().putInt("disclosure", if (accepted) 1 else 0)
            .putStringSet("apps", selected.intersect(ReelCounter.SUPPORTED))
            .putBoolean("paused", false).commit()) { "Could not save reel consent" }
    }
    fun pause(value: Boolean) { check(prefs.edit().putBoolean("paused", value).commit()) }
    fun showOverlay(value: Boolean) { check(prefs.edit().putBoolean("overlay", value).commit()) }
    private fun today() = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
    fun count(app: String): Int = prefs.getInt("${today()}:$app", 0)
    fun increment(app: String) {
        val today = today()
        val key = "$today:$app"
        val editor = prefs.edit().putInt(key, count(app) + 1).putLong("lastUpdated", System.currentTimeMillis())
        // Keep one local week; no cross-day sessions or unbounded event history.
        prefs.all.keys.filter { it.contains(":com.") }.forEach { old ->
            val date = runCatching { SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(old.substringBefore(':')) }.getOrNull()
            if (date == null || date.time < System.currentTimeMillis() - 7L * 24 * 60 * 60 * 1000) editor.remove(old)
        }
        editor.apply()
    }
    val updated get() = prefs.getLong("lastUpdated", 0)
    fun erase() {
        val editor = prefs.edit().remove("lastUpdated")
        prefs.all.keys.filter { it.contains(":com.") }.forEach { editor.remove(it) }
        check(editor.commit())
    }
}
