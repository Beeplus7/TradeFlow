import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { ScreenFrame } from '../../src/components/layout/ScreenFrame';
import { DishVisual } from '../../src/components/DishVisual';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import { ensureFinanceDish } from '../../src/lib/os/finance';
import { fetchProfile } from '../../src/lib/os/profile';
import { fetchWeekJourney } from '../../src/lib/os/assessment';
import { colors } from '../../src/theme/colors';
import type { FinanceDish } from '../../src/types/db';

export default function FinanceScreen() {
  const { user, loading: authLoading } = useAuth();
  const [boot, setBoot] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [dish, setDish] = useState<FinanceDish | null>(null);
  const [goUnlocked, setGoUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBoot(false);
      return;
    }
    Promise.all([
      fetchProfile(user.id),
      ensureFinanceDish(user.id),
      fetchWeekJourney(user.id),
    ])
      .then(([profile, finance, journey]) => {
        if (!profile?.onboarding_complete) {
          setNeedsOnboarding(true);
          return;
        }
        setDish(finance);
        setGoUnlocked(Boolean(journey?.mon_done));
      })
      .catch((e) => setError(e.message))
      .finally(() => setBoot(false));
  }, [user]);

  if (authLoading || boot) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (!user) return <Redirect href="/app/login" />;
  if (needsOnboarding) return <Redirect href="/app/onboarding" />;

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>FINANCE OS</Text>
      <Text style={styles.title}>£50 In. Smile Out.</Text>
      <Text style={styles.sub}>
        Split the stack before you trade. Fake trains · live earns · safety guards.
      </Text>

      {dish ? (
        <DishVisual
          fake={Number(dish.fake_gbp)}
          live={Number(dish.live_gbp)}
          safety={Number(dish.safety_gbp)}
          daySpent={Number(dish.day_spent_gbp)}
          dayCap={Number(dish.day_cap_gbp)}
        />
      ) : null}

      <View style={styles.status}>
        <Text style={styles.statusLine}>
          MON GO · {goUnlocked ? 'CLEARED' : 'COMPLETE ASSESSMENT FIRST'}
        </Text>
        <Text style={styles.statusLine}>
          TOTAL · £
          {dish
            ? (
                Number(dish.fake_gbp) +
                Number(dish.live_gbp) +
                Number(dish.safety_gbp)
              ).toFixed(2)
            : '50.00'}
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={styles.btn}
        onPress={() => router.push(goUnlocked ? '/app/journey' : '/app/assessment')}
      >
        <Text style={styles.btnText}>
          {goUnlocked ? 'Open Journey Heart →' : 'Back to Assessment →'}
        </Text>
      </Pressable>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 48, gap: 16 },
  kicker: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  title: {
    marginTop: 6,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 28,
    color: colors.white,
  },
  sub: {
    marginTop: 4,
    marginBottom: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 20,
  },
  status: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 6,
  },
  statusLine: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
    color: colors.goldLight,
  },
  error: { color: colors.danger, fontFamily: 'Inter_500Medium' },
  btn: {
    marginTop: 8,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.navy,
    fontSize: 15,
  },
});
