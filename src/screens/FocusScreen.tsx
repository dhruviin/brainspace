import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, Fonts } from '../theme/tokens';
import { FocusSessionLog } from '../types';

interface FocusScreenProps {
  theme: ThemeColors;
}

export const FocusScreen: React.FC<FocusScreenProps> = ({ theme }) => {
  const [selectedPreset, setSelectedPreset] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<FocusSessionLog[]>([
    { id: '1', mode: 'pomodoro', durationMinutes: 25, completedAt: 'Today, 11:30 AM', tag: 'Deep Work' },
    { id: '2', mode: 'pomodoro', durationMinutes: 25, completedAt: 'Today, 02:15 PM', tag: 'Reading' },
  ]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      setSessionLogs((prev) => [
        {
          id: Date.now().toString(),
          mode: 'pomodoro',
          durationMinutes: selectedPreset,
          completedAt: 'Just now',
          tag: 'Focus Session',
        },
        ...prev,
      ]);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, selectedPreset]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsLeft(selectedPreset * 60);
  };

  const selectPreset = (mins: number) => {
    setSelectedPreset(mins);
    setIsActive(false);
    setSecondsLeft(mins * 60);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Focus Engine</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Deterministic monotonic timer · Offline-first state persistence
      </Text>

      {/* Presets Row */}
      <View style={styles.presetsRow}>
        {[15, 25, 45, 60].map((mins) => {
          const isSelected = selectedPreset === mins;
          return (
            <TouchableOpacity
              key={mins}
              onPress={() => selectPreset(mins)}
              style={[
                styles.presetPill,
                {
                  backgroundColor: isSelected ? theme.accent : theme.surface2,
                  borderColor: isSelected ? theme.accent : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.presetText,
                  { color: isSelected ? '#FFFFFF' : theme.textPrimary, fontWeight: isSelected ? '700' : '500' },
                ]}
              >
                {mins} min
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Timer Display Card */}
      <View style={[styles.timerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.timerMode, { color: theme.accent }]}>POMODORO INTERVAL</Text>
        <Text style={[styles.timerDigits, { color: theme.textPrimary }]}>{formattedTime}</Text>
        <Text style={[styles.timerStatus, { color: theme.textSecondary }]}>
          {isActive ? 'Session Active · Distractions Filtered' : 'Ready to Start'}
        </Text>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: isActive ? theme.warning : theme.accent }]}
            onPress={toggleTimer}
          >
            <Ionicons name={isActive ? 'pause' : 'play'} size={24} color="#FFFFFF" />
            <Text style={styles.actionBtnText}>{isActive ? 'Pause' : 'Start Focus'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: theme.surface3, borderColor: theme.border }]}
            onPress={resetTimer}
          >
            <Ionicons name="refresh" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Session History */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Today's Completed Blocks</Text>
      <View style={styles.historyList}>
        {sessionLogs.map((log) => (
          <View key={log.id} style={[styles.historyRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.historyLeft}>
              <View style={[styles.checkCircle, { backgroundColor: 'rgba(0, 186, 124, 0.15)' }]}>
                <Ionicons name="checkmark" size={16} color={theme.success} />
              </View>
              <View>
                <Text style={[styles.historyTag, { color: theme.textPrimary }]}>{log.tag}</Text>
                <Text style={[styles.historyTime, { color: theme.textSecondary }]}>{log.completedAt}</Text>
              </View>
            </View>
            <Text style={[styles.historyDuration, { color: theme.accent }]}>+{log.durationMinutes}m</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontFamily: Fonts.bold, fontSize: 24, marginTop: 10 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, marginTop: 4, marginBottom: 20 },
  presetsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  presetPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetText: { fontFamily: Fonts.medium, fontSize: 13 },
  timerCard: {
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  timerMode: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.5, marginBottom: 8 },
  timerDigits: { fontFamily: Fonts.extraBold, fontSize: 64, fontVariant: ['tabular-nums'], letterSpacing: -1 },
  timerStatus: { fontFamily: Fonts.medium, fontSize: 13, marginTop: 4, marginBottom: 24 },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    flex: 1,
    justifyContent: 'center',
  },
  actionBtnText: { fontFamily: Fonts.bold, color: '#FFFFFF', fontSize: 16 },
  resetButton: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: { fontFamily: Fonts.bold, fontSize: 16, marginBottom: 12 },
  historyList: { gap: 10 },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTag: { fontFamily: Fonts.semiBold, fontSize: 14 },
  historyTime: { fontFamily: Fonts.regular, fontSize: 11, marginTop: 2 },
  historyDuration: { fontFamily: Fonts.bold, fontSize: 15 },
});
