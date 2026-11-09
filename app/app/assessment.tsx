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
import { GoMeter } from '../../src/components/GoMeter';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import {
  fetchWeekJourney,
  runAssessment,
  saveAssessment,
  type AssessmentResult,
} from '../../src/lib/os/assessment';
import { fetchProfile } from '../../src/lib/os/profile';
import { colors } from '../../src/theme/colors';
import { GO_THRESHOLD } from '../../src/types/db';

export default function AssessmentScreen() {
  const { user, loading: authLoading } = useAuth();
  const [boot, setBoot] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [savedGo, setSavedGo] = useState<number | null>(null);
  const [monDone, setMonDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBoot(false);
      return;
    }
    Promise.all([fetchProfile(user.id), fetchWeekJourney(user.id)])
      .then(([profile, journey]) => {
        if (!profile?.onboarding_complete) {
          setNeedsOnboarding(true);
          return;
        }
        if (journey?.go_score != null) {
          setSavedGo(Number(journey.go_score));
          setMonDone(journey.mon_done);
          setResult({
            score: Number(journey.go_score),
            regime:
              Number(journey.go_score) >= GO_THRESHOLD ? 'volatile' : 'normal',
            go: journey.mon_done,
            source: 'local',
          });
        }
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

  const onRun = async () => {
    setBusy(true);
    setError(null);
    try {
      const assessed = await runAssessment();
      const journey = await saveAssessment(user.id, assessed);
      setResult(assessed);
      setSavedGo(Number(journey.go_score));
      setMonDone(journey.mon_done);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assessment failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>ASSESSMENT OS</Text>
      <Text style={styles.title}>68% GO Check</Text>
      <Text style={styles.sub}>
        Volatility regime meter. ≥{GO_THRESHOLD}% unlocks Monday on the FlowChain.
      </Text>

      <View style={styles.meterBox}>
        {result ? (
          <GoMeter score={result.score} />
        ) : (
          <Text style={styles.waiting}>Run assessment to read the market.</Text>
        )}
      </View>

      {result ? (
        <View style={styles.meta}>
          <Text style={styles.metaLine}>
            REGIME · {result.regime.toUpperCase()}
          </Text>
          <Text style={styles.metaLine}>
            SOURCE · {result.source.toUpperCase()}
          </Text>
          <Text style={styles.metaLine}>
            MONDAY · {monDone ? 'UNLOCKED' : 'LOCKED RED'}
          </Text>
          {savedGo != null ? (
            <Text style={styles.metaLine}>SAVED SCORE · {savedGo}%</Text>
          ) : null}
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.btn, busy && styles.btnDisabled]}
        disabled={busy}
        onPress={onRun}
      >
        {busy ? (
          <ActivityIndicator color={colors.navy} />
        ) : (
          <Text style={styles.btnText}>
            {result ? 'Re-run Assessment' : 'Run Assessment'}
          </Text>
        )}
      </Pressable>

      {result?.go ? (
        <Pressable
          style={styles.secondary}
          onPress={() => router.push('/app/finance')}
        >
          <Text style={styles.secondaryText}>Continue to Finance £50 dish →</Text>
        </Pressable>
      ) : result ? (
        <Text style={styles.waitNote}>
          NO-GO — wait for a calmer regime. Process &gt; prediction.
        </Text>
      ) : null}
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
  content: { padding: 20, paddingBottom: 48 },
  kicker: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  title: {
    marginTop: 6,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 32,
    color: colors.white,
  },
  sub: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 20,
  },
  meterBox: {
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 20,
  },
  waiting: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
  },
  meta: {
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 6,
  },
  metaLine: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
    color: colors.goldLight,
  },
  error: {
    marginTop: 12,
    color: colors.danger,
    fontFamily: 'Inter_500Medium',
  },
  btn: {
    marginTop: 24,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.navy,
    fontSize: 15,
  },
  secondary: { marginTop: 14, alignItems: 'center', padding: 12 },
  secondaryText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.gold,
  },
  waitNote: {
    marginTop: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.waiting,
    textAlign: 'center',
    lineHeight: 20,
  },
});
