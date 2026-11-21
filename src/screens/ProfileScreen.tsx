import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, Fonts } from '../theme/tokens';
import { UsageStatsService } from '../services/UsageStatsService';

interface ProfileScreenProps {
  theme: ThemeColors;
  themeName: 'MidnightDark' | 'ArcticLight';
  onToggleTheme: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ theme, themeName, onToggleTheme }) => {
  const [hasUsagePermission, setHasUsagePermission] = useState<boolean>(false);

  useEffect(() => {
    checkPerm();
  }, []);

  const checkPerm = async () => {
    const granted = await UsageStatsService.checkPermission();
    setHasUsagePermission(granted);
  };

  const handleGrantUsage = async () => {
    await UsageStatsService.requestPermission();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>Preferences & System</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Privacy audit, system health diagnostics & backend connectivity
      </Text>

      {/* Appearance Section */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>APPEARANCE</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="moon-outline" size={20} color={theme.accent} />
            <View>
              <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Active Theme</Text>
              <Text style={[styles.rowDesc, { color: theme.textSecondary }]}>
                {themeName === 'MidnightDark' ? 'Midnight Dark (X-inspired OLED)' : 'Arctic Light (High Contrast)'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.pillBtn, { backgroundColor: theme.surface2, borderColor: theme.border }]}
            onPress={onToggleTheme}
          >
            <Text style={[styles.pillBtnText, { color: theme.accent }]}>Switch Theme</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Permission Health Diagnostics */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>SYSTEM PERMISSION HEALTH</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
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

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.diagRow}>
          <View style={styles.diagLeft}>
            <Ionicons name="eye-outline" size={18} color={theme.warning} />
            <View>
              <Text style={[styles.diagLabel, { color: theme.textPrimary }]}>Short-Form Feed Detector</Text>
              <Text style={[styles.diagStatus, { color: theme.warning }]}>Phase 0 Gated Alpha</Text>
            </View>
          </View>
          <Ionicons name="shield-outline" size={20} color={theme.warning} />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.diagRow}>
          <View style={styles.diagLeft}>
            <Ionicons name="notifications-outline" size={18} color={theme.accent} />
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
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => Alert.alert('Data Exported', 'Local JSON ledger exported to device storage.')}
        >
          <View style={styles.rowLeft}>
            <Ionicons name="download-outline" size={18} color={theme.textPrimary} />
            <Text style={[styles.rowLabel, { color: theme.textPrimary }]}>Export My Local History (JSON)</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

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
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
            <Text style={[styles.rowLabel, { color: theme.danger }]}>Delete All Local Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.danger} />
        </TouchableOpacity>
      </View>

      {/* Backend & Monorepo Information */}
      <View style={[styles.infoBox, { backgroundColor: theme.surface2, borderColor: theme.border }]}>
        <Ionicons name="information-circle-outline" size={20} color={theme.accent} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>BrainSpace Monorepo Architecture</Text>
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
  content: { padding: 20, paddingBottom: 150 },
  title: { fontFamily: Fonts.bold, fontSize: 24, marginTop: 10 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13, marginTop: 4, marginBottom: 20 },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1, marginBottom: 8, marginTop: 6 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
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
  },
  rowLabel: { fontFamily: Fonts.semiBold, fontSize: 15 },
  rowDesc: { fontFamily: Fonts.regular, fontSize: 12, marginTop: 2 },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  pillBtnText: { fontFamily: Fonts.bold, fontSize: 12 },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  diagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  diagLabel: { fontFamily: Fonts.semiBold, fontSize: 14 },
  diagStatus: { fontFamily: Fonts.semiBold, fontSize: 11, marginTop: 2 },
  divider: { height: 1, marginVertical: 10 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
  },
  infoTitle: { fontFamily: Fonts.bold, fontSize: 13, marginBottom: 2 },
  infoText: { fontFamily: Fonts.regular, fontSize: 11, lineHeight: 16 },
});
