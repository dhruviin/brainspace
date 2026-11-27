package com.brainspace.app.reels

import android.content.Context
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Aggregate counts only. No event log, text, nodes or media is persisted. */
class ReelStore(context: Context) {
    private val prefs = context.getSharedPreferences("brainspace_reels_private", Context.MODE_PRIVATE)
    val consent get() = prefs.getInt("disclosure", 1) == 1
    val paused get() = prefs.getBoolean("paused", false)
    val overlay get() = prefs.getBoolean("overlay", true)
    val apps: Set<String> get() {
        val saved = prefs.getStringSet("apps", null)
        val valid = saved?.intersect(ReelCounter.SUPPORTED)
        return if (valid != null && valid.isNotEmpty()) valid else ReelCounter.SUPPORTED
    }
    val active get() = consent && !paused && apps.isNotEmpty()
    fun configure(selected: Set<String>, accepted: Boolean) {
        val targets = if (selected.isEmpty()) ReelCounter.SUPPORTED else selected.intersect(ReelCounter.SUPPORTED)
        prefs.edit().putInt("disclosure", if (accepted) 1 else 0)
            .putStringSet("apps", targets)
            .putBoolean("paused", false)
            .putBoolean("overlay", true).apply()
    }
    fun pause(value: Boolean) { prefs.edit().putBoolean("paused", value).apply() }
    fun showOverlay(value: Boolean) { prefs.edit().putBoolean("overlay", value).apply() }
    private fun today() = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
    fun count(app: String): Int = prefs.getInt("${today()}:$app", 0)
    fun todayTotal(): Int = ReelCounter.SUPPORTED.sumOf { count(it) }
    fun increment(app: String) {
        val today = today()
        val key = "$today:$app"
        val editor = prefs.edit().putInt(key, count(app) + 1).putLong("lastUpdated", System.currentTimeMillis())
        // Keep one local week; no cross-day sessions or unbounded event history.
        prefs.all.keys.filter { it.contains(":") }.forEach { old ->
            val date = runCatching { SimpleDateFormat("yyyy-MM-dd", Locale.US).parse(old.substringBefore(':')) }.getOrNull()
            if (date == null || date.time < System.currentTimeMillis() - 7L * 24 * 60 * 60 * 1000) editor.remove(old)
        }
        editor.apply()
    }
    val updated get() = prefs.getLong("lastUpdated", 0)
    fun erase() {
        val editor = prefs.edit().remove("lastUpdated")
        prefs.all.keys.filter { it.contains(":") }.forEach { editor.remove(it) }
        editor.apply()
    }
}
