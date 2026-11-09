import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { ScreenFrame } from '../../../src/components/layout/ScreenFrame';
import { useAuth } from '../../../src/lib/auth/AuthProvider';
import {
  FLOW_DAYS,
  dayStatus,
  doneCount,
  type DayKey,
} from '../../../src/lib/os/flowChain';
import { ensureWeekJourney } from '../../../src/lib/os/journey';
import { fetchProfile } from '../../../src/lib/os/profile';
import { colors } from '../../../src/theme/colors';
import type { Journey } from '../../../src/types/db';

export default function JourneyMapScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [boot, setBoot] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      Promise.all([fetchProfile(user.id), ensureWeekJourney(user.id)])
        .then(([profile, j]) => {
          if (!profile?.onboarding_complete) {
            setNeedsOnboarding(true);
            return;
          }
          setJourney(j);
        })
        .catch((e) => setError(e.message))
        .finally(() => setBoot(false));
    }, [user]),
  );

  if (authLoading || boot) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (!user) return <Redirect href="/app/login" />;
  if (needsOnboarding) return <Redirect href="/app/onboarding" />;

  const done = doneCount(journey);
  const heartLocked = done < 5;

  const openDay = (key: DayKey, href: string, status: string) => {
    if (status === 'locked') return;
    if (key === 'wed') {
      router.push('/app/simulator');
      return;
    }
    if (key === 'mon') {
      router.push('/app/assessment');
      return;
    }
    router.push(href as any);
  };

  return (
    <ScreenFrame maxWidth={720}>
      <Text style={styles.kicker}>JOURNEY OS · THE HEART</Text>
      <Text style={styles.title}>Mon → Fri FlowChain</Text>
      <Text style={styles.sub}>
        Must-complete chain. Skip a day and the next locks{' '}
        <Text style={styles.red}>RED</Text>. {done}/5 complete.
      </Text>

      <View style={styles.heartBadge}>
        <Text style={styles.heartText}>
          {heartLocked ? 'HEART LOCKED · RED' : 'HEART OPEN · FLOW COMPLETE'}
        </Text>
      </View>

      <View style={styles.chain}>
        {FLOW_DAYS.map((day, i) => {
          const status = dayStatus(journey, day.key);
          return (
            <View key={day.key} style={styles.dayWrap}>
              <Pressable
                onPress={() => openDay(day.key, day.href, status)}
                style={[
                  styles.dayCard,
                  status === 'done' && styles.dayDone,
                  status === 'open' && styles.dayOpen,
                  status === 'locked' && styles.dayLocked,
                ]}
              >
                <Text style={styles.dayLabel}>{day.label}</Text>
                <Text style={styles.dayTitle}>{day.title}</Text>
                <Text style={styles.dayMust}>{day.must}</Text>
                <Text style={styles.dayState}>
                  {status === 'done'
                    ? 'COMPLETE'
                    : status === 'open'
                      ? 'OPEN · TAP'
                      : 'LOCKED RED'}
                </Text>
              </Pressable>
              {i < FLOW_DAYS.length - 1 ? (
                <View
                  style={[
                    styles.connector,
                    dayStatus(journey, day.key) === 'done'
                      ? styles.connectorOn
                      : styles.connectorOff,
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={styles.secondary}
        onPress={() => router.push('/app/simulator')}
      >
        <Text style={styles.secondaryText}>Open Simulator (Wed) →</Text>
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
  kicker: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  title: {
    marginTop: 8,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 28,
    color: colors.white,
  },
  sub: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 22,
  },
  red: { color: colors.danger, fontFamily: 'Inter_600SemiBold' },
  heartBadge: {
    marginTop: 18,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.navyDeep,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  heartText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.danger,
  },
  chain: { marginTop: 22, gap: 0 },
  dayWrap: { marginBottom: 4 },
  dayCard: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.surface,
  },
  dayDone: { borderColor: colors.ready },
  dayOpen: { borderColor: colors.gold },
  dayLocked: { borderColor: colors.danger, opacity: 0.75 },
  dayLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  dayTitle: {
    marginTop: 4,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18,
    color: colors.white,
  },
  dayMust: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 13,
  },
  dayState: {
    marginTop: 10,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.goldLight,
  },
  connector: {
    width: 3,
    height: 14,
    marginLeft: 28,
    borderRadius: 2,
  },
  connectorOn: { backgroundColor: colors.ready },
  connectorOff: { backgroundColor: colors.border },
  error: { marginTop: 12, color: colors.danger },
  secondary: { marginTop: 20, padding: 12 },
  secondaryText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.gold,
  },
});
