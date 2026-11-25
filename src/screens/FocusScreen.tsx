import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, Fonts } from '../theme/tokens';
import { FocusSessionLog } from '../types';
import { useSetup } from '../onboarding/setup/store';
import { focusMinutes } from '../onboarding/setup/model';

interface FocusScreenProps {
  theme: ThemeColors;
}

export const FocusScreen: React.FC<FocusScreenProps> = ({ theme }) => {
  const initialMinutes = focusMinutes(useSetup((state) => state.answers));
  const [selectedPreset, setSelectedPreset] = useState(initialMinutes);
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionLogs, setSessionLogs] = useState<FocusSessionLog[]>([]);

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) return;
    const timer = setTimeout(() => {
      const remaining = secondsLeft - 1;
      setSecondsLeft(remaining);
      if (remaining === 0) {
        setIsActive(false);
        setSessionLogs((prev) => [{
          id: Date.now().toString(), mode: 'pomodoro',
          durationMinutes: selectedPreset, completedAt: 'Just now', tag: 'Focus Session',
        }, ...prev]);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [isActive, secondsLeft, selectedPreset]);

  const toggleTimer = () => {
    if (!isActive && secondsLeft === 0) setSecondsLeft(selectedPreset * 60);
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
        One session. One thing that matters to you.
      </Text>

      {/* Spotify Signature Preset Chips */}
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
                },
              ]}
            >
              <Text
                style={[
                  styles.presetText,
                  {
                    color: isSelected ? '#000000' : theme.textPrimary,
                    fontFamily: isSelected ? Fonts.bold : Fonts.medium,
                  },
                ]}
              >
                {mins} min
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Timer Display Card (Slice Minimalism) */}
      <View style={[styles.timerCard, { backgroundColor: theme.surface }]}>
        <Text style={[styles.timerMode, { color: theme.accent }]}>POMODORO INTERVAL</Text>
        <Text style={[styles.timerDigits, { color: theme.textPrimary }]}>{formattedTime}</Text>
        <Text style={[styles.timerStatus, { color: theme.textSecondary }]}>
          {isActive ? 'Session Active · Distractions Filtered' : 'Ready to Start'}
        </Text>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={[
              styles.actionButton,
              { backgroundColor: isActive ? theme.warning : theme.accent },
            ]}
            onPress={toggleTimer}
          >
            <Ionicons name={isActive ? 'pause' : 'play'} size={20} color={isActive ? '#FFFFFF' : '#000000'} />
            <Text style={[styles.actionBtnText, { color: isActive ? '#FFFFFF' : '#000000' }]}>
              {isActive ? 'Pause' : 'Start Focus'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: theme.surface2 }]}
            onPress={resetTimer}
          >
            <Ionicons name="refresh" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Session History */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Today’s Completed Blocks</Text>
      <View style={styles.historyList}>
        {sessionLogs.map((log) => (
          <View key={log.id} style={[styles.historyRow, { backgroundColor: theme.surface }]}>
            <View style={styles.historyLeft}>
              <View style={[styles.checkCircle, { backgroundColor: 'rgba(29, 185, 84, 0.15)' }]}>
                <Ionicons name="checkmark" size={16} color={theme.accent} />
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
  content: { padding: 18, paddingBottom: 150 },
  title: { fontFamily: Fonts.bold, fontSize: 24, marginTop: 10, letterSpacing: -0.3 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, marginTop: 4, marginBottom: 18 },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  presetPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  presetText: { fontSize: 12.5 },
  timerCard: {
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  timerMode: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.5, marginBottom: 8 },
  timerDigits: { fontFamily: Fonts.extraBold, fontSize: 64, fontVariant: ['tabular-nums'], letterSpacing: -2 },
  timerStatus: { fontFamily: Fonts.medium, fontSize: 13, marginTop: 6, marginBottom: 24 },
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
    paddingHorizontal: 28,
    borderRadius: 28,
    flex: 1,
    justifyContent: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnText: { fontFamily: Fonts.bold, fontSize: 15, letterSpacing: 0.1 },
  resetButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    borderRadius: 18,
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTag: { fontFamily: Fonts.bold, fontSize: 14 },
  historyTime: { fontFamily: Fonts.regular, fontSize: 11.5, marginTop: 2 },
  historyDuration: { fontFamily: Fonts.bold, fontSize: 14 },
});
