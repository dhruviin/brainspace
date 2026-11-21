import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fonts, ThemeColors } from '../theme/tokens';
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
const SPOTIFY_INACTIVE = '#B3B3B3';
const SPOTIFY_ACTIVE = '#FFFFFF';
const SPOTIFY_BG = '#121212';
const SPOTIFY_BORDER = 'rgba(255, 255, 255, 0.08)';

export const SpotifyTabBar: React.FC<SpotifyTabBarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topBorder} />
      <View style={styles.tabsRow} accessibilityRole="tablist">
        {SPOTIFY_TABS.map((tab) => {
          const isFocused = currentTab === tab.key;
          return (
            <SpotifyTabButton
              key={tab.key}
              tab={tab}
              isFocused={isFocused}
              onPress={() => onSelectTab(tab.key)}
            />
          );
        })}
      </View>
    </View>
  );
};

interface SpotifyTabButtonProps {
  tab: TabItemDef;
  isFocused: boolean;
  onPress: () => void;
}

const SpotifyTabButton: React.FC<SpotifyTabButtonProps> = ({
  tab,
  isFocused,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  const color = isFocused ? SPOTIFY_ACTIVE : SPOTIFY_INACTIVE;

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
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: SPOTIFY_BG,
    zIndex: 9999,
    elevation: 16,
  },
  topBorder: {
    height: 1,
    backgroundColor: SPOTIFY_BORDER,
    width: '100%',
  },
  tabsRow: {
    flexDirection: 'row',
    height: 56,
    marginBottom: Platform.OS === 'ios' ? 24 : 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
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
    fontSize: 10.5,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
