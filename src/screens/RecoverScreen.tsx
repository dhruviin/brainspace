import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, Fonts } from '../theme/tokens';
import { HabitItem } from '../types';

interface RecoverScreenProps {
  theme: ThemeColors;
  onOpenUrge: () => void;
}

export const RecoverScreen: React.FC<RecoverScreenProps> = ({ theme, onOpenUrge }) => {
  const [habits, setHabits] = useState<HabitItem[]>([
    {
      id: '1',
      title: 'No Doomscrolling in Bed',
      category: 'reduce',
      currentStreakDays: 6,
      bestStreakDays: 14,
      totalDays: 28,
      lastCheckIn: 'Today',
    },
    {
      id: '2',
      title: 'Mindful Morning Reset',
      category: 'build',
      currentStreakDays: 4,
      bestStreakDays: 9,
      totalDays: 19,
      lastCheckIn: 'Today',
    },
  ]);

  const handleCheckIn = (id: string, type: 'good' | 'tough' | 'skip') => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          if (type === 'good') {
            return {
              ...h,
              currentStreakDays: h.currentStreakDays + 1,
              totalDays: h.totalDays + 1,
              bestStreakDays: Math.max(h.bestStreakDays, h.currentStreakDays + 1),
            };
          } else if (type === 'tough') {
            return { ...h, currentStreakDays: 0 };
          }
        }
        return h;
      })
    );
    Alert.alert('Check-in Logged', 'Your event ledger is updated locally with zero shame.');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Private Habit Recovery</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Local-first event ledger · Free tier includes 2 private goals with zero guilt
      </Text>

      {/* Urge SOS Banner (Spotify Green Pill / Card) */}
      <TouchableOpacity
        activeOpacity={0.88}
        style={[styles.sosBanner, { backgroundColor: theme.surface }]}
        onPress={onOpenUrge}
      >
        <View style={styles.sosLeft}>
          <View style={[styles.sosIconCircle, { backgroundColor: 'rgba(29, 185, 84, 0.15)' }]}>
            <Ionicons name="heart" size={22} color={theme.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sosTitle, { color: theme.textPrimary }]}>Experiencing an Urge Right Now?</Text>
            <Text style={[styles.sosSub, { color: theme.accent }]}>Tap here for 1-click guided grounding</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.accent} />
      </TouchableOpacity>

      {/* Habits List */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Active Recovery Goals</Text>
      <View style={styles.habitsList}>
        {habits.map((habit) => (
          <View key={habit.id} style={[styles.habitCard, { backgroundColor: theme.surface }]}>
            <View style={styles.cardTop}>
              <View>
                <Text style={[styles.habitName, { color: theme.textPrimary }]}>{habit.title}</Text>
                <Text style={[styles.habitCategory, { color: theme.textSecondary }]}>
                  Mode: {habit.category.toUpperCase()} · Encrypted locally
                </Text>
              </View>
              <View style={[styles.streakBadge, { backgroundColor: 'rgba(29, 185, 84, 0.15)' }]}>
                <Text style={[styles.streakBadgeText, { color: theme.accent }]}>🔥 {habit.currentStreakDays} Days</Text>
              </View>
            </View>

            {/* Progress Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>{habit.totalDays}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Clean Days</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>{habit.bestStreakDays}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Best Record</Text>
              </View>
            </View>

            {/* Daily Check-in buttons */}
            <Text style={[styles.checkInTitle, { color: theme.textSecondary }]}>Log Today's Reflection:</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.checkBtn, { backgroundColor: 'rgba(29, 185, 84, 0.15)' }]}
                onPress={() => handleCheckIn(habit.id, 'good')}
              >
                <Text style={[styles.checkBtnText, { color: theme.accent }]}>👍 Held Strong</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkBtn, { backgroundColor: 'rgba(233, 20, 41, 0.15)' }]}
                onPress={() => handleCheckIn(habit.id, 'tough')}
              >
                <Text style={[styles.checkBtnText, { color: theme.danger }]}>Tough Moment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkBtn, { backgroundColor: theme.surface2 }]}
                onPress={() => handleCheckIn(habit.id, 'skip')}
              >
                <Text style={[styles.checkBtnText, { color: theme.textSecondary }]}>Skip</Text>
              </TouchableOpacity>
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
  title: { fontFamily: Fonts.bold, fontSize: 24, marginTop: 10, letterSpacing: -0.3 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, marginTop: 4, marginBottom: 18, lineHeight: 18 },
  sosBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 22,
  },
  sosLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  sosIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosTitle: { fontFamily: Fonts.bold, fontSize: 14 },
  sosSub: { fontFamily: Fonts.semiBold, fontSize: 12, marginTop: 2 },
  sectionHeading: { fontFamily: Fonts.bold, fontSize: 16, marginBottom: 12 },
  habitsList: { gap: 14 },
  habitCard: {
    padding: 18,
    borderRadius: 20,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  habitName: { fontFamily: Fonts.bold, fontSize: 16 },
  habitCategory: { fontFamily: Fonts.regular, fontSize: 11, marginTop: 3 },
  streakBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  streakBadgeText: { fontFamily: Fonts.bold, fontSize: 12 },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  statBox: { flex: 1 },
  statValue: { fontFamily: Fonts.extraBold, fontSize: 22 },
  statLabel: { fontFamily: Fonts.medium, fontSize: 11, marginTop: 2 },
  checkInTitle: { fontFamily: Fonts.semiBold, fontSize: 12, marginBottom: 8 },
  actionsRow: { flexDirection: 'row', gap: 8 },
  checkBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  checkBtnText: { fontFamily: Fonts.bold, fontSize: 12 },
});
