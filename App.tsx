import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { MidnightDark, ArcticLight, ThemeColors, Fonts } from './src/theme/tokens';
import { TabType } from './src/types';
import { HomeScreen } from './src/screens/HomeScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { FocusScreen } from './src/screens/FocusScreen';
import { RecoverScreen } from './src/screens/RecoverScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { UrgeModal } from './src/components/UrgeModal';
import { LaunchSplash } from './src/components/LaunchSplash';

export default function App() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('./assets/fonts/Poppins-ExtraBold.ttf'),
  });

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [themeMode, setThemeMode] = useState<'MidnightDark' | 'ArcticLight'>('MidnightDark');
  const [urgeModalVisible, setUrgeModalVisible] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
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
                      fontFamily: isActive ? Fonts.bold : Fonts.medium,
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
      {showSplash && <LaunchSplash onFinish={() => setShowSplash(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
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
    fontFamily: Fonts.medium,
    fontSize: 10,
    letterSpacing: 0.2,
  },
});
