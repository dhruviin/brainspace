import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, Fonts } from '../theme/tokens';
import { UsageStatsService, DailyUsageReport } from '../services/UsageStatsService';

interface InsightsScreenProps {
  theme: ThemeColors;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ theme }) => {
  const [timeRange, setTimeRange] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [usage, setUsage] = useState<DailyUsageReport | null>(null);

  useEffect(() => {
    refreshStats();
  }, []);

  const refreshStats = async () => {
    const data = await UsageStatsService.getDailyUsage();
    setUsage(data);
  };

  const apps = usage?.apps || [];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Insights & Analytics</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {usage?.permissionGranted ? 'Live Android UsageStats' : 'Sample Baseline (Grant access for live stats)'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: theme.surface2 }]}
          onPress={refreshStats}
        >
          <Ionicons name="refresh" size={16} color={theme.accent} />
        </TouchableOpacity>
      </View>

      {/* Permission Callout */}
      {usage && !usage.permissionGranted && (
        <TouchableOpacity
          style={[styles.permissionBox, { backgroundColor: theme.surface }]}
          onPress={() => UsageStatsService.requestPermission()}
        >
          <Ionicons name="shield-checkmark" size={18} color={theme.accent} />
          <Text style={[styles.permissionText, { color: theme.textPrimary }]}>
            Tap to Authorize Android Usage Access in System Settings
          </Text>
        </TouchableOpacity>
      )}

      {/* Spotify Signature Range Filter Pills */}
      <View style={styles.filterBar}>
        {(['Day', 'Week', 'Month'] as const).map((r) => {
          const isSelected = timeRange === r;
          return (
            <TouchableOpacity
              key={r}
              onPress={() => setTimeRange(r)}
              style={[
                styles.filterBtn,
                {
                  backgroundColor: isSelected ? theme.accent : theme.surface2,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: isSelected ? '#000000' : theme.textPrimary,
                    fontFamily: isSelected ? Fonts.bold : Fonts.medium,
                  },
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Reel Feed Diagnostics Card (Slice Minimalism) */}
      <View style={[styles.reelCard, { backgroundColor: theme.surface }]}>
        <View style={styles.reelHeader}>
          <View style={styles.reelHeaderTitle}>
            <Ionicons name="film" size={17} color={theme.warning} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Estimated Short-Form Feed Count</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: 'rgba(255, 164, 43, 0.15)' }]}>
            <Text style={[styles.badgeText, { color: theme.warning }]}>Phase 0 Gated</Text>
          </View>
        </View>

        <Text style={[styles.reelTotal, { color: theme.textPrimary }]}>38 Reels/Shorts Today</Text>
        <Text style={[styles.reelNotice, { color: theme.textSecondary }]}>
          Supported apps: Instagram (24) & YouTube Shorts (14). Operates 100% locally with zero raw screenshot uploads.
        </Text>
      </View>

      {/* App Breakdown Table */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>App Usage & Classification</Text>
      <View style={styles.appList}>
        {apps.map((item) => (
          <View key={item.packageName} style={[styles.appRow, { backgroundColor: theme.surface }]}>
            <View style={styles.appLeft}>
              <View style={[styles.appIconContainer, { backgroundColor: theme.surface2 }]}>
                <Ionicons
                  name={
                    item.category === 'Productive'
                      ? 'code-slash'
                      : item.category === 'Distracting'
                      ? 'flame'
                      : 'apps'
                  }
                  size={19}
                  color={
                    item.category === 'Productive'
                      ? theme.success
                      : item.category === 'Distracting'
                      ? theme.danger
                      : theme.textSecondary
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.appName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {item.appName}
                </Text>
                <Text style={[styles.appMeta, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.packageName}
                </Text>
              </View>
            </View>
            <View style={styles.appRight}>
              <Text style={[styles.appTime, { color: theme.textPrimary }]}>{item.foregroundMinutes}m</Text>
              <View
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor:
                      item.category === 'Productive'
                        ? 'rgba(29, 185, 84, 0.15)'
                        : item.category === 'Distracting'
                        ? 'rgba(233, 20, 41, 0.15)'
                        : 'rgba(179, 179, 179, 0.15)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color:
                        item.category === 'Productive'
                          ? theme.success
                          : item.category === 'Distracting'
                          ? theme.danger
                          : theme.textSecondary,
                    },
                  ]}
                >
                  {item.category}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 150 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  title: { fontFamily: Fonts.bold, fontSize: 24, letterSpacing: -0.3 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, marginTop: 4, marginBottom: 16, lineHeight: 18 },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  permissionText: { fontFamily: Fonts.semiBold, fontSize: 12.5, flex: 1 },
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 12.5,
    letterSpacing: 0.1,
  },
  reelCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  reelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  reelHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: { fontFamily: Fonts.bold, fontSize: 13.5 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontFamily: Fonts.bold, fontSize: 10 },
  reelTotal: {
    fontFamily: Fonts.extraBold,
    fontSize: 26,
    letterSpacing: -0.5,
    marginVertical: 6,
  },
  reelNotice: {
    fontFamily: Fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
  },
  sectionHeading: { fontFamily: Fonts.bold, fontSize: 16, marginBottom: 12 },
  appList: { gap: 10 },
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
  },
  appLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  appIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { fontFamily: Fonts.bold, fontSize: 14.5 },
  appMeta: { fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  appRight: { alignItems: 'flex-end', gap: 4 },
  appTime: { fontFamily: Fonts.bold, fontSize: 15 },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryPillText: { fontFamily: Fonts.bold, fontSize: 10 },
});
