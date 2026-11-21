import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors, Fonts } from '../theme/tokens';
import { TabType } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const PROFILE_SIZE = 54;
const TAB_HEIGHT = 64;
const GAP_BETWEEN = 12;

// Main pill holds 4 tabs, profile island floats independently on the right
const MAIN_BAR_WIDTH = SCREEN_WIDTH - (HORIZONTAL_PADDING * 2) - PROFILE_SIZE - GAP_BETWEEN;
const TAB_WIDTH = MAIN_BAR_WIDTH / 4;

interface LiquidTabBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  theme: ThemeColors;
}

interface TabDef {
  key: TabType;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const MAIN_TABS: TabDef[] = [
  { key: 'home', label: 'Home', activeIcon: 'compass', inactiveIcon: 'compass-outline' },
  { key: 'insights', label: 'Insights', activeIcon: 'bar-chart', inactiveIcon: 'bar-chart-outline' },
  { key: 'focus', label: 'Focus', activeIcon: 'timer', inactiveIcon: 'timer-outline' },
  { key: 'recover', label: 'Recover', activeIcon: 'heart', inactiveIcon: 'heart-outline' },
];

export const LiquidTabBar: React.FC<LiquidTabBarProps> = ({
  currentTab,
  onSelectTab,
  theme,
}) => {
  const activeIndex = currentTab === 'profile'
    ? -1
    : MAIN_TABS.findIndex((t) => t.key === currentTab);

  // Animated values for sliding liquid blob
  const translateX = useRef(new Animated.Value(Math.max(0, activeIndex) * TAB_WIDTH)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const blobOpacity = useRef(new Animated.Value(activeIndex >= 0 ? 1 : 0)).current;
  const prevIndex = useRef(activeIndex);

  // Profile island pulse and highlight animations
  const profilePulse = useRef(new Animated.Value(1)).current;
  const profileScale = useRef(new Animated.Value(currentTab === 'profile' ? 1.08 : 1)).current;
  const profileBorderAlpha = useRef(new Animated.Value(currentTab === 'profile' ? 1 : 0.25)).current;

  // Idle gentle breathing pulse for profile island
  useEffect(() => {
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(profilePulse, {
          toValue: 1.03,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(profilePulse, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnim.start();
    return () => pulseAnim.stop();
  }, [profilePulse]);

  // Handle active tab transitions (spring translation + squish/stretch)
  useEffect(() => {
    if (activeIndex >= 0) {
      const diff = Math.abs(activeIndex - prevIndex.current);
      if (diff > 0 && prevIndex.current >= 0) {
        // Morph / squish effect as it slides
        scaleX.setValue(1.22);
        Animated.spring(scaleX, {
          toValue: 1,
          friction: 6,
          tension: 180,
          useNativeDriver: true,
        }).start();
      }

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: activeIndex * TAB_WIDTH,
          friction: 8,
          tension: 160,
          useNativeDriver: true,
        }),
        Animated.timing(blobOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fade out blob when profile island is active
      Animated.timing(blobOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    prevIndex.current = activeIndex;
  }, [activeIndex, translateX, scaleX, blobOpacity]);

  // Profile island active transition
  useEffect(() => {
    const isProfile = currentTab === 'profile';
    Animated.parallel([
      Animated.spring(profileScale, {
        toValue: isProfile ? 1.08 : 1,
        friction: 7,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.timing(profileBorderAlpha, {
        toValue: isProfile ? 1 : 0.25,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentTab, profileScale, profileBorderAlpha]);

  return (
    <View style={styles.outerContainer} pointerEvents="box-none">
      {/* Main Bar Pill */}
      <View
        style={[
          styles.mainBar,
          {
            backgroundColor: theme.surface === '#000000' ? '#121418' : theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Animated Sliding Pill / Blob */}
        <Animated.View
          style={[
            styles.activeBlob,
            {
              width: TAB_WIDTH,
              opacity: blobOpacity,
              transform: [{ translateX }, { scaleX }],
            },
          ]}
          pointerEvents="none"
        >
          <View
            style={[
              styles.pillInner,
              {
                backgroundColor: theme.surface2,
                borderColor: theme.border,
              },
            ]}
          />
        </Animated.View>

        {/* 4 Main Tabs */}
        <View style={styles.tabContent} accessibilityRole="tablist">
          {MAIN_TABS.map((tab) => {
            const isFocused = currentTab === tab.key;
            return (
              <TabItem
                key={tab.key}
                tab={tab}
                isFocused={isFocused}
                tabWidth={TAB_WIDTH}
                theme={theme}
                onPress={() => onSelectTab(tab.key)}
              />
            );
          })}
        </View>
      </View>

      {/* Floating Profile Island on the Right */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onSelectTab('profile')}
        accessibilityRole="tab"
        accessibilityLabel="Profile"
        accessibilityState={{ selected: currentTab === 'profile' }}
        style={styles.profileWrapper}
      >
        <Animated.View
          style={[
            styles.profileCircle,
            {
              backgroundColor: theme.surface === '#000000' ? '#121418' : theme.surface,
              borderColor: currentTab === 'profile' ? theme.accent : theme.border,
              borderWidth: currentTab === 'profile' ? 2 : 1,
              transform: [
                {
                  scale: currentTab === 'profile'
                    ? profileScale
                    : Animated.multiply(profileScale, profilePulse),
                },
              ],
            },
          ]}
        >
          <Ionicons
            name={currentTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={currentTab === 'profile' ? theme.accent : theme.textSecondary}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// Animated Tab Item with icon bounce and smooth label fade
interface TabItemProps {
  tab: TabDef;
  isFocused: boolean;
  tabWidth: number;
  theme: ThemeColors;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({
  tab,
  isFocused,
  tabWidth,
  theme,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.12 : 1)).current;
  const translateY = useRef(new Animated.Value(isFocused ? -3 : 0)).current;
  const labelOpacity = useRef(new Animated.Value(isFocused ? 1 : 0.65)).current;
  const labelTranslateY = useRef(new Animated.Value(isFocused ? -1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.12 : 1,
        friction: 7,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: isFocused ? -3 : 0,
        friction: 7,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacity, {
        toValue: isFocused ? 1 : 0.65,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(labelTranslateY, {
        toValue: isFocused ? -1 : 0,
        friction: 7,
        tension: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, scaleAnim, translateY, labelOpacity, labelTranslateY]);

  const activeColor = tab.key === 'recover' ? theme.recovery : theme.accent;
  const color = isFocused ? activeColor : theme.textSecondary;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.tabItem, { width: tabWidth }]}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isFocused }}
    >
      <View style={styles.iconContainer}>
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }, { translateY }],
          }}
        >
          <Ionicons
            name={isFocused ? tab.activeIcon : tab.inactiveIcon}
            size={20}
            color={color}
          />
        </Animated.View>
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            {
              color,
              opacity: labelOpacity,
              transform: [{ translateY: labelTranslateY }],
            },
          ]}
        >
          {tab.label}
        </Animated.Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 22 : 18,
    left: HORIZONTAL_PADDING,
    right: HORIZONTAL_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 999,
    elevation: 12,
  },
  mainBar: {
    width: MAIN_BAR_WIDTH,
    height: TAB_HEIGHT,
    borderRadius: TAB_HEIGHT / 2,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  tabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabItem: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    paddingTop: 4,
  },
  tabLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 9.5,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  activeBlob: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillInner: {
    width: '88%',
    height: '80%',
    borderRadius: 24,
    borderWidth: 1,
  },
  profileWrapper: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCircle: {
    width: PROFILE_SIZE,
    height: PROFILE_SIZE,
    borderRadius: PROFILE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
});
