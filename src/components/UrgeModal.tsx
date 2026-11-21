import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../theme/tokens';

interface UrgeModalProps {
  visible: boolean;
  onClose: () => void;
  theme: ThemeColors;
}

export const UrgeModal: React.FC<UrgeModalProps> = ({ visible, onClose, theme }) => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [counter, setCounter] = useState(4);
  const [selectedReplacement, setSelectedReplacement] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setPhase('Inhale');
      setCounter(4);
      setSelectedReplacement(null);
      return;
    }

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev > 1) return prev - 1;
        // switch phase
        if (phase === 'Inhale') {
          setPhase('Hold');
          return 4;
        } else if (phase === 'Hold') {
          setPhase('Exhale');
          return 4;
        } else {
          setPhase('Inhale');
          return 4;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, phase]);

  const replacements = [
    { title: 'Drink Cold Water', icon: 'water-outline' },
    { title: 'Take a 2-min Walk', icon: 'walk-outline' },
    { title: 'Full Body Stretch', icon: 'body-outline' },
    { title: 'Text a Friend', icon: 'chatbubble-outline' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="shield-checkmark" size={20} color={theme.recovery} />
              <Text style={[styles.title, { color: theme.textPrimary }]}>Urge Support Assistant</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Take a pause. Notice the sensation without judgment. It will pass.
          </Text>

          {/* Guided Box Breathing */}
          <View style={[styles.boxBreathing, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
            <Text style={[styles.phaseText, { color: theme.recovery }]}>{phase.toUpperCase()}</Text>
            <Text style={[styles.counterText, { color: theme.textPrimary }]}>{counter}</Text>
            <Text style={[styles.breathTip, { color: theme.textSecondary }]}>Box breathing cycle: 4s rhythm</Text>
          </View>

          {/* Replacement activities */}
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Choose a Replacement Action:</Text>
          <View style={styles.actionGrid}>
            {replacements.map((act) => {
              const isSelected = selectedReplacement === act.title;
              return (
                <TouchableOpacity
                  key={act.title}
                  onPress={() => setSelectedReplacement(act.title)}
                  style={[
                    styles.actionBtn,
                    {
                      backgroundColor: isSelected ? theme.accent : theme.surface3,
                      borderColor: isSelected ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={act.icon as any}
                    size={18}
                    color={isSelected ? '#FFFFFF' : theme.textPrimary}
                  />
                  <Text
                    style={[
                      styles.actionText,
                      { color: isSelected ? '#FFFFFF' : theme.textPrimary, fontWeight: isSelected ? '700' : '500' },
                    ]}
                  >
                    {act.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Done CTA */}
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: theme.recovery }]}
            onPress={onClose}
          >
            <Text style={styles.doneBtnText}>I Feel Grounded Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  boxBreathing: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  counterText: {
    fontSize: 48,
    fontWeight: '900',
  },
  breathTip: {
    fontSize: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 13,
  },
  doneBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
