package com.brainspace.app.reels

import org.junit.Assert.*
import org.junit.Test

class ReelCounterTest {
    private val ig = "com.instagram.android"
    private fun sample(time: Long, page: Int = -1, scroll: Boolean = false, visible: Boolean = true, blocked: Boolean = false, app: String = ig, y: Int = -1) =
        ReelCounter.Sample(app, visible, blocked, scroll, page, y, 1000, time)

    @Test fun feedEntryAndDistinctPagesCountButEventBurstsDoNot() {
        val c = ReelCounter()
        assertTrue(c.observe(sample(1000, 0, true)))
        assertFalse(c.observe(sample(1100, 0, true)))
        assertFalse(c.observe(sample(1700)))
        assertTrue(c.observe(sample(2000, 1, true)))
        assertFalse(c.observe(sample(2100, 1, true)))
        assertTrue(c.observe(sample(3000, 0, true))) // a deliberate rewatch is another view
    }
    @Test fun ordinaryFeedStoriesUnknownAppsAndNestedScrollsNeverCount() {
        val c = ReelCounter()
        assertFalse(c.observe(sample(1000, visible = false)))
        assertFalse(c.observe(sample(2000, app = "com.whatsapp")))
        assertTrue(c.observe(sample(3000, 0, true)))
        assertFalse(c.observe(sample(4000, 1, false)))
        assertTrue(c.observe(sample(5000, 1, true)))
    }
    @Test fun commentSheetDoesNotCountOrRecountTheUnderlyingReel() {
        val c = ReelCounter()
        assertTrue(c.observe(sample(1000, 0, true)))
        assertFalse(c.observe(sample(2000, 1, true, blocked = true)))
        assertFalse(c.observe(sample(3000, 0, true)))
        assertTrue(c.observe(sample(4000, 1, true)))
    }
    @Test fun offsetFallbackRejectsSmallDragsAndRepeatedPositions() {
        val c = ReelCounter()
        assertTrue(c.observe(sample(1000, scroll = true, y = 0)))
        assertFalse(c.observe(sample(2000, scroll = true, y = 200)))
        assertTrue(c.observe(sample(3000, scroll = true, y = 1000)))
        assertFalse(c.observe(sample(4000, scroll = true, y = 1000)))
    }
    @Test fun firstIndexAfterEntryIsBaselineNotASecondView() {
        val c = ReelCounter()
        assertTrue(c.observe(sample(1000)))
        assertFalse(c.observe(sample(2000, 7, true)))
        assertTrue(c.observe(sample(3000, 8, true)))
        c.reset()
        assertTrue(c.observe(sample(4000, 0, true)))
    }
    @Test fun rapidDuplicateTransitionsAreDebounced() {
        val c = ReelCounter()
        assertTrue(c.observe(sample(1000, 0, true)))
        assertFalse(c.observe(sample(1100, 1, true)))
        assertFalse(c.observe(sample(1600, 1, true)))
        assertTrue(c.observe(sample(2000, 2, true)))
    }
    @Test fun appSwitchStartsIndependentRecognisedVisit() {
        val c = ReelCounter()
        assertTrue(c.observe(sample(1000, 0, true)))
        assertTrue(c.observe(sample(2000, 0, true, app = "com.google.android.youtube")))
        assertFalse(c.observe(sample(3000, visible = false)))
        assertTrue(c.observe(sample(4000, 0, true)))
    }
}
