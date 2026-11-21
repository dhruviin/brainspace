import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { MidnightDark, ArcticLight, ThemeColors } from './src/theme/tokens';
import { TabType } from './src/types';
import { HomeScreen } from './src/screens/HomeScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { FocusScreen } from './src/screens/FocusScreen';
import { RecoverScreen } from './src/screens/RecoverScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { UrgeModal } from './src/components/UrgeModal';
import { LaunchSplash } from './src/components/LaunchSplash';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [themeMode, setThemeMode] = useState<'MidnightDark' | 'ArcticLight'>('MidnightDark');
  const [urgeModalVisible, setUrgeModalVisible] = useState(false);
  const [showSplash, setShowSplash] = useState(Platform.OS === 'android' || Platform.OS === 'ios');
  const finishSplash = useCallback(() => setShowSplash(false), []);

  const theme: ThemeColors = themeMode === 'MidnightDark' ? MidnightDark : ArcticLight;

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'MidnightDark' ? 'ArcticLight' : 'MidnightDark'));
  };

  const tabs: { key: TabType; label: string; icon: string; activeIcon: string }[] = [
    { key: 'home', label: 'Home', icon: 'compass-outline', activeIcon: 'compass' },
    { key: 'insights', label: 'Insights', icon: 'bar-chart-outline', activeIcon: 'bar-chart' },
    { key: 'focus', label: 'Focus', icon: 'timer-outline', activeIcon: 'timer' },
    { key: 'recover', label: 'Recover', icon: 'heart-outline', activeIcon: 'heart' },
    { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.bg }]}
        accessibilityElementsHidden={showSplash}
        importantForAccessibility={showSplash ? 'no-hide-descendants' : 'auto'}
        pointerEvents={showSplash ? 'none' : 'auto'}
      >
        <StatusBar style={themeMode === 'MidnightDark' ? 'light' : 'dark'} />

        {/* Screen Container */}
        <View style={styles.screenContainer}>
          {currentTab === 'home' && (
            <HomeScreen
              theme={theme}
              onNavigateTab={setCurrentTab}
              onOpenUrge={() => setUrgeModalVisible(true)}
            />
          )}
          {currentTab === 'insights' && <InsightsScreen theme={theme} />}
          {currentTab === 'focus' && <FocusScreen theme={theme} />}
          {currentTab === 'recover' && (
            <RecoverScreen theme={theme} onOpenUrge={() => setUrgeModalVisible(true)} />
          )}
          {currentTab === 'profile' && (
            <ProfileScreen theme={theme} themeName={themeMode} onToggleTheme={toggleTheme} />
          )}
        </View>

        {/* 5-Tab Bottom Navigation Bar */}
        <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            const iconColor = isActive ? (tab.key === 'recover' ? theme.recovery : theme.accent) : theme.textSecondary;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabButton}
                onPress={() => setCurrentTab(tab.key)}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: isActive }}
              >
                <Ionicons
                  name={(isActive ? tab.activeIcon : tab.icon) as any}
                  size={22}
                  color={iconColor}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: iconColor,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Urge SOS Modal */}
        <UrgeModal
          visible={urgeModalVisible}
          onClose={() => setUrgeModalVisible(false)}
          theme={theme}
        />
      </SafeAreaView>
      {showSplash && <LaunchSplash onFinish={finishSplash} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  screenContainer: {
    flex: 1,
  },
  bottomBar: {
    height: 64,
    flexDirection: 'row',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
