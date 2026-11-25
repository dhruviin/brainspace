"""Build a synthetic ID/event fixture APK into /tmp. Never installs it on a device."""
import os
from pathlib import Path
import subprocess
import zipfile

SOURCE = Path(__file__).resolve().parent
ROOT = SOURCE.parents[1]
SDK = Path(os.environ.get('ANDROID_SDK_ROOT', str(Path.home() / 'Library/Android/sdk')))
JAVA = Path('/usr/local/opt/openjdk@17/bin')
BUILD = SDK / 'build-tools/37.0.0'
JAR = SDK / 'platforms/android-37.0/android.jar'
OUT = Path('/tmp/brainspace-reel-fixture')
for name in ['res/values', 'gen', 'classes', 'dex']:
    (OUT / name).mkdir(parents=True, exist_ok=True)
(OUT/'res/values/ids.xml').write_text('<resources><item type="id" name="clips_viewer_view_pager"/><item type="id" name="comments_bottom_sheet"/><item type="id" name="ordinary_feed"/></resources>')
(OUT/'AndroidManifest.xml').write_text('''<manifest xmlns:android="http://schemas.android.com/apk/res/android" package="com.instagram.android"><uses-sdk android:minSdkVersion="24" android:targetSdkVersion="36"/><application android:label="BrainSpace QA fixture" android:theme="@android:style/Theme.Material.Light.NoActionBar"><activity android:name="fixture.FeedFixture" android:exported="true"><intent-filter><action android:name="android.intent.action.MAIN"/><category android:name="android.intent.category.LAUNCHER"/></intent-filter></activity></application></manifest>''')
def run(*args): subprocess.run([str(a) for a in args],check=True)
run(BUILD/'aapt2','compile','--dir',OUT/'res','-o',OUT/'resources.zip')
run(BUILD/'aapt2','link','-o',OUT/'base.apk','--manifest',OUT/'AndroidManifest.xml','-I',JAR,'--java',OUT/'gen',OUT/'resources.zip')
run(JAVA/'javac','-source','8','-target','8','-classpath',JAR,'-d',OUT/'classes',SOURCE/'FeedFixture.java')
env = os.environ.copy(); env['JAVA_HOME'] = str(JAVA.parent)
subprocess.run([str(BUILD/'d8'),'--lib',str(JAR),'--min-api','24','--output',str(OUT/'dex'),*[str(p) for p in (OUT/'classes').rglob('*.class')]],env=env,check=True)
with zipfile.ZipFile(OUT/'base.apk','a') as z: z.write(OUT/'dex/classes.dex','classes.dex')
run(BUILD/'zipalign','-f','4',OUT/'base.apk',OUT/'fixture.apk')
subprocess.run([str(BUILD/'apksigner'),'sign','--ks',str(ROOT/'android/app/debug.keystore'),'--ks-pass','pass:android','--key-pass','pass:android',str(OUT/'fixture.apk')],env=env,check=True)
print(OUT/'fixture.apk')
