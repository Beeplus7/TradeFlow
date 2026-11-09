import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function OsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.navy },
        headerTintColor: colors.gold,
        headerTitleStyle: { fontFamily: 'Montserrat_700Bold' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'TradFlow OS' }} />
      <Stack.Screen name="login" options={{ title: 'Sign in', headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ title: 'Onboarding' }} />
      <Stack.Screen name="assessment" options={{ title: 'Assessment' }} />
      <Stack.Screen name="finance" options={{ title: 'Finance' }} />
    </Stack>
  );
}
