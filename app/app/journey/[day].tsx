import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenFrame } from '../../../src/components/layout/ScreenFrame';
import { useAuth } from '../../../src/lib/auth/AuthProvider';
import {
  FLOW_DAYS,
  canAccessDay,
  dayDone,
  type DayKey,
} from '../../../src/lib/os/flowChain';
import { ensureWeekJourney, markDayDone } from '../../../src/lib/os/journey';
import { assertSupabase } from '../../../src/lib/supabase';
import { colors } from '../../../src/theme/colors';
import type { Journey } from '../../../src/types/db';

const VALID: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri'];

export default function JourneyDayScreen() {
  const { day: dayParam } = useLocalSearchParams<{ day: string }>();
  const day = (dayParam ?? '').toLowerCase() as DayKey;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [boot, setBoot] = useState(true);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [eliteLabel, setEliteLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const meta = FLOW_DAYS.find((d) => d.key === day);

  useFocusEffect(
    useCallback(() => {
      if (!user || !VALID.includes(day)) {
        setBoot(false);
        return;
      }
      if (day === 'wed') {
        router.replace('/app/simulator');
        return;
      }
      if (day === 'thu') {
        router.replace('/app/execute');
        return;
      }
      if (day === 'fri') {
        router.replace('/app/legacy');
        return;
      }
      if (day === 'mon') {
        router.replace('/app/assessment');
        return;
      }
      setBoot(true);
      ensureWeekJourney(user.id)
        .then(setJourney)
        .catch((e) => setError(e.message))
        .finally(() => setBoot(false));
    }, [user, day, router]),
  );

  if (!VALID.includes(day) || !meta) {
    return <Redirect href="/app/journey" />;
  }
  if (authLoading || boot) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (!user) return <Redirect href="/app/login" />;

  const locked = !canAccessDay(journey, day);
  const complete = dayDone(journey, day);

  const finishTue = async () => {
    if (!eliteLabel.trim()) {
      setError('Add at least one elite label to gather intel.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = assertSupabase();
      await supabase.from('elites').insert({
        user_id: user.id,
        label: eliteLabel.trim(),
        score: 70,
      });
      const j = await markDayDone(user.id, 'tue');
      setJourney(j);
      setNote('Tue EliteFlow complete — Wednesday Simulator unlocked.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not complete Tuesday');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>FLOWCHAIN · {meta.label}</Text>
      <Text style={styles.title}>{meta.title}</Text>
      <Text style={styles.sub}>{meta.must}</Text>

      {locked ? (
        <View style={styles.lockBox}>
          <Text style={styles.lockTitle}>LOCKED RED</Text>
          <Text style={styles.lockCopy}>
            Complete the previous day first. Must-complete is non-negotiable.
          </Text>
          <Pressable style={styles.btn} onPress={() => router.push('/app/journey')}>
            <Text style={styles.btnText}>Back to Journey map</Text>
          </Pressable>
        </View>
      ) : complete ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneTitle}>COMPLETE</Text>
          <Text style={styles.doneCopy}>{note ?? 'Day already finished this week.'}</Text>
          <Pressable style={styles.btn} onPress={() => router.push('/app/journey')}>
            <Text style={styles.btnText}>Journey map →</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.block}>
          {day === 'tue' ? (
            <>
              <Text style={styles.lead}>
                EliteFlow intel gather — add a personal elite to unlock Wednesday.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Elite label e.g. Whale-Alpha"
                placeholderTextColor={colors.textMuted}
                value={eliteLabel}
                onChangeText={setEliteLabel}
              />
              <Pressable
                style={[styles.btn, busy && styles.disabled]}
                disabled={busy}
                onPress={finishTue}
              >
                {busy ? (
                  <ActivityIndicator color={colors.navy} />
                ) : (
                  <Text style={styles.btnText}>Complete Tuesday →</Text>
                )}
              </Pressable>
            </>
          ) : null}

        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {note && !complete ? <Text style={styles.note}>{note}</Text> : null}
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
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
  },
  lockBox: {
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  lockTitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    letterSpacing: 2,
    color: colors.danger,
  },
  lockCopy: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 20,
  },
  doneBox: {
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.ready,
    backgroundColor: colors.surface,
  },
  doneTitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    letterSpacing: 2,
    color: colors.ready,
  },
  doneCopy: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
  },
  block: { marginTop: 24, gap: 12 },
  lead: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 22,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    fontFamily: 'Inter_400Regular',
  },
  btn: {
    marginTop: 8,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.navy,
  },
  disabled: { opacity: 0.55 },
  error: { marginTop: 12, color: colors.danger },
  note: { marginTop: 12, color: colors.goldLight, fontFamily: 'Inter_500Medium' },
});
