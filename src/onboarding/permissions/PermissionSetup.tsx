import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Platform, Pressable, StyleSheet, Text, View, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PermissionService as service, reelApps, type AccessSnapshot, type PermissionKey } from '../../services/PermissionService';
import { Typography, type ThemeColors } from '../../theme/tokens';

type Props = { theme: ThemeColors };

interface PermissionItem {
  key: PermissionKey;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

const PERMISSION_ITEMS: PermissionItem[] = [
  {
    key: 'usage',
    icon: 'time-outline',
    title: 'Screen Time & Usage',
    subtitle: 'Measures daily app usage and screen time',
  },
  {
    key: 'overlay',
    icon: 'layers-outline',
    title: 'Display Over Other Apps',
    subtitle: 'Shows focus reminders over distracting apps',
  },
  {
    key: 'accessibility',
    icon: 'film-outline',
    title: 'Reel & Short Detection',
    subtitle: 'Detects doomscrolling on Instagram & YouTube',
  },
  {
    key: 'battery',
    icon: 'battery-charging-outline',
    title: 'Background Protection',
    subtitle: 'Prevents Android from stopping your focus timer',
  },
];

export function PermissionSetup({ theme }: Props) {
  const [snapshot, setSnapshot] = useState<AccessSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<PermissionKey | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await service.snapshot();
      if (mounted.current) setSnapshot(next);
      return next;
    } catch {
      return null;
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();

    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refresh();
      }
    });

    const interval = setInterval(() => {
      if (AppState.currentState === 'active') void refresh();
    }, 3000);

    return () => {
      mounted.current = false;
      listener.remove();
      clearInterval(interval);
    };
  }, [refresh]);

  const handleRequest = async (key: PermissionKey) => {
    if (busyKey) return;
    setBusyKey(key);
    try {
      const allAppPkgs = reelApps.map((a) => a.packageName);
      await service.configure(allAppPkgs, true);
      await service.counter(true);
      await service.open(key);
    } catch {
      // Android settings handled natively
    } finally {
      setBusyKey(null);
    }
  };

  const isGranted = (key: PermissionKey): boolean => {
    if (!snapshot) return false;
    if (key === 'usage') return snapshot.usage;
    if (key === 'overlay') return snapshot.overlay;
    if (key === 'accessibility') return snapshot.accessibility;
    if (key === 'battery') return snapshot.battery || snapshot.batteryConfirmed;
    return false;
  };

  return (
    <View style={s.container}>
      {/* Minimal Header */}
      <Text accessibilityRole="header" style={[s.title, { color: theme.textPrimary }]}>
        Enable Permissions
      </Text>
      <Text style={[s.subtitle, { color: theme.textSecondary }]}>
        BrainSpace needs access to these Android features to track screen time and protect your focus.
      </Text>

      {/* Permission Cards */}
      {loading ? (
        <ActivityIndicator color={theme.accent} style={{ marginVertical: 32 }} />
      ) : (
        <View style={s.list}>
          {PERMISSION_ITEMS.map((item) => {
            const granted = isGranted(item.key);
            const isBusy = busyKey === item.key;

            return (
              <View
                key={item.key}
                style={[
                  s.card,
                  {
                    backgroundColor: theme.surface,
                    borderColor: granted ? `${theme.accent}40` : theme.border,
                  },
                ]}
              >
                {/* Icon */}
                <View
                  style={[
                    s.iconWrap,
                    {
                      backgroundColor: granted ? `${theme.accent}20` : theme.surface2,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={granted ? theme.accent : theme.textSecondary}
                  />
                </View>

                {/* Text Details */}
                <View style={s.info}>
                  <Text style={[s.itemTitle, { color: theme.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text style={[s.itemSubtitle, { color: theme.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>

                {/* Action Button */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${granted ? 'Allowed' : 'Allow'} ${item.title}`}
                  disabled={isBusy}
                  onPress={() => handleRequest(item.key)}
                  style={({ pressed }) => [
                    s.actionBtn,
                    {
                      backgroundColor: granted ? theme.surface2 : theme.accent,
                      opacity: isBusy ? 0.6 : pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  {isBusy ? (
                    <ActivityIndicator size="small" color={granted ? theme.accent : theme.bg} />
                  ) : granted ? (
                    <View style={s.grantedWrap}>
                      <Ionicons name="checkmark-sharp" size={14} color={theme.accent} />
                      <Text style={[s.actionText, { color: theme.textPrimary }]}>Allowed</Text>
                    </View>
                  ) : (
                    <Text style={[s.actionText, { color: theme.bg }]}>Allow</Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
      )}

      {/* Subtle Privacy Assurance */}
      <View style={s.privacyNotice}>
        <Ionicons name="lock-closed-outline" size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
        <Text style={[s.privacyText, { color: theme.textSecondary }]}>
          Your data stays 100% on this device. Never uploaded.
        </Text>
      </View>
    </View>
  );
}

export function PermissionSettingsButton({ theme }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={[s.settingsEntry, { backgroundColor: theme.surface }]}
      >
        <Ionicons name="shield-checkmark-outline" size={22} color={theme.accent} />
        <View style={{ flex: 1 }}>
          <Text style={[s.itemTitle, { color: theme.textPrimary }]}>
            Device Permissions
          </Text>
          <Text style={[s.itemSubtitle, { color: theme.textSecondary }]}>
            Screen time tracking & focus protection access.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
          <Pressable
            accessibilityLabel="Close device access"
            accessibilityRole="button"
            onPress={() => setOpen(false)}
            style={{ alignSelf: 'flex-end', padding: 20 }}
          >
            <Ionicons name="close" size={24} color={theme.textPrimary} />
          </Pressable>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 30 }}>
            <PermissionSetup theme={theme} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  title: {
    fontFamily: Typography.bold,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Typography.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: Typography.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  itemSubtitle: {
    fontFamily: Typography.regular,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  actionBtn: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grantedWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontFamily: Typography.bold,
    fontSize: 13,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  privacyText: {
    fontFamily: Typography.regular,
    fontSize: 12,
  },
  settingsEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 12,
    marginBottom: 18,
  },
});
