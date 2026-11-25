import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts, ThemeColors, MidnightDark } from '../theme/tokens';
import { TabType } from '../types';

interface SpotifyTabBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  theme?: ThemeColors;
}

interface TabItemDef {
  key: TabType;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const SPOTIFY_TABS: TabItemDef[] = [
  { key: 'home', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
  { key: 'insights', label: 'Insights', activeIcon: 'stats-chart', inactiveIcon: 'stats-chart-outline' },
  { key: 'focus', label: 'Focus', activeIcon: 'timer', inactiveIcon: 'timer-outline' },
  { key: 'recover', label: 'Recover', activeIcon: 'heart', inactiveIcon: 'heart-outline' },
  { key: 'profile', label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

// Spotify signature palette

export const SpotifyTabBar: React.FC<SpotifyTabBarProps> = ({
  currentTab,
  onSelectTab,
  theme = MidnightDark,
}) => {

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      {/* 100% Spotify Translucent Gradient Backdrop (NO solid background) */}
      <LinearGradient
        colors={[
          `${theme.bg}00`,
          `${theme.bg}59`,
          `${theme.bg}A6`,
          `${theme.bg}D9`,
          `${theme.bg}EB`,
        ]}
        locations={[0, 0.25, 0.55, 0.8, 1.0]}
        style={styles.gradientBackdrop}
        pointerEvents="none"
      />

      {/* Spotify 5-Tab Navigation Bar with NO solid background */}
      <View style={styles.tabsContainer} accessibilityRole="tablist">
        <View style={styles.tabsRow}>
          {SPOTIFY_TABS.map((tab) => {
            const isFocused = currentTab === tab.key;
            return (
              <SpotifyTabButton
                key={tab.key}
                tab={tab}
                isFocused={isFocused}
                theme={theme}
                onPress={() => onSelectTab(tab.key)}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
};

interface SpotifyTabButtonProps {
  tab: TabItemDef;
  isFocused: boolean;
  theme: ThemeColors;
  onPress: () => void;
}

const SpotifyTabButton: React.FC<SpotifyTabButtonProps> = ({
  tab,
  isFocused,
  onPress,
  theme,
}) => {
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 8,
      tension: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 200,
    }).start();
  };

  const color = isFocused ? theme.textPrimary : theme.textSecondary;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={[styles.iconWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <Ionicons
          name={isFocused ? tab.activeIcon : tab.inactiveIcon}
          size={24}
          color={color}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            {
              color,
              fontFamily: isFocused ? Fonts.bold : Fonts.medium,
            },
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  gradientBackdrop: {
    position: 'absolute',
    top: -36,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabsContainer: {
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  tabsRow: {
    flexDirection: 'row',
    height: 54,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
});
