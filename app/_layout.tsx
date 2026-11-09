import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import {
  useFonts,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { AuthProvider } from '../src/lib/auth/AuthProvider';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {}, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.navy } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="how-it-works" />
        <Stack.Screen name="pricing" />
        <Stack.Screen name="commonwealth" />
        <Stack.Screen name="about" />
        <Stack.Screen name="manifesto" />
        <Stack.Screen name="legal" />
        <Stack.Screen name="assessment-demo" />
        <Stack.Screen name="scorecard" />
        <Stack.Screen name="readiness" />
        <Stack.Screen name="app" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
