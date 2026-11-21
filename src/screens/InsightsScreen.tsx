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
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Insights & Analytics</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {usage?.permissionGranted ? 'Live Android UsageStats' : 'Sample Baseline (Grant access for live stats)'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
          onPress={refreshStats}
        >
          <Ionicons name="refresh" size={16} color={theme.accent} />
        </TouchableOpacity>
      </View>

      {/* Permission Callout */}
      {usage && !usage.permissionGranted && (
        <TouchableOpacity
          style={[styles.permissionBox, { backgroundColor: theme.surface2, borderColor: theme.accent }]}
          onPress={() => UsageStatsService.requestPermission()}
        >
          <Ionicons name="shield-checkmark-outline" size={18} color={theme.accent} />
          <Text style={[styles.permissionText, { color: theme.textPrimary }]}>
            Tap to Authorize Android Usage Access in System Settings
          </Text>
        </TouchableOpacity>
      )}

      {/* Range Filter */}
      <View style={[styles.filterBar, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
        {(['Day', 'Week', 'Month'] as const).map((r) => {
          const isSelected = timeRange === r;
          return (
            <TouchableOpacity
              key={r}
              onPress={() => setTimeRange(r)}
              style={[styles.filterBtn, isSelected && { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isSelected ? theme.accent : theme.textSecondary, fontWeight: isSelected ? '700' : '500' },
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Reel Feed Diagnostics Card */}
      <View style={[styles.reelCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.reelHeader}>
          <View style={styles.reelHeaderTitle}>
            <Ionicons name="film" size={18} color={theme.warning} />
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Estimated Short-Form Feed Count</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: 'rgba(245, 185, 66, 0.15)' }]}>
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
          <View key={item.packageName} style={[styles.appRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.appLeft}>
              <View style={[styles.appIconContainer, { backgroundColor: theme.surface2 }]}>
                <Ionicons
                  name={
                    item.category === 'Productive'
                      ? 'code-slash-outline'
                      : item.category === 'Distracting'
                      ? 'flame-outline'
                      : 'apps-outline'
                  }
                  size={20}
                  color={item.category === 'Productive' ? theme.success : item.category === 'Distracting' ? theme.danger : theme.textSecondary}
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
                        ? 'rgba(0, 186, 124, 0.15)'
                        : item.category === 'Distracting'
                        ? 'rgba(244, 33, 46, 0.15)'
                        : 'rgba(146, 153, 163, 0.15)',
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
  content: { padding: 20, paddingBottom: 150 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  title: { fontFamily: Fonts.bold, fontSize: 24 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, marginTop: 4, marginBottom: 16, lineHeight: 18 },
  refreshBtn: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  permissionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  permissionText: { fontFamily: Fonts.semiBold, fontSize: 12, flex: 1 },
  filterBar: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterText: { fontFamily: Fonts.medium, fontSize: 13 },
  reelCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
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
  },
  cardTitle: { fontFamily: Fonts.bold, fontSize: 14 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontFamily: Fonts.bold, fontSize: 11 },
  reelTotal: { fontFamily: Fonts.extraBold, fontSize: 28, marginBottom: 6 },
  reelNotice: { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 18 },
  sectionHeading: { fontFamily: Fonts.bold, fontSize: 16, marginBottom: 12 },
  appList: { gap: 10 },
  appRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { fontFamily: Fonts.semiBold, fontSize: 15 },
  appMeta: { fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  appRight: { alignItems: 'flex-end', gap: 4, marginLeft: 10 },
  appTime: { fontFamily: Fonts.bold, fontSize: 15 },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryPillText: { fontFamily: Fonts.bold, fontSize: 10 },
});
