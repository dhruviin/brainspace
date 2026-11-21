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

export type TabBarStyleVariant = 'capsule' | 'center-prominent' | 'refined-split';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_MARGIN = 16;
const TOTAL_BAR_WIDTH = SCREEN_WIDTH - (HORIZONTAL_MARGIN * 2);

interface LiquidTabBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  theme: ThemeColors;
  variant?: TabBarStyleVariant;
}

interface TabDef {
  key: TabType;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const ALL_TABS: TabDef[] = [
  { key: 'home', label: 'Home', activeIcon: 'compass', inactiveIcon: 'compass-outline' },
  { key: 'insights', label: 'Insights', activeIcon: 'bar-chart', inactiveIcon: 'bar-chart-outline' },
  { key: 'focus', label: 'Focus', activeIcon: 'timer', inactiveIcon: 'timer-outline' },
  { key: 'recover', label: 'Recover', activeIcon: 'heart', inactiveIcon: 'heart-outline' },
  { key: 'profile', label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

export const LiquidTabBar: React.FC<LiquidTabBarProps> = ({
  currentTab,
  onSelectTab,
  theme,
  variant = 'capsule',
}) => {
  if (variant === 'center-prominent') {
    return (
      <CenterProminentBar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        theme={theme}
      />
    );
  }

  if (variant === 'refined-split') {
    return (
      <RefinedSplitBar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        theme={theme}
      />
    );
  }

  // Default: Unified Glass Capsule (Option 1)
  return (
    <UnifiedCapsuleBar
      currentTab={currentTab}
      onSelectTab={onSelectTab}
      theme={theme}
    />
  );
};

/* =========================================================================
   OPTION 1: UNIFIED GLASS CAPSULE (Continuous 5-tab floating dock)
   ========================================================================= */
const UnifiedCapsuleBar: React.FC<Omit<LiquidTabBarProps, 'variant'>> = ({
  currentTab,
  onSelectTab,
  theme,
}) => {
  const TAB_WIDTH = TOTAL_BAR_WIDTH / 5;
  const activeIndex = ALL_TABS.findIndex((t) => t.key === currentTab);

  const translateX = useRef(new Animated.Value(activeIndex * TAB_WIDTH)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const prevIndex = useRef(activeIndex);

  useEffect(() => {
    const diff = Math.abs(activeIndex - prevIndex.current);
    if (diff > 0) {
      scaleX.setValue(1.18);
      Animated.spring(scaleX, {
        toValue: 1,
        friction: 6,
        tension: 180,
        useNativeDriver: true,
      }).start();
    }

    Animated.spring(translateX, {
      toValue: activeIndex * TAB_WIDTH,
      friction: 8,
      tension: 170,
      useNativeDriver: true,
    }).start();

    prevIndex.current = activeIndex;
  }, [activeIndex, TAB_WIDTH, translateX, scaleX]);

  return (
    <View style={capsuleStyles.outer} pointerEvents="box-none">
      <View
        style={[
          capsuleStyles.dock,
          {
            backgroundColor: theme.surface === '#000000' ? '#111317' : theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Sliding Active Pill */}
        <Animated.View
          style={[
            capsuleStyles.activePillContainer,
            {
              width: TAB_WIDTH,
              transform: [{ translateX }, { scaleX }],
            },
          ]}
          pointerEvents="none"
        >
          <View
            style={[
              capsuleStyles.activePillInner,
              {
                backgroundColor: theme.surface2,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                capsuleStyles.topIndicatorLine,
                {
                  backgroundColor:
                    currentTab === 'recover' ? theme.recovery : theme.accent,
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* 5 Tabs */}
        <View style={capsuleStyles.tabsRow} accessibilityRole="tablist">
          {ALL_TABS.map((tab) => {
            const isFocused = currentTab === tab.key;
            return (
              <CapsuleTabItem
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
    </View>
  );
};

const CapsuleTabItem: React.FC<{
  tab: TabDef;
  isFocused: boolean;
  tabWidth: number;
  theme: ThemeColors;
  onPress: () => void;
}> = ({ tab, isFocused, tabWidth, theme, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.12 : 1)).current;
  const translateY = useRef(new Animated.Value(isFocused ? -2 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1.12 : 1,
        friction: 7,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: isFocused ? -2 : 0,
        friction: 7,
        tension: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused, scaleAnim, translateY]);

  const activeColor = tab.key === 'recover' ? theme.recovery : theme.accent;
  const color = isFocused ? activeColor : theme.textSecondary;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[capsuleStyles.tabBtn, { width: tabWidth }]}
      accessibilityRole="tab"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: isFocused }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateY }], alignItems: 'center' }}>
        <Ionicons
          name={isFocused ? tab.activeIcon : tab.inactiveIcon}
          size={20}
          color={color}
        />
        <Text
          numberOfLines={1}
          style={[
            capsuleStyles.label,
            {
              color,
              fontFamily: isFocused ? Fonts.semiBold : Fonts.medium,
              opacity: isFocused ? 1 : 0.65,
            },
          ]}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

/* =========================================================================
   OPTION 2: CENTER-PROMINENT FOCUS DOCK (Elevated Quick Action Orb)
   ========================================================================= */
const CenterProminentBar: React.FC<Omit<LiquidTabBarProps, 'variant'>> = ({
  currentTab,
  onSelectTab,
  theme,
}) => {
  const LEFT_RIGHT_WIDTH = (TOTAL_BAR_WIDTH - 64) / 4;
  const isFocus = currentTab === 'focus';
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={prominentStyles.outer} pointerEvents="box-none">
      <View
        style={[
          prominentStyles.dock,
          {
            backgroundColor: theme.surface === '#000000' ? '#111317' : theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        {/* Left Pair: Home & Insights */}
        {ALL_TABS.slice(0, 2).map((tab) => {
          const isFocused = currentTab === tab.key;
          const color = isFocused ? theme.accent : theme.textSecondary;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              style={[prominentStyles.tabBtn, { width: LEFT_RIGHT_WIDTH }]}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isFocused ? tab.activeIcon : tab.inactiveIcon}
                size={20}
                color={color}
              />
              <Text style={[prominentStyles.label, { color, fontFamily: isFocused ? Fonts.semiBold : Fonts.medium }]}>
                {tab.label}
              </Text>
              {isFocused && <View style={[prominentStyles.activeDot, { backgroundColor: theme.accent }]} />}
            </TouchableOpacity>
          );
        })}

        {/* Center: Elevated Focus Orb */}
        <View style={prominentStyles.centerSlot}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onSelectTab('focus')}
            accessibilityRole="tab"
            accessibilityLabel="Start Focus"
          >
            <Animated.View
              style={[
                prominentStyles.centerOrb,
                {
                  backgroundColor: isFocus ? theme.accent : theme.surface2,
                  borderColor: isFocus ? '#FFFFFF' : theme.accent,
                  transform: [{ scale: isFocus ? 1.08 : pulseAnim }],
                  shadowColor: theme.accent,
                },
              ]}
            >
              <Ionicons
                name={isFocus ? 'timer' : 'timer-outline'}
                size={26}
                color={isFocus ? '#FFFFFF' : theme.accent}
              />
            </Animated.View>
          </TouchableOpacity>
          <Text
            style={[
              prominentStyles.centerLabel,
              {
                color: isFocus ? theme.accent : theme.textSecondary,
                fontFamily: isFocus ? Fonts.bold : Fonts.medium,
              },
            ]}
          >
            Focus
          </Text>
        </View>

        {/* Right Pair: Recover & Profile */}
        {ALL_TABS.slice(3, 5).map((tab) => {
          const isFocused = currentTab === tab.key;
          const color = isFocused
            ? tab.key === 'recover' ? theme.recovery : theme.accent
            : theme.textSecondary;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              style={[prominentStyles.tabBtn, { width: LEFT_RIGHT_WIDTH }]}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isFocused ? tab.activeIcon : tab.inactiveIcon}
                size={20}
                color={color}
              />
              <Text style={[prominentStyles.label, { color, fontFamily: isFocused ? Fonts.semiBold : Fonts.medium }]}>
                {tab.label}
              </Text>
              {isFocused && (
                <View
                  style={[
                    prominentStyles.activeDot,
                    { backgroundColor: tab.key === 'recover' ? theme.recovery : theme.accent },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

/* =========================================================================
   OPTION 3: REFINED MINIMALIST SPLIT DOCK (Squircle Island + Micro-Pill)
   ========================================================================= */
const RefinedSplitBar: React.FC<Omit<LiquidTabBarProps, 'variant'>> = ({
  currentTab,
  onSelectTab,
  theme,
}) => {
  const PROFILE_SIZE = 52;
  const GAP = 10;
  const MAIN_WIDTH = TOTAL_BAR_WIDTH - PROFILE_SIZE - GAP;
  const TAB_WIDTH = MAIN_WIDTH / 4;
  const activeIndex = currentTab === 'profile' ? -1 : ALL_TABS.slice(0, 4).findIndex((t) => t.key === currentTab);

  const translateX = useRef(new Animated.Value(Math.max(0, activeIndex) * TAB_WIDTH)).current;
  const blobOpacity = useRef(new Animated.Value(activeIndex >= 0 ? 1 : 0)).current;

  useEffect(() => {
    if (activeIndex >= 0) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: activeIndex * TAB_WIDTH,
          friction: 8,
          tension: 180,
          useNativeDriver: true,
        }),
        Animated.timing(blobOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(blobOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [activeIndex, TAB_WIDTH, translateX, blobOpacity]);

  const isProfile = currentTab === 'profile';

  return (
    <View style={splitStyles.outer} pointerEvents="box-none">
      {/* 4-Tab Main Bar with refined micro-pill */}
      <View
        style={[
          splitStyles.mainBar,
          {
            width: MAIN_WIDTH,
            backgroundColor: theme.surface === '#000000' ? '#111317' : theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Animated.View
          style={[
            splitStyles.activeBlob,
            {
              width: TAB_WIDTH,
              opacity: blobOpacity,
              transform: [{ translateX }],
            },
          ]}
          pointerEvents="none"
        >
          <View style={[splitStyles.pillInner, { backgroundColor: theme.surface2, borderColor: theme.border }]} />
        </Animated.View>

        <View style={splitStyles.tabsRow}>
          {ALL_TABS.slice(0, 4).map((tab) => {
            const isFocused = currentTab === tab.key;
            const activeColor = tab.key === 'recover' ? theme.recovery : theme.accent;
            const color = isFocused ? activeColor : theme.textSecondary;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => onSelectTab(tab.key)}
                style={[splitStyles.tabBtn, { width: TAB_WIDTH }]}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={isFocused ? tab.activeIcon : tab.inactiveIcon}
                  size={19}
                  color={color}
                />
                <Text style={[splitStyles.label, { color, fontFamily: isFocused ? Fonts.semiBold : Fonts.medium }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Refined Squircle Profile Island */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectTab('profile')}
        accessibilityRole="tab"
        accessibilityLabel="Profile"
      >
        <View
          style={[
            splitStyles.profileSquircle,
            {
              width: PROFILE_SIZE,
              height: PROFILE_SIZE,
              backgroundColor: theme.surface === '#000000' ? '#111317' : theme.surface,
              borderColor: isProfile ? theme.accent : theme.border,
              borderWidth: isProfile ? 2 : 1,
              shadowColor: isProfile ? theme.accent : '#000000',
            },
          ]}
        >
          <Ionicons
            name={isProfile ? 'person' : 'person-outline'}
            size={22}
            color={isProfile ? theme.accent : theme.textSecondary}
          />
          {isProfile && <View style={[splitStyles.profileBadge, { backgroundColor: theme.accent }]} />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

/* =========================================================================
   STYLESHEETS
   ========================================================================= */
const capsuleStyles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 18,
    left: HORIZONTAL_MARGIN,
    right: HORIZONTAL_MARGIN,
    zIndex: 999,
    elevation: 12,
  },
  dock: {
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  activePillContainer: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePillInner: {
    width: '84%',
    height: '78%',
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  topIndicatorLine: {
    width: 20,
    height: 2.5,
    borderRadius: 1.5,
    marginTop: 2,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBtn: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 9.5,
    marginTop: 3,
    letterSpacing: 0.2,
  },
});

const prominentStyles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 18,
    left: HORIZONTAL_MARGIN,
    right: HORIZONTAL_MARGIN,
    zIndex: 999,
    elevation: 12,
  },
  dock: {
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    paddingHorizontal: 4,
  },
  tabBtn: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 9.5,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  centerSlot: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -18,
  },
  centerOrb: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  centerLabel: {
    fontSize: 9.5,
    marginTop: 4,
    letterSpacing: 0.2,
  },
});

const splitStyles = StyleSheet.create({
  outer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 18,
    left: HORIZONTAL_MARGIN,
    right: HORIZONTAL_MARGIN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 999,
    elevation: 12,
  },
  mainBar: {
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBtn: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  label: {
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
    width: '84%',
    height: '76%',
    borderRadius: 20,
    borderWidth: 1,
  },
  profileSquircle: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  profileBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
