import React, { useRef, useState } from 'react';
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
const SPOTIFY_MINI_BG = '#282828';
const SPOTIFY_ACCENT = '#1DB954'; // Spotify green for now-playing indicator

export const SpotifyTabBar: React.FC<SpotifyTabBarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      {/* Background Gradient Fade (simulates Spotify's bottom backdrop) */}
      <View style={styles.gradientBackdrop} pointerEvents="none">
        <View style={[styles.gradientSlice, { opacity: 0.05 }]} />
        <View style={[styles.gradientSlice, { opacity: 0.15 }]} />
        <View style={[styles.gradientSlice, { opacity: 0.3 }]} />
        <View style={[styles.gradientSlice, { opacity: 0.5 }]} />
        <View style={[styles.gradientSlice, { opacity: 0.72 }]} />
        <View style={[styles.gradientSlice, { opacity: 0.88 }]} />
        <View style={[styles.gradientSlice, { opacity: 0.98 }]} />
        <View style={[styles.gradientSlice, { opacity: 1.0, flex: 3 }]} />
      </View>

      {/* Floating Spotify Mini-Player Bar */}
      <TouchableOpacity
        activeOpacity={0.92}
        style={styles.miniPlayerContainer}
        onPress={() => onSelectTab('focus')}
        accessibilityRole="button"
        accessibilityLabel="Now Playing Focus Track"
      >
        {/* Track Thumbnail */}
        <View style={styles.miniPlayerThumb}>
          <Ionicons name="headset" size={20} color="#FFFFFF" />
        </View>

        {/* Track Metadata */}
        <View style={styles.miniPlayerMeta}>
          <Text style={styles.miniPlayerTitle} numberOfLines={1}>
            Deep Work Focus • 25m
          </Text>
          <Text style={styles.miniPlayerSubtitle} numberOfLines={1}>
            Binaural Alpha Waves • BrainSpace
          </Text>
        </View>

        {/* Right Action Icons (Devices, Add/Heart, Play/Pause) */}
        <View style={styles.miniPlayerControls}>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.controlIconBtn}
          >
            <Ionicons name="hardware-chip-outline" size={19} color={SPOTIFY_INACTIVE} />
          </TouchableOpacity>

          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.controlIconBtn}
            onPress={() => setIsLiked(!isLiked)}
          >
            <Ionicons
              name={isLiked ? 'add-circle' : 'add-circle-outline'}
              size={22}
              color={isLiked ? SPOTIFY_ACCENT : SPOTIFY_INACTIVE}
            />
          </TouchableOpacity>

          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.playBtn}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={SPOTIFY_ACTIVE}
            />
          </TouchableOpacity>
        </View>

        {/* Bottom Progress Bar */}
        <View style={styles.miniProgressBarTrack}>
          <View style={styles.miniProgressBarFill} />
        </View>
      </TouchableOpacity>

      {/* Spotify 5-Tab Navigation Bar */}
      <View style={styles.tabsContainer} accessibilityRole="tablist">
        <View style={styles.tabsRow}>
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
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  gradientBackdrop: {
    ...StyleSheet.absoluteFill,
    top: -24,
    flexDirection: 'column',
  },
  gradientSlice: {
    width: '100%',
    flex: 1,
    backgroundColor: '#000000',
  },
  miniPlayerContainer: {
    height: 56,
    marginHorizontal: 8,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: SPOTIFY_MINI_BG,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  miniPlayerThumb: {
    width: 38,
    height: 38,
    borderRadius: 4,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPlayerMeta: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
    justifyContent: 'center',
  },
  miniPlayerTitle: {
    fontSize: 12.5,
    color: SPOTIFY_ACTIVE,
    fontFamily: Fonts.bold,
    letterSpacing: 0.1,
  },
  miniPlayerSubtitle: {
    fontSize: 10.5,
    color: SPOTIFY_INACTIVE,
    fontFamily: Fonts.medium,
    marginTop: 1,
    letterSpacing: 0.1,
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  controlIconBtn: {
    padding: 2,
  },
  playBtn: {
    padding: 2,
    marginLeft: 2,
  },
  miniProgressBarTrack: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  miniProgressBarFill: {
    width: '45%',
    height: '100%',
    backgroundColor: SPOTIFY_ACTIVE,
    borderRadius: 1,
  },
  tabsContainer: {
    backgroundColor: '#000000',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  tabsRow: {
    flexDirection: 'row',
    height: 54,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
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
