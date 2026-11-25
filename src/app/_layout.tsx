import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LaunchSplash } from '../components/LaunchSplash';
import { useSetup } from '../onboarding/setup/store';
import { setupPalette } from '../theme/tokens';

const ink = setupPalette.night;
export default function Layout() {
  const [fonts, error] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../../assets/fonts/Poppins-ExtraBold.ttf'),
  });
  const [launched, setLaunched] = useState(false),
    hydrated = useSetup((s) => s.hydrated);
  const complete = useSetup((s) => s.completed),
    finish = useCallback(() => setLaunched(true), []);
  useEffect(() => { void useSetup.getState().hydrate(); }, []);
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
              <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
            </Stack.Protected>
            <Stack.Protected guard={complete}>
              <Stack.Screen name="index" />
            </Stack.Protected>
          </Stack>
        )}
        {launched && (!hydrated || (!fonts && !error)) && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={ink.accent} accessibilityLabel="Preparing BrainSpace" />
          </View>
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
