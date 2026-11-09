import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { ScreenFrame } from '../../src/components/layout/ScreenFrame';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import { fetchProfile } from '../../src/lib/os/profile';
import { ensureFinanceDish } from '../../src/lib/os/finance';
import {
  ensureGuardianState,
  resetGuardianProtected,
  riskLabel,
  runGuardianCheck,
  simulateDrawdownHit,
  type GuardianState,
} from '../../src/lib/os/guardian';
import type { FinanceDish, Profile } from '../../src/types/db';
import { colors } from '../../src/theme/colors';

const CHECK_MS = 10_000;

export default function GuardianScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [boot, setBoot] = useState(true);
  const [state, setState] = useState<GuardianState | null>(null);
  const [dish, setDish] = useState<FinanceDish | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const reload = useCallback(async (userId: string) => {
    const [s, d, p] = await Promise.all([
      runGuardianCheck(userId),
      ensureFinanceDish(userId),
      fetchProfile(userId),
    ]);
    setState(s);
    setDish(d);
    setProfile(p);
    setTick((n) => n + 1);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      ensureGuardianState(user.id)
        .then(() => reload(user.id))
        .catch((e) => setError(e.message))
        .finally(() => setBoot(false));

      timer.current = setInterval(() => {
        reload(user.id).catch(() => undefined);
      }, CHECK_MS);

      return () => {
        if (timer.current) clearInterval(timer.current);
      };
    }, [user, reload]),
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  if (authLoading || boot) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (!user) return <Redirect href="/app/login" />;

  const triggered = state?.status === 'triggered';
  const threshold = profile?.risk_pct ?? state?.risk_pct ?? 15;
  const dd = Number(state?.drawdown_pct ?? 0);
  const fill = Math.min(100, (dd / threshold) * 100);

  const stress = async () => {
    setBusy(true);
    setError(null);
    try {
      // Push drawdown past threshold for paper demo
      const loss = Math.max(
        1,
        Number(
          (
            Number(dish?.live_gbp ?? 35) *
            ((threshold + 2) / 100)
          ).toFixed(2),
        ),
      );
      const s = await simulateDrawdownHit(user.id, loss);
      setState(s);
      setDish(await ensureFinanceDish(user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Stress failed');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    setError(null);
    try {
      const s = await resetGuardianProtected(user.id);
      setState(s);
      setDish(await ensureFinanceDish(user.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>GUARDIAN OS</Text>
      <Text style={styles.title}>Shield</Text>
      <Text style={styles.sub}>
        Tap-out {riskLabel(profile, state)} · £10 vault · ~10s check cron
      </Text>

      <View style={[styles.shield, triggered ? styles.shieldTrig : styles.shieldOk]}>
        <Text style={styles.shieldStatus}>
          {triggered ? 'TRIGGERED' : 'PROTECTED'}
        </Text>
        <Text style={styles.shieldRing}>
          {threshold}% · drawdown {dd.toFixed(1)}%
        </Text>
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${fill}%`,
                backgroundColor: triggered ? colors.danger : colors.gold,
              },
            ]}
          />
        </View>
        <Text style={styles.shieldMeta}>
          Equity £{Number(state?.equity_gbp ?? 0).toFixed(2)} · Peak £
          {Number(state?.peak_equity_gbp ?? 0).toFixed(2)}
        </Text>
        <Text style={styles.shieldMeta}>
          Vault £{Number(state?.vault_gbp ?? dish?.safety_gbp ?? 10).toFixed(2)}{' '}
          · checks {tick}
        </Text>
      </View>

      {triggered ? (
        <View style={styles.warn}>
          <Text style={styles.warnTitle}>AUTO TAP-OUT</Text>
          <Text style={styles.warnCopy}>
            Drawdown breached {threshold}%. Live desk moved toward the £10
            safety vault. Execution is locked until you reset (paper).
          </Text>
        </View>
      ) : (
        <Text style={styles.hint}>
          Cron runs every 10s while this screen is open. Stress-test to prove
          lock-out.
        </Text>
      )}

      <View style={styles.actions}>
        {!triggered ? (
          <Pressable
            style={[styles.btnDanger, busy && styles.disabled]}
            disabled={busy}
            onPress={stress}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.btnDangerText}>Simulate tap-out →</Text>
            )}
          </Pressable>
        ) : (
          <Pressable
            style={[styles.btn, busy && styles.disabled]}
            disabled={busy}
            onPress={reset}
          >
            {busy ? (
              <ActivityIndicator color={colors.navy} />
            ) : (
              <Text style={styles.btnText}>Reset shield (paper) →</Text>
            )}
          </Pressable>
        )}
      </View>

      <Pressable style={styles.link} onPress={() => router.push('/app/execute')}>
        <Text style={styles.linkText}>Back to Execution →</Text>
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
  shield: {
    marginTop: 22,
    padding: 22,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  shieldOk: { borderColor: colors.ready },
  shieldTrig: { borderColor: colors.danger },
  shieldStatus: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 22,
    letterSpacing: 2,
    color: colors.white,
  },
  shieldRing: {
    marginTop: 8,
    fontFamily: 'JetBrainsMono_400Regular',
    color: colors.gold,
    fontSize: 12,
  },
  meterTrack: {
    marginTop: 16,
    width: '100%',
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.navyDeep,
    overflow: 'hidden',
  },
  meterFill: { height: 10, borderRadius: 6 },
  shieldMeta: {
    marginTop: 10,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 13,
  },
  warn: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.navyDeep,
  },
  warnTitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    letterSpacing: 2,
    color: colors.danger,
  },
  warnCopy: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 20,
  },
  hint: {
    marginTop: 16,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 20,
  },
  actions: { marginTop: 18 },
  btn: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { fontFamily: 'Montserrat_700Bold', color: colors.navy },
  btnDanger: {
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDangerText: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.white,
  },
  disabled: { opacity: 0.5 },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { fontFamily: 'Inter_500Medium', color: colors.goldLight },
  error: { marginTop: 12, color: colors.danger },
});
