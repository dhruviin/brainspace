import { NativeModules, Platform } from 'react-native';

const { BrainSpaceUsageStats } = NativeModules;

export interface AppUsageDetail {
  packageName: string;
  appName: string;
  foregroundMs: number;
  foregroundMinutes: number;
  lastTimeUsed: number;
  category: 'Productive' | 'Neutral' | 'Distracting';
}

export interface DailyUsageReport {
  startOfDayUtc: number;
  timestampUtc: number;
  totalForegroundMs: number;
  totalForegroundMinutes: number;
  productiveMinutes: number;
  neutralMinutes: number;
  distractingMinutes: number;
  apps: AppUsageDetail[];
  permissionGranted: boolean;
}

// Fallback baseline data if permission is not yet granted or non-Android environment
const FALLBACK_REPORT: DailyUsageReport = {
  startOfDayUtc: Date.now() - 14 * 60 * 60 * 1000,
  timestampUtc: Date.now(),
  totalForegroundMs: 165 * 60 * 1000,
  totalForegroundMinutes: 165, // 2h 45m
  productiveMinutes: 75,
  neutralMinutes: 40,
  distractingMinutes: 50,
  permissionGranted: false,
  apps: [
    {
      packageName: 'com.instagram.android',
      appName: 'Instagram',
      foregroundMs: 54 * 60 * 1000,
      foregroundMinutes: 54,
      lastTimeUsed: Date.now() - 10 * 60 * 1000,
      category: 'Distracting',
    },
    {
      packageName: 'com.google.android.youtube',
      appName: 'YouTube',
      foregroundMs: 42 * 60 * 1000,
      foregroundMinutes: 42,
      lastTimeUsed: Date.now() - 35 * 60 * 1000,
      category: 'Distracting',
    },
    {
      packageName: 'com.slack',
      appName: 'Slack',
      foregroundMs: 38 * 60 * 1000,
      foregroundMinutes: 38,
      lastTimeUsed: Date.now() - 5 * 60 * 1000,
      category: 'Productive',
    },
    {
      packageName: 'com.whatsapp',
      appName: 'WhatsApp',
      foregroundMs: 25 * 60 * 1000,
      foregroundMinutes: 25,
      lastTimeUsed: Date.now() - 45 * 60 * 1000,
      category: 'Neutral',
    },
  ],
};

export const UsageStatsService = {
  /**
   * Check if user has granted PACKAGE_USAGE_STATS permission
   */
  async checkPermission(): Promise<boolean> {
    if (Platform.OS !== 'android' || !BrainSpaceUsageStats) {
      return false;
    }
    try {
      return await BrainSpaceUsageStats.checkPermission();
    } catch (e) {
      console.warn('Failed to check usage permission:', e);
      return false;
    }
  },

  /**
   * Direct user to Android Settings -> Usage Access
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android' || !BrainSpaceUsageStats) {
      return false;
    }
    try {
      return await BrainSpaceUsageStats.requestPermission();
    } catch (e) {
      console.warn('Failed to open usage settings:', e);
      return false;
    }
  },

  /**
   * Query today's usage from midnight to now
   */
  async getDailyUsage(): Promise<DailyUsageReport> {
    if (Platform.OS !== 'android' || !BrainSpaceUsageStats) {
      return FALLBACK_REPORT;
    }

    try {
      const hasPermission = await BrainSpaceUsageStats.checkPermission();
      if (!hasPermission) {
        return { ...FALLBACK_REPORT, permissionGranted: false };
      }

      const nativeReport = await BrainSpaceUsageStats.getDailyUsage();
      return {
        ...nativeReport,
        permissionGranted: true,
      };
    } catch (e) {
      console.warn('Error reading native usage stats:', e);
      return FALLBACK_REPORT;
    }
  },
};
