import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, Fonts } from '../theme/tokens';
import { MomentumOrb } from '../components/MomentumOrb';
import { UsageStatsService, DailyUsageReport } from '../services/UsageStatsService';

interface HomeScreenProps {
  theme: ThemeColors;
  onNavigateTab: (tab: any) => void;
  onOpenUrge: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ theme, onNavigateTab, onOpenUrge }) => {
  const [usage, setUsage] = useState<DailyUsageReport | null>(null);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    const data = await UsageStatsService.getDailyUsage();
    setUsage(data);
  };

  const totalMins = usage?.totalForegroundMinutes || 165;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const formattedScreenTime = `${hours}h ${mins}m`;

  const productiveMins = usage?.productiveMinutes || 75;
  const neutralMins = usage?.neutralMinutes || 40;
  const distractingMins = usage?.distractingMinutes || 50;
  const sumMins = productiveMins + neutralMins + distractingMins || 1;

  const prodPct = Math.round((productiveMins / sumMins) * 100);
  const neutralPct = Math.round((neutralMins / sumMins) * 100);
  const distPct = Math.max(0, 100 - prodPct - neutralPct);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
          <Text style={[styles.greeting, { color: theme.textPrimary }]}>Daily Compass</Text>
        </View>
        <TouchableOpacity
          style={[styles.urgePill, { backgroundColor: theme.surface2, borderColor: theme.recovery }]}
          onPress={onOpenUrge}
        >
          <Ionicons name="sparkles" size={14} color={theme.recovery} />
          <Text style={[styles.urgePillText, { color: theme.recovery }]}>Urge SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Permission Notice Banner (if not granted) */}
      {usage && !usage.permissionGranted && (
        <TouchableOpacity
          style={[styles.permissionBanner, { backgroundColor: theme.surface2, borderColor: theme.accent }]}
          onPress={() => UsageStatsService.requestPermission()}
        >
          <Ionicons name="information-circle" size={20} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.permissionTitle, { color: theme.textPrimary }]}>Enable Usage Access</Text>
            <Text style={[styles.permissionSub, { color: theme.textSecondary }]}>
              Tap to grant Android permission for live screen time tracking
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.accent} />
        </TouchableOpacity>
      )}

      {/* Hero: Momentum Orb */}
      <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardHeaderTitle, { color: theme.textSecondary }]}>TODAY'S MOMENTUM SCORE</Text>
        <MomentumOrb score={78} theme={theme} />
        <Text style={[styles.heroSubtext, { color: theme.textSecondary }]}>
          40% Attention + 35% Focus + 25% Recovery consistency
        </Text>
      </View>

      {/* Metric Cards Row */}
      <View style={styles.metricsRow}>
        {/* Screen Time Card */}
        <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.metricCardHeader}>
            <Ionicons name="time-outline" size={18} color={theme.accent} />
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Screen Time</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{formattedScreenTime}</Text>
          <Text style={[styles.metricTrend, { color: theme.success }]}>
            {usage?.permissionGranted ? 'Live OS Stats' : 'Baseline Sample'}
          </Text>
        </View>

        {/* Reel Estimate Card */}
        <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.metricCardHeader}>
            <Ionicons name="film-outline" size={18} color={theme.warning} />
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Est. Reels</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>38</Text>
          <Text style={[styles.metricTrend, { color: theme.textSecondary }]}>IG: 24 · YT: 14</Text>
        </View>
      </View>

      {/* Category Proportions */}
      <View style={[styles.categoryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.catHeader}>
          <Text style={[styles.cardHeaderTitle, { color: theme.textSecondary }]}>ATTENTION DISTRIBUTION</Text>
          <TouchableOpacity onPress={() => onNavigateTab('insights')}>
            <Text style={[styles.linkText, { color: theme.accent }]}>View Apps →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, { flex: Math.max(5, prodPct), backgroundColor: theme.success }]} />
          <View style={[styles.progressSegment, { flex: Math.max(5, neutralPct), backgroundColor: theme.warning }]} />
          <View style={[styles.progressSegment, { flex: Math.max(5, distPct), backgroundColor: theme.danger }]} />
        </View>
        <View style={styles.catLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: theme.success }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Productive {prodPct}%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: theme.warning }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Neutral {neutralPct}%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: theme.danger }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Distracting {distPct}%</Text>
          </View>
        </View>
      </View>

      {/* Primary Focus CTA */}
      <TouchableOpacity
        style={[styles.focusCta, { backgroundColor: theme.accent }]}
        onPress={() => onNavigateTab('focus')}
      >
        <View style={styles.focusCtaLeft}>
          <Ionicons name="timer-outline" size={24} color="#FFFFFF" />
          <View>
            <Text style={styles.focusCtaTitle}>Start 25-Min Focus Block</Text>
            <Text style={styles.focusCtaSub}>Deep work mode · Distractions muted</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Recovery Habit Card */}
      <View style={[styles.habitCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.habitHeader}>
          <View style={styles.habitHeaderLeft}>
            <Ionicons name="sparkles" size={16} color={theme.recovery} />
            <Text style={[styles.cardHeaderTitle, { color: theme.recovery }]}>ACTIVE HABIT MILESTONE</Text>
          </View>
          <TouchableOpacity onPress={() => onNavigateTab('recover')}>
            <Text style={[styles.linkText, { color: theme.recovery }]}>Manage →</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.habitTitle, { color: theme.textPrimary }]}>No Doomscrolling in Bed</Text>
        <View style={styles.habitMeta}>
          <Text style={[styles.streakCount, { color: theme.textPrimary }]}>🔥 6-Day Streak</Text>
          <Text style={[styles.habitBest, { color: theme.textSecondary }]}>Best: 14 days · Total: 28 days</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  dateText: { fontFamily: Fonts.medium, fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
  greeting: { fontFamily: Fonts.bold, fontSize: 24, marginTop: 2 },
  urgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  urgePillText: { fontFamily: Fonts.bold, fontSize: 12 },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  permissionTitle: { fontFamily: Fonts.bold, fontSize: 13 },
  permissionSub: { fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  heroCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderTitle: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1 },
  heroSubtext: { fontFamily: Fonts.medium, fontSize: 12, textAlign: 'center', marginTop: 6 },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  metricLabel: { fontFamily: Fonts.medium, fontSize: 12 },
  metricValue: { fontFamily: Fonts.extraBold, fontSize: 22, marginBottom: 4 },
  metricTrend: { fontFamily: Fonts.medium, fontSize: 11 },
  categoryCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkText: { fontFamily: Fonts.semiBold, fontSize: 13 },
  progressBar: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressSegment: { height: '100%' },
  catLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontFamily: Fonts.medium, fontSize: 11 },
  focusCta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    marginBottom: 16,
  },
  focusCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  focusCtaTitle: { fontFamily: Fonts.bold, color: '#FFFFFF', fontSize: 16 },
  focusCtaSub: { fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  habitCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  habitTitle: { fontFamily: Fonts.bold, fontSize: 16, marginBottom: 8 },
  habitMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakCount: { fontFamily: Fonts.bold, fontSize: 14 },
  habitBest: { fontFamily: Fonts.regular, fontSize: 12 },
});
