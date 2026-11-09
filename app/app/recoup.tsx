import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import { ScreenFrame } from '../../src/components/layout/ScreenFrame';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import {
  RECOUP_DAYS,
  advanceRecoupDay,
  ensureRecoup,
  type RecoupPlan,
} from '../../src/lib/os/recoup';
import { colors } from '../../src/theme/colors';

export default function RecoupScreen() {
  const { user, loading } = useAuth();
  const [boot, setBoot] = useState(true);
  const [plan, setPlan] = useState<RecoupPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      ensureRecoup(user.id)
        .then(setPlan)
        .catch((e) => setError(e.message))
        .finally(() => setBoot(false));
    }, [user]),
  );

  if (loading || boot) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (!user) return <Redirect href="/app/login" />;

  const pct = Math.round(
    (Number(plan?.recovered_gbp ?? 0) / Number(plan?.target_gbp ?? 50)) * 100,
  );

  const advance = async () => {
    setBusy(true);
    setError(null);
    try {
      setPlan(await advanceRecoupDay(user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Advance failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>RECOUP OS</Text>
      <Text style={styles.title}>18-day engine</Text>
      <Text style={styles.sub}>
        Steady recovery toward the £50 dish — one disciplined day at a time.
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>DAY</Text>
        <Text style={styles.big}>
          {plan?.day_index ?? 1} / {RECOUP_DAYS}
        </Text>
        <Text style={styles.meta}>
          Recovered £{Number(plan?.recovered_gbp ?? 0).toFixed(2)} of £
          {Number(plan?.target_gbp ?? 50).toFixed(2)} · {plan?.status}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.min(100, pct)}%` }]} />
        </View>
      </View>

      <Pressable
        style={[
          styles.btn,
          (busy || plan?.status === 'complete') && styles.disabled,
        ]}
        disabled={busy || plan?.status === 'complete'}
        onPress={advance}
      >
        {busy ? (
          <ActivityIndicator color={colors.navy} />
        ) : (
          <Text style={styles.btnText}>
            {plan?.status === 'complete' ? 'Recoup complete' : 'Mark day done →'}
          </Text>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
  card: {
    marginTop: 22,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
  },
  label: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  big: {
    marginTop: 6,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 36,
    color: colors.white,
  },
  meta: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
  },
  track: {
    marginTop: 14,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fill: { height: 8, backgroundColor: colors.gold },
  btn: {
    marginTop: 18,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { fontFamily: 'Montserrat_700Bold', color: colors.navy },
  disabled: { opacity: 0.5 },
  error: { marginTop: 12, color: colors.danger },
});
