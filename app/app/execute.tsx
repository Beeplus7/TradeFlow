import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { ScreenFrame } from '../../src/components/layout/ScreenFrame';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import { ensureWeekJourney, markDayDone } from '../../src/lib/os/journey';
import { canAccessDay, dayDone } from '../../src/lib/os/flowChain';
import { fetchProfile } from '../../src/lib/os/profile';
import { ensureConnection } from '../../src/lib/os/connect';
import {
  allGatesGreen,
  capStatus,
  fetchTodayLiveTrades,
  gateFive,
  placePaperExecute,
  resetDayCapIfNeeded,
  type GateCheck,
  type LiveTrade,
} from '../../src/lib/os/execution';
import {
  ensureGuardianState,
  runGuardianCheck,
  type GuardianState,
} from '../../src/lib/os/guardian';
import type { FinanceDish, Journey } from '../../src/types/db';
import { colors } from '../../src/theme/colors';

export default function ExecuteScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [boot, setBoot] = useState(true);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [dish, setDish] = useState<FinanceDish | null>(null);
  const [guardian, setGuardian] = useState<GuardianState | null>(null);
  const [gates, setGates] = useState<GateCheck[]>([]);
  const [trades, setTrades] = useState<LiveTrade[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async (userId: string) => {
    const [j, d, g, profile, tradesToday] = await Promise.all([
      ensureWeekJourney(userId),
      resetDayCapIfNeeded(userId),
      ensureGuardianState(userId).then(() => runGuardianCheck(userId)),
      fetchProfile(userId),
      fetchTodayLiveTrades(userId),
    ]);
    await ensureConnection(userId);
    setJourney(j);
    setDish(d);
    setGuardian(g);
    setTrades(tradesToday);
    setGates(gateFive({ profile, journey: j, dish: d, guardian: g }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      reload(user.id)
        .catch((e) => setError(e.message))
        .finally(() => setBoot(false));
    }, [user, reload]),
  );

  if (authLoading || boot) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (!user) return <Redirect href="/app/login" />;

  const locked = !canAccessDay(journey, 'thu');
  const thuDone = dayDone(journey, 'thu');
  const cap = capStatus(dish);
  const greens = allGatesGreen(gates);
  const guardianDown = guardian?.status === 'triggered';

  const trade = async (side: 'buy' | 'sell') => {
    setBusy(true);
    setError(null);
    try {
      const result = await placePaperExecute({
        userId: user.id,
        side,
        gates,
        guardian,
        venue: 'paper',
      });
      setLogs((prev) => [result.log, ...prev].slice(0, 24));
      await reload(user.id);
      if (capStatus(result.dish).locked) {
        setMessage('£7/day LOCKED — cap reached. Mark Thursday when ready.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Execute failed');
    } finally {
      setBusy(false);
    }
  };

  const finishThursday = async () => {
    if (!greens && !cap.locked && trades.length === 0) {
      setError('Need Gate 5 greens and at least one paper tick, or a full cap day.');
      return;
    }
    if (guardianDown) {
      setError('Guardian triggered — clear shield before closing Thursday.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const j = await markDayDone(user.id, 'thu');
      setJourney(j);
      setMessage('Thursday Execute complete — Friday Legacy unlocked.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not mark Thursday');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={640}>
      <Text style={styles.kicker}>EXECUTION OS</Text>
      <Text style={styles.title}>Live console</Text>
      <Text style={styles.sub}>
        Paper executor · £7/day hard cap · slippage guard · Gate 5 greens
      </Text>

      {locked ? (
        <View style={styles.lockBox}>
          <Text style={styles.lockTitle}>LOCKED RED</Text>
          <Text style={styles.lockCopy}>
            Complete Mon→Wed FlowChain before Thursday Execute.
          </Text>
          <Pressable
            style={styles.btn}
            onPress={() => router.push('/app/journey')}
          >
            <Text style={styles.btnText}>Open Journey map</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={[styles.capBox, cap.locked && styles.capLocked]}>
            <Text style={styles.capLabel}>DAY CAP</Text>
            <Text style={styles.capValue}>
              £{cap.spent.toFixed(2)} / £{cap.cap.toFixed(2)}
            </Text>
            <Text style={styles.capMeta}>
              {cap.locked
                ? 'LOCKED — no more ticks today'
                : `£${cap.remaining.toFixed(2)} remaining · max £2 / tick`}
            </Text>
          </View>

          {guardianDown ? (
            <View style={styles.shieldRed}>
              <Text style={styles.shieldTitle}>GUARDIAN RED</Text>
              <Text style={styles.shieldCopy}>
                Tap-out active. Execution halted until shield resets.
              </Text>
              <Pressable
                style={styles.btn}
                onPress={() => router.push('/app/guardian')}
              >
                <Text style={styles.btnText}>Open Guardian →</Text>
              </Pressable>
            </View>
          ) : null}

          <Text style={styles.section}>GATE 5 GREENS</Text>
          <View style={styles.gates}>
            {gates.map((g) => (
              <View key={g.id} style={styles.gateRow}>
                <Text style={[styles.gateDot, g.ok ? styles.ok : styles.bad]}>
                  {g.ok ? '●' : '○'}
                </Text>
                <Text style={styles.gateLabel}>{g.label}</Text>
              </View>
            ))}
          </View>

          {!thuDone && !guardianDown ? (
            <View style={styles.actions}>
              <Pressable
                style={[
                  styles.tradeBtn,
                  styles.buy,
                  (busy || !greens || cap.locked) && styles.disabled,
                ]}
                disabled={busy || !greens || cap.locked}
                onPress={() => trade('buy')}
              >
                <Text style={styles.tradeText}>BUY £2</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.tradeBtn,
                  styles.sell,
                  (busy || !greens || cap.locked) && styles.disabled,
                ]}
                disabled={busy || !greens || cap.locked}
                onPress={() => trade('sell')}
              >
                <Text style={styles.tradeText}>SELL £2</Text>
              </Pressable>
            </View>
          ) : null}

          <Text style={styles.section}>CONSOLE</Text>
          <ScrollView style={styles.console} nestedScrollEnabled>
            {logs.length === 0 && trades.length === 0 ? (
              <Text style={styles.consoleEmpty}>
                waiting for paper ticks…
              </Text>
            ) : (
              <>
                {logs.map((line, i) => (
                  <Text key={`l-${i}`} style={styles.consoleLine}>
                    {line}
                  </Text>
                ))}
                {trades
                  .slice()
                  .reverse()
                  .map((t) => (
                    <Text key={t.id} style={styles.consoleLine}>
                      {t.side.toUpperCase()} {t.symbol} £
                      {Number(t.notional_gbp).toFixed(2)} pnl{' '}
                      {Number(t.pnl_gbp) >= 0 ? '+' : ''}£
                      {Number(t.pnl_gbp).toFixed(2)}
                    </Text>
                  ))}
              </>
            )}
          </ScrollView>

          {thuDone ? (
            <Text style={styles.message}>
              Thursday marked. Friday is open on the FlowChain.
            </Text>
          ) : (
            <Pressable
              style={[
                styles.btn,
                (busy || guardianDown || (trades.length === 0 && !cap.locked)) &&
                  styles.disabled,
              ]}
              disabled={
                busy || guardianDown || (trades.length === 0 && !cap.locked)
              }
              onPress={finishThursday}
            >
              {busy ? (
                <ActivityIndicator color={colors.navy} />
              ) : (
                <Text style={styles.btnText}>Mark Thursday complete →</Text>
              )}
            </Pressable>
          )}

          <Pressable
            style={styles.link}
            onPress={() => router.push('/app/connect')}
          >
            <Text style={styles.linkText}>Exchange connect →</Text>
          </Pressable>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
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
  capBox: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: '#050A12',
  },
  capLocked: { borderColor: colors.danger },
  capLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  capValue: {
    marginTop: 6,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 32,
    color: colors.white,
  },
  capMeta: {
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 13,
  },
  shieldRed: {
    marginTop: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: colors.surface,
  },
  shieldTitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    letterSpacing: 2,
    color: colors.danger,
  },
  shieldCopy: {
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
  },
  section: {
    marginTop: 20,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  gates: { marginTop: 10, gap: 8 },
  gateRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  gateDot: { fontSize: 14, width: 16 },
  ok: { color: colors.ready },
  bad: { color: colors.textMuted },
  gateLabel: {
    fontFamily: 'Inter_400Regular',
    color: colors.white,
    fontSize: 14,
  },
  actions: { marginTop: 16, flexDirection: 'row', gap: 10 },
  tradeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buy: { backgroundColor: colors.ready },
  sell: { backgroundColor: colors.danger },
  tradeText: { fontFamily: 'Montserrat_700Bold', color: colors.navy },
  console: {
    marginTop: 10,
    maxHeight: 160,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#02060C',
    borderWidth: 1,
    borderColor: colors.border,
  },
  consoleEmpty: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: colors.textMuted,
    fontSize: 11,
  },
  consoleLine: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: colors.gold,
    fontSize: 11,
    marginBottom: 6,
  },
  btn: {
    marginTop: 18,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { fontFamily: 'Montserrat_700Bold', color: colors.navy },
  disabled: { opacity: 0.45 },
  link: { marginTop: 14, alignItems: 'center' },
  linkText: { fontFamily: 'Inter_500Medium', color: colors.goldLight },
  error: { marginTop: 12, color: colors.danger },
  message: {
    marginTop: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.goldLight,
  },
});
