"""Generate original, silent setup illustrations. Requires Pillow and ffmpeg; no reference footage."""
from pathlib import Path
import math
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'permissions'
OUT.mkdir(parents=True, exist_ok=True)
FONT = ROOT / 'assets' / 'fonts'
def font(size, bold=False):
    return ImageFont.truetype(str(FONT / ('Poppins-Bold.ttf' if bold else 'Poppins-Regular.ttf')), size)

GUIDES = {
    'usage': [('Usage access', 'Choose BrainSpace', ['App usage access', 'BrainSpace', 'Not allowed']), ('BrainSpace', 'Allow usage access', ['Permit usage access', 'App names and time', 'You stay in control']), ('BrainSpace', 'Return to BrainSpace', ['Usage access allowed', 'Verified on return', 'Use the back button'])],
    'overlay': [('Display over apps', 'Choose BrainSpace', ['Display over other apps', 'BrainSpace', 'Not allowed']), ('BrainSpace', 'Turn on the switch', ['Allow display over apps', 'Live estimated counter', 'Optional, always']), ('BrainSpace', 'Return to BrainSpace', ['Display over apps allowed', 'Verified on return', 'Use the back button'])],
    'popup': [('App info', 'Open Other permissions', ['BrainSpace', 'Notifications', 'Other permissions']), ('Other permissions', 'Choose background popups', ['Open new windows', 'while in background', 'BrainSpace']), ('Popup windows', 'Choose Always allow', ['Always allow', 'Return to BrainSpace', 'Confirm your choice'])],
    'battery': [('Battery settings', 'Choose BrainSpace', ['App battery usage', 'BrainSpace', 'Battery saver']), ('BrainSpace', 'Review background use', ['Unrestricted', 'Optimized', 'Restricted']), ('Background use', 'Optional if counting stops', ['May use more battery', 'Return to BrainSpace', 'Keep default if it works'])],
    'autostart': [('App permissions', 'Open Background autostart', ['Apps', 'Permissions', 'Background autostart']), ('Background autostart', 'Enable BrainSpace', ['BrainSpace', 'Allow background start', 'Other apps unchanged']), ('BrainSpace', 'Return and confirm', ['Setting changed by you', 'Cannot verify on Xiaomi', 'Confirm in BrainSpace'])],
    'accessibility': [('Accessibility', 'Open Downloaded apps', ['Downloaded apps', 'Installed services', 'BrainSpace reel estimates']), ('BrainSpace', 'Review Android disclosure', ['Use BrainSpace', 'Reel estimates only', 'Selected apps only']), ('Android disclosure', 'Confirm only if you agree', ['Read the system warning', 'Wait for any countdown', 'Return to BrainSpace'])],
}
for key, steps in GUIDES.items():
    target = OUT / f'{key}.mp4'
    proc = subprocess.Popen(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '640x360', '-r', '15', '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(target)], stdin=subprocess.PIPE)
    for frame in range(135):
        step = frame // 45
        local = frame % 45 / 45
        title, action, rows = steps[step]
        im = Image.new('RGB', (640,360), '#121212'); d = ImageDraw.Draw(im)
        d.rounded_rectangle((32,12,250,348), radius=26, fill='#242424', outline='#404040', width=2)
        d.rounded_rectangle((42,28,240,332), radius=18, fill='#181818')
        d.rounded_rectangle((113,20,170,27), radius=4, fill='#080808')
        d.text((56,54), '‹  Settings', font=font(12), fill='#B3B3B3')
        # Wrapped headings fit within the illustrated phone at every font size.
        import textwrap
        for n, line in enumerate(textwrap.wrap(title, 19)):
            d.text((56,85+n*19), line, font=font(14,True), fill='white')
        for n, row in enumerate(rows):
            y = 147+n*46
            selected = n == (step % 3)
            d.rounded_rectangle((51,y,231,y+39), radius=5, fill='#1B3D27' if selected else '#242424')
            d.text((59,y+10), row, font=font(10), fill='#FFFFFF')
        if step == 1:
            d.rounded_rectangle((186,156,221,175),radius=10,fill='#1DB954')
            d.ellipse((204,159,218,173),fill='white')
        radius = int(10 + 6*math.sin(local*math.pi))
        cy = 167+(step%3)*46
        d.ellipse((214-radius,cy-radius,214+radius,cy+radius),outline='#1DB954',width=3)
        d.text((287,48), 'BRAINSPACE GUIDE', font=font(13,True), fill='#1DB954')
        d.text((287,90), f'0{step+1}', font=font(37,True), fill='#FFFFFF')
        for n,line in enumerate(textwrap.wrap(action, 22)):
            d.text((287,155+n*30),line,font=font(22,True),fill='white')
        for n in range(3):
            d.rounded_rectangle((287+n*94,265,367+n*94,269),radius=2,fill='#1DB954' if n<=step else '#404040')
        d.text((287,292), 'Illustration · menus may vary',font=font(12),fill='#B3B3B3')
        proc.stdin.write(im.tobytes())
    proc.stdin.close()
    if proc.wait() != 0: raise RuntimeError(f'Encoding failed: {key}')
    print(target.name, target.stat().st_size)
