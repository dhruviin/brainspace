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
  const [activeChip, setActiveChip] = useState<'All' | 'Focus' | 'Insights' | 'Recovery'>('All');
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
      {/* Spotify + Slice Top Bar: Profile Avatar + Greeting + Urge Pill */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            style={styles.avatarPill}
            onPress={() => onNavigateTab('profile')}
            accessibilityLabel="Open Profile"
          >
            <Text style={styles.avatarText}>B</Text>
          </TouchableOpacity>
          <View>
            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
            <Text style={[styles.greeting, { color: theme.textPrimary }]}>Daily Compass</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.urgePill, { backgroundColor: theme.surface2 }]}
          onPress={onOpenUrge}
        >
          <Ionicons name="sparkles" size={13} color={theme.accent} />
          <Text style={[styles.urgePillText, { color: theme.accent }]}>Urge SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Spotify Signature Filter Chips (Slice minimal style) */}
      <View style={styles.chipsRow}>
        {(['All', 'Focus', 'Insights', 'Recovery'] as const).map((chip) => {
          const isSelected = activeChip === chip;
          return (
            <TouchableOpacity
              key={chip}
              onPress={() => {
                setActiveChip(chip);
                if (chip === 'Focus') onNavigateTab('focus');
                if (chip === 'Insights') onNavigateTab('insights');
                if (chip === 'Recovery') onNavigateTab('recover');
              }}
              style={[
                styles.chipPill,
                {
                  backgroundColor: isSelected ? theme.accent : theme.surface2,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? '#000000' : theme.textPrimary,
                    fontFamily: isSelected ? Fonts.bold : Fonts.medium,
                  },
                ]}
              >
                {chip}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Permission Notice Banner (if not granted) */}
      {usage && !usage.permissionGranted && (
        <TouchableOpacity
          style={[styles.permissionBanner, { backgroundColor: theme.surface }]}
          onPress={() => UsageStatsService.requestPermission()}
        >
          <Ionicons name="shield-checkmark" size={18} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.permissionTitle, { color: theme.textPrimary }]}>Enable Usage Access</Text>
            <Text style={[styles.permissionSub, { color: theme.textSecondary }]}>
              Grant Android permission for live screen time tracking
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Hero: Slice Minimalist Momentum Score Card */}
      <View style={[styles.heroCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.cardHeaderTitle, { color: theme.textSecondary }]}>TODAY'S MOMENTUM SCORE</Text>
        <MomentumOrb score={78} theme={theme} />
        <Text style={[styles.heroSubtext, { color: theme.textSecondary }]}>
          40% Attention + 35% Focus + 25% Recovery consistency
        </Text>
      </View>

      {/* Metric Cards Row (Slice Large Numbers + Spotify Surface) */}
      <View style={styles.metricsRow}>
        {/* Screen Time Card */}
        <View style={[styles.metricCard, { backgroundColor: theme.surface }]}>
          <View style={styles.metricCardHeader}>
            <Ionicons name="time" size={16} color={theme.accent} />
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Screen Time</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{formattedScreenTime}</Text>
          <Text style={[styles.metricTrend, { color: theme.success }]}>
            {usage?.permissionGranted ? 'Live OS Stats' : 'Baseline Sample'}
          </Text>
        </View>

        {/* Reel Estimate Card */}
        <View style={[styles.metricCard, { backgroundColor: theme.surface }]}>
          <View style={styles.metricCardHeader}>
            <Ionicons name="film" size={16} color={theme.warning} />
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Est. Reels</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>38</Text>
          <Text style={[styles.metricTrend, { color: theme.textSecondary }]}>IG: 24 · YT: 14</Text>
        </View>
      </View>

      {/* Category Proportions: Clean Slice Bar */}
      <View style={[styles.categoryCard, { backgroundColor: theme.surface }]}>
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

      {/* Primary Spotify Play / Focus CTA Button */}
      <TouchableOpacity
        activeOpacity={0.88}
        style={[styles.focusCta, { backgroundColor: theme.accent }]}
        onPress={() => onNavigateTab('focus')}
      >
        <View style={styles.focusCtaLeft}>
          <Ionicons name="play" size={20} color="#000000" />
          <Text style={styles.focusCtaTitle}>Start 25-Min Focus Block</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#000000" />
      </TouchableOpacity>

      {/* Recovery Habit Card */}
      <View style={[styles.habitCard, { backgroundColor: theme.surface }]}>
        <View style={styles.habitHeader}>
          <View style={styles.habitHeaderLeft}>
            <Ionicons name="sparkles" size={15} color={theme.accent} />
            <Text style={[styles.cardHeaderTitle, { color: theme.accent }]}>ACTIVE HABIT MILESTONE</Text>
          </View>
          <TouchableOpacity onPress={() => onNavigateTab('recover')}>
            <Text style={[styles.linkText, { color: theme.accent }]}>Manage →</Text>
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
  content: { padding: 18, paddingBottom: 150 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 6,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#242424',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  dateText: {
    fontFamily: Fonts.medium,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  greeting: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    letterSpacing: -0.3,
  },
  urgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  urgePillText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chipPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  chipText: {
    fontSize: 12,
    letterSpacing: 0.1,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
  },
  permissionTitle: { fontFamily: Fonts.bold, fontSize: 13 },
  permissionSub: { fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  heroCard: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeaderTitle: {
    fontFamily: Fonts.bold,
    fontSize: 10.5,
    letterSpacing: 1.2,
  },
  heroSubtext: {
    fontFamily: Fonts.medium,
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
  },
  metricCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metricLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  metricValue: {
    fontFamily: Fonts.extraBold,
    fontSize: 24,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  metricTrend: {
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
  categoryCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 14,
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12.5,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
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
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontFamily: Fonts.medium, fontSize: 11 },
  focusCta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 28,
    marginBottom: 14,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  focusCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  focusCtaTitle: {
    fontFamily: Fonts.bold,
    color: '#000000',
    fontSize: 15,
    letterSpacing: 0.1,
  },
  habitCard: {
    padding: 18,
    borderRadius: 20,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  habitHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  habitTitle: { fontFamily: Fonts.bold, fontSize: 16, marginBottom: 6 },
  habitMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  streakCount: { fontFamily: Fonts.bold, fontSize: 13.5 },
  habitBest: { fontFamily: Fonts.regular, fontSize: 11.5 },
});
