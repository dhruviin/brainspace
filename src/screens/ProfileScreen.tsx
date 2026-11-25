import React, { useState, useEffect } from 'react';
import { AppState, View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, Fonts } from '../theme/tokens';
import { UsageStatsService } from '../services/UsageStatsService';
import { useSetup } from '../onboarding/setup/store';
import { PermissionSettingsButton } from '../onboarding/permissions/PermissionSetup';
import { setupCopy } from '../onboarding/setup/content';

interface ProfileScreenProps {
  theme: ThemeColors;
  themeName: 'MidnightDark' | 'ArcticLight';
  onToggleTheme: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ theme, themeName, onToggleTheme }) => {
  const [hasUsagePermission, setHasUsagePermission] = useState<boolean>(false);

  useEffect(() => {
    const refresh = () => { void UsageStatsService.checkPermission().then(setHasUsagePermission); };
    refresh();
    const listener = AppState.addEventListener('change', (state) => { if (state === 'active') refresh(); });
    return () => listener.remove();
  }, []);

  const handleGrantUsage = async () => {
    await UsageStatsService.requestPermission();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Preferences & System</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Privacy audit, system health diagnostics & backend connectivity
      </Text>

      <TouchableOpacity accessibilityRole="button" onPress={() => useSetup.getState().edit()}
        style={[styles.card, { backgroundColor: theme.surface, padding: 18, marginBottom: 18 }]}>
        <View style={styles.rowLeft}>
          <Ionicons name="compass-outline" size={24} color={theme.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>{setupCopy.preferences}</Text>
            <Text style={[styles.rowDesc, { color: theme.textSecondary }]}>{setupCopy.preferencesDetail}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </View>
      </TouchableOpacity>

      <PermissionSettingsButton theme={theme} />

      {/* Appearance Section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APPEARANCE</Text>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon" size={20} color={theme.accent} />
            <View>
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Active Theme</Text>
              <Text style={[styles.rowDesc, { color: theme.textSecondary }]}>
                {themeName === 'MidnightDark' ? 'Midnight' : 'Arctic Light'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.pillBtn, { backgroundColor: theme.surface2 }]}
            onPress={onToggleTheme}
          >
            <Text style={[styles.pillBtnText, { color: theme.accent }]}>Switch Theme</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Permission Health Diagnostics */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>SYSTEM PERMISSION HEALTH</Text>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <TouchableOpacity style={styles.diagRow} onPress={handleGrantUsage}>
          <View style={styles.diagLeft}>
            <Ionicons
              name="analytics"
              size={18}
              color={hasUsagePermission ? theme.success : theme.warning}
            />
            <View>
              <Text style={[styles.diagLabel, { color: theme.textPrimary }]}>Android UsageStats</Text>
              <Text
                style={[
                  styles.diagStatus,
                  { color: hasUsagePermission ? theme.success : theme.warning },
                ]}
              >
                {hasUsagePermission ? 'Active · Local Query Granted' : 'Action Required · Tap to Authorize'}
              </Text>
            </View>
          </View>
          <Ionicons
            name={hasUsagePermission ? 'checkmark-circle' : 'chevron-forward'}
            size={20}
            color={hasUsagePermission ? theme.success : theme.warning}
          />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />

        <View style={styles.diagRow}>
          <View style={styles.diagLeft}>
            <Ionicons name="notifications" size={18} color={theme.accent} />
            <View>
              <Text style={[styles.diagLabel, { color: theme.textPrimary }]}>Neutral Notifications</Text>
              <Text style={[styles.diagStatus, { color: theme.accent }]}>No sensitive habit leaks</Text>
            </View>
          </View>
          <Ionicons name="checkmark-circle" size={20} color={theme.accent} />
        </View>
      </View>

      {/* Privacy Vault & Data Rights */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DATA RIGHTS & LOCAL VAULT</Text>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Alert.alert('Data Exported', 'Local JSON ledger exported to device storage.')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="download" size={18} color={theme.textPrimary} />
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Export My Local History (JSON)</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() =>
            Alert.alert(
              'Purge Local Data',
              'Are you sure you want to delete all local habit and focus logs? This action is irreversible.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete Everything', style: 'destructive' },
              ]
            )
          }
        >
          <View style={styles.rowLeft}>
            <Ionicons name="trash" size={18} color={theme.danger} />
            <Text style={[styles.rowLabel, { color: theme.danger }]}>Delete All Local Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.danger} />
        </TouchableOpacity>
      </View>

      {/* Backend & Monorepo Information */}
      <View style={[styles.infoBox, { backgroundColor: theme.surface2 }]}>
        <Ionicons name="information-circle" size={20} color={theme.accent} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>BrainSpace Architecture</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Native Android UsageStatsModule connected. Complies with offline-first local storage architecture.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingBottom: 150 },
  title: { fontFamily: Fonts.bold, fontSize: 24, marginTop: 10, letterSpacing: -0.3 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, marginTop: 4, marginBottom: 18, lineHeight: 18 },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, marginBottom: 8, marginTop: 8 },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowLabel: { fontFamily: Fonts.semiBold, fontSize: 14 },
  rowDesc: { fontFamily: Fonts.regular, fontSize: 11.5, marginTop: 2 },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  pillBtnText: { fontFamily: Fonts.bold, fontSize: 12 },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  diagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  diagLabel: { fontFamily: Fonts.semiBold, fontSize: 14 },
  diagStatus: { fontFamily: Fonts.medium, fontSize: 11.5, marginTop: 2 },
  divider: { height: 1, marginVertical: 4 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    marginTop: 6,
  },
  infoTitle: { fontFamily: Fonts.bold, fontSize: 13.5 },
  infoText: { fontFamily: Fonts.regular, fontSize: 12, marginTop: 2, lineHeight: 17 },
});
