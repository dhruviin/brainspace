import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
import { useSetup } from './src/onboarding/setup/store';

export default function App() {
  return <BrainSpaceHome />;
}

export function BrainSpaceHome({ afterSplash = false }: { afterSplash?: boolean } = {}) {
  useFonts({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('./assets/fonts/Poppins-ExtraBold.ttf'),
  });

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const themeMode = 'MidnightDark';
  const [urgeModalVisible, setUrgeModalVisible] = useState(false);
  const [showSplash, setShowSplash] = useState(!afterSplash);

  const theme: ThemeColors = MidnightDark;

  const toggleTheme = () => {};

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
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
