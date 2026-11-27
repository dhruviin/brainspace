import { NativeModules, Platform } from 'react-native';

export type PermissionKey = 'usage' | 'overlay' | 'popup' | 'battery' | 'autostart' | 'accessibility';
export const reelApps = [
  { packageName: 'com.instagram.android', name: 'Instagram Reels' },
  { packageName: 'com.google.android.youtube', name: 'YouTube Shorts' },
  { packageName: 'com.zhiliaoapp.musically', name: 'TikTok' },
  { packageName: 'com.ss.android.ugc.trill', name: 'TikTok' },
  { packageName: 'com.facebook.katana', name: 'Facebook Reels' },
  { packageName: 'com.facebook.lite', name: 'Facebook Lite Reels' },
  { packageName: 'com.snapchat.android', name: 'Snapchat Spotlight' },
  { packageName: 'com.reddit.frontpage', name: 'Reddit Watch' },
  { packageName: 'com.twitter.android', name: 'X / Twitter Video' },
  { packageName: 'com.pinterest', name: 'Pinterest Watch' },
] as const;
export interface AccessSnapshot {
  available: boolean;
  xiaomi: boolean;
  manufacturer: string;
  sdk: number;
  usage: boolean;
  overlay: boolean;
  battery: boolean;
  accessibility: boolean;
  connected: boolean;
  consent: boolean;
  paused: boolean;
  showCounter: boolean;
  popupConfirmed: boolean;
  autostartConfirmed: boolean;
  batteryConfirmed: boolean;
  apps: string[];
  instagram: number;
  youtube: number;
  updated: number;
  ruleVersion: string;
}
const native = Platform.OS === 'android' ? NativeModules.BrainSpacePermissions : undefined;
export const PermissionService = {
  available: !!native,
  snapshot: async (): Promise<AccessSnapshot | null> => native ? native.getSnapshot() : null,
  open: async (key: PermissionKey): Promise<boolean> => native ? native.openSettings(key) : false,
  configure: async (apps: string[], consent: boolean): Promise<boolean> => native ? native.configureReels(apps, consent) : false,
  pause: async (paused: boolean): Promise<boolean> => native ? native.setPaused(paused) : false,
  counter: async (visible: boolean): Promise<boolean> => native ? native.setCounter(visible) : false,
  erase: async (): Promise<boolean> => native ? native.eraseReelData() : false,
  confirm: async (key: PermissionKey, value: boolean): Promise<boolean> => native ? native.confirmOem(key, value) : false,
};

// OEM confirmations remain separate from permissions verified by Android.
export function permissionStatus(key: PermissionKey, s: AccessSnapshot | null): 'granted' | 'confirmed' | 'off' {
  if (!s) return 'off';
  if (key === 'popup') return s.popupConfirmed ? 'confirmed' : 'off';
  if (key === 'autostart') return s.autostartConfirmed ? 'confirmed' : 'off';
  if (key === 'battery' && s.xiaomi) return s.batteryConfirmed ? 'confirmed' : 'off';
  return s[key as 'usage' | 'overlay' | 'battery' | 'accessibility'] ? 'granted' : 'off';
}
