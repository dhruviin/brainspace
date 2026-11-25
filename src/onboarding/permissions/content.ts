import type { PermissionKey } from '../../services/PermissionService';

export const permissions: Record<PermissionKey, { title: string; detail: string; icon: string; steps: string[]; why: string }> = {
  usage: {
    title: 'Understand your phone time', detail: 'App names and time spent, from Android.', icon: 'time-outline',
    steps: ['Find BrainSpace in Usage access.', 'Turn on Permit usage access.', 'Return here. We’ll check the setting.'],
    why: 'Usage Access lets BrainSpace read app names and foreground time from Android. It cannot identify individual reels or read your messages. Focus and habit tools work without this access.',
  },
  overlay: {
    title: 'See your live counter', detail: 'A small estimate over supported feeds.', icon: 'layers-outline',
    steps: ['Find BrainSpace in Display over other apps.', 'Allow display over other apps.', 'Return here to turn on the optional counter.'],
    why: 'Display over other apps lets BrainSpace show a small estimated count while you use supported feeds. It appears only while counting, can be tapped to hide, and never blocks you from leaving an app. Reel estimates also work without the floating counter.',
  },
  popup: {
    title: 'Allow popup windows', detail: 'Extra Xiaomi permission for the counter.', icon: 'browsers-outline',
    steps: ['In BrainSpace app info, open Other permissions.', 'Choose Open new windows while running in the background (or Display popup windows).', 'Choose Always allow. Return and confirm your choice.'],
    why: 'Some Xiaomi, Redmi and POCO phones separately control background popup windows. This may be needed if the optional counter does not appear. Android does not provide a reliable public check for this setting; we record only your confirmation.',
  },
  battery: {
    title: 'Keep counting available', detail: 'Optional if your phone stops the service.', icon: 'battery-half-outline',
    steps: ['Find BrainSpace in battery or app battery settings.', 'If counting stops in the background, review Unrestricted / No restrictions.', 'Return here. Keeping your default is fine if counting works.'],
    why: 'Aggressive battery settings can interrupt counting. Try the default first. Removing restrictions can use more battery and is optional. On Xiaomi, “No restrictions” is an OEM setting and is recorded only when you confirm it.',
  },
  autostart: {
    title: 'Allow background autostart', detail: 'Optional help after a phone restart.', icon: 'refresh-outline',
    steps: ['Open Settings → Apps → Permissions → Background autostart.', 'Find BrainSpace and enable its switch.', 'Return here and confirm what you changed.'],
    why: 'Xiaomi may prevent an enabled Accessibility service from reconnecting after a restart. Background autostart can help, but does not guarantee uninterrupted counting. This setting cannot be reliably verified through Android; we keep your confirmation separate.',
  },
  accessibility: {
    title: 'Estimate Reels & Shorts', detail: 'Instagram and YouTube · experimental.', icon: 'film-outline',
    steps: ['Open Downloaded apps / Installed services, then BrainSpace reel estimates.', 'Review Use BrainSpace and Android’s access warning. Confirm only if you agree; wait for any device countdown.', 'Return here. Access is checked automatically.'],
    why: 'Accessibility can expose sensitive screen information. BrainSpace uses feed view identifiers and scroll positions only inside the apps you choose, to estimate reel views. It does not read messages, captions, passwords or media, take screenshots, or perform taps or gestures. Only daily counts are saved on this device; nothing from this detector is uploaded. Counts may miss or misclassify activity when app layouts change. Pause, change apps or erase counts anytime in Profile; disable the service in Android settings.',
  },
};
