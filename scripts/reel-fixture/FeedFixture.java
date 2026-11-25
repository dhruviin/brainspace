package fixture;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

/** Synthetic metadata fixture, never an Instagram/YouTube implementation. */
public class FeedFixture extends Activity {
    int page = 0;
    View pager;
    View comments;
    boolean ordinary = false;
    int id(String name) { return getResources().getIdentifier(name, "id", getPackageName()); }
    void event(View source, int position) {
        AccessibilityEvent e = AccessibilityEvent.obtain(AccessibilityEvent.TYPE_VIEW_SCROLLED);
        e.setPackageName(getPackageName()); e.setClassName("androidx.viewpager.widget.ViewPager");
        e.setSource(source); e.setFromIndex(position); e.setToIndex(position); e.setItemCount(100);
        source.sendAccessibilityEventUnchecked(e);
    }
    void button(LinearLayout root, String label, Runnable action) {
        Button b = new Button(this); b.setText(label); b.setOnClickListener(v -> action.run()); root.addView(b);
    }
    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        LinearLayout root = new LinearLayout(this); root.setOrientation(LinearLayout.VERTICAL); root.setPadding(20,60,20,20);
        TextView title = new TextView(this); title.setText("BrainSpace synthetic feed QA — no real media"); root.addView(title);
        pager = new View(this); pager.setId(id("clips_viewer_view_pager")); pager.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_YES);
        pager.setAccessibilityDelegate(new View.AccessibilityDelegate() {
            @Override public void onInitializeAccessibilityNodeInfo(View host, AccessibilityNodeInfo info) {
                super.onInitializeAccessibilityNodeInfo(host, info); info.setScrollable(true);
            }
        });
        root.addView(pager, new LinearLayout.LayoutParams(-1,200));
        comments = new View(this); comments.setId(id("comments_bottom_sheet")); comments.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_YES);
        root.addView(comments, new LinearLayout.LayoutParams(-1,80)); comments.setVisibility(View.INVISIBLE);
        button(root,"Next reel",() -> event(pager, ++page));
        button(root,"Repeat event",() -> event(pager, page));
        button(root,"Open comments",() -> comments.setVisibility(View.VISIBLE));
        button(root,"Comment scroll",() -> event(comments, 12));
        button(root,"Close comments",() -> comments.setVisibility(View.INVISIBLE));
        button(root,"Toggle ordinary feed",() -> { ordinary=!ordinary; pager.setId(id(ordinary ? "ordinary_feed" : "clips_viewer_view_pager")); });
        setContentView(root);
        pager.postDelayed(() -> event(pager,page),700);
    }
}
