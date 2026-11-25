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

// Missing permission is an empty state, never fabricated activity.
const emptyReport = (): DailyUsageReport => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  return {
    startOfDayUtc: midnight.getTime(), timestampUtc: now.getTime(),
    totalForegroundMs: 0, totalForegroundMinutes: 0,
    productiveMinutes: 0, neutralMinutes: 0, distractingMinutes: 0,
    apps: [], permissionGranted: false,
  };
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
      return emptyReport();
    }

    try {
      const hasPermission = await BrainSpaceUsageStats.checkPermission();
      if (!hasPermission) {
        return emptyReport();
      }

      const nativeReport = await BrainSpaceUsageStats.getDailyUsage();
      return {
        ...nativeReport,
        permissionGranted: true,
      };
    } catch (e) {
      console.warn('Error reading native usage stats:', e);
      return emptyReport();
    }
  },
};
