import React, { useCallback, useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LaunchSplash } from '../components/LaunchSplash';
import { useStory } from '../onboarding/store/story';
import { ink } from '../onboarding/theme';

const subscribe = (listener: () => void) =>
  useStory.persist.onFinishHydration(listener);
export default function Layout() {
  const [fonts, error] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../../assets/fonts/Poppins-ExtraBold.ttf'),
  });
  const [launched, setLaunched] = useState(false),
    hydrated = useSyncExternalStore(subscribe, useStory.persist.hasHydrated);
  const complete = useStory((s) => s.completed),
    finish = useCallback(() => setLaunched(true), []);
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: ink.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {launched && hydrated && (fonts || error) && (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: ink.bg },
              animation: 'fade',
            }}
          >
            <Stack.Protected guard={!complete}>
              <Stack.Screen name="onboarding" />
            </Stack.Protected>
            <Stack.Protected guard={complete}>
              <Stack.Screen name="index" />
            </Stack.Protected>
          </Stack>
        )}
        {!launched && (
          <View style={StyleSheet.absoluteFill}>
            <LaunchSplash onFinish={finish} />
          </View>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
