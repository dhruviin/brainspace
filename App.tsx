import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { MidnightDark, ArcticLight, ThemeColors } from './src/theme/tokens';
import { TabType } from './src/types';
import { HomeScreen } from './src/screens/HomeScreen';
import { InsightsScreen } from './src/screens/InsightsScreen';
import { FocusScreen } from './src/screens/FocusScreen';
import { RecoverScreen } from './src/screens/RecoverScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { UrgeModal } from './src/components/UrgeModal';
import { LaunchSplash } from './src/components/LaunchSplash';
import { SpotifyTabBar } from './src/components/SpotifyTabBar';

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

        {/* Spotify-style Bottom Navigation Bar */}
        <SpotifyTabBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          theme={theme}
        />

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
    backgroundColor: '#121212',
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  screenContainer: {
    flex: 1,
  },
});
