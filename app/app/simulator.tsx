import { useCallback, useState } from 'react';
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
import { canAccessDay, dayDone } from '../../src/lib/os/flowChain';
import { ensureWeekJourney, markDayDone } from '../../src/lib/os/journey';
import {
  fetchSimTrades,
  placeSimTrade,
  saveDisciplineProof,
  simSummary,
  type SimTrade,
} from '../../src/lib/os/simulator';
import { colors } from '../../src/theme/colors';
import type { Journey } from '../../src/types/db';

export default function SimulatorScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [boot, setBoot] = useState(true);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [trades, setTrades] = useState<SimTrade[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async (userId: string) => {
    const [j, t] = await Promise.all([
      ensureWeekJourney(userId),
      fetchSimTrades(userId),
    ]);
    setJourney(j);
    setTrades(t);
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

  const locked = !canAccessDay(journey, 'wed');
  const wedDone = dayDone(journey, 'wed');
  const summary = simSummary(trades);

  const trade = async (side: 'buy' | 'sell') => {
    if (summary.count >= 6) {
      setError('Session cap — 6 sim trades. Prove discipline, then unlock.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await placeSimTrade({ userId: user.id, side, notional: 1.5 });
      await reload(user.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Trade failed');
    } finally {
      setBusy(false);
    }
  };

  const unlockThursday = async () => {
    if (!summary.disciplineProof) {
      setError('Need ≥3 trades with ≥40% win rate for discipline proof.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await saveDisciplineProof(user.id, summary.bank);
      const j = await markDayDone(user.id, 'wed');
      setJourney(j);
      setMessage('Discipline proof saved — Thursday Execute unlocked.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not unlock');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>SIMULATOR OS</Text>
      <Text style={styles.title}>£5 fake training</Text>
      <Text style={styles.sub}>
        Zero-risk reps before live. Discipline proof unlocks Thursday.
      </Text>

      {locked ? (
        <View style={styles.lockBox}>
          <Text style={styles.lockTitle}>LOCKED RED</Text>
          <Text style={styles.lockCopy}>
            Complete Monday Assessment and Tuesday EliteFlow first.
          </Text>
          <Pressable style={styles.btn} onPress={() => router.push('/app/journey')}>
            <Text style={styles.btnText}>Open Journey map</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.bank}>
            <Text style={styles.bankLabel}>SIM BANK</Text>
            <Text style={styles.bankValue}>£{summary.bank.toFixed(2)}</Text>
            <Text style={styles.bankMeta}>
              {summary.count} trades · {summary.wins} wins ·{' '}
              {(summary.winRate * 100).toFixed(0)}% WR · PnL £
              {summary.pnl.toFixed(2)}
            </Text>
            <Text style={styles.proof}>
              Discipline proof ·{' '}
              {summary.disciplineProof ? 'READY' : 'NEED ≥3 TRADES · ≥40% WR'}
            </Text>
          </View>

          {!wedDone ? (
            <View style={styles.actions}>
              <Pressable
                style={[styles.tradeBtn, styles.buy, busy && styles.disabled]}
                disabled={busy}
                onPress={() => trade('buy')}
              >
                <Text style={styles.tradeText}>BUY £1.50</Text>
              </Pressable>
              <Pressable
                style={[styles.tradeBtn, styles.sell, busy && styles.disabled]}
                disabled={busy}
                onPress={() => trade('sell')}
              >
                <Text style={styles.tradeText}>SELL £1.50</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.list}>
            {trades.length === 0 ? (
              <Text style={styles.empty}>No sim trades yet — place your first.</Text>
            ) : (
              trades
                .slice()
                .reverse()
                .map((t) => (
                  <View key={t.id} style={styles.row}>
                    <Text style={styles.rowSide}>
                      {t.side.toUpperCase()} {t.symbol}
                    </Text>
                    <Text
                      style={[
                        styles.rowPnl,
                        Number(t.pnl_gbp) >= 0 ? styles.pos : styles.neg,
                      ]}
                    >
                      {Number(t.pnl_gbp) >= 0 ? '+' : ''}
                      £{Number(t.pnl_gbp).toFixed(2)}
                    </Text>
                  </View>
                ))
            )}
          </View>

          {wedDone ? (
            <Text style={styles.message}>
              Wednesday complete. Thursday is open on the FlowChain.
            </Text>
          ) : (
            <Pressable
              style={[
                styles.btn,
                (!summary.disciplineProof || busy) && styles.disabled,
              ]}
              disabled={!summary.disciplineProof || busy}
              onPress={unlockThursday}
            >
              {busy ? (
                <ActivityIndicator color={colors.navy} />
              ) : (
                <Text style={styles.btnText}>Unlock Thursday →</Text>
              )}
            </Pressable>
          )}
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
  bank: {
    marginTop: 22,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
  },
  bankLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  bankValue: {
    marginTop: 6,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 36,
    color: colors.white,
  },
  bankMeta: {
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 13,
  },
  proof: {
    marginTop: 10,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
    color: colors.goldLight,
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
  tradeText: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.navy,
  },
  list: { marginTop: 18, gap: 8 },
  empty: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowSide: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: colors.white,
    fontSize: 12,
  },
  rowPnl: { fontFamily: 'Montserrat_700Bold', fontSize: 14 },
  pos: { color: colors.ready },
  neg: { color: colors.danger },
  btn: {
    marginTop: 18,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.navy,
  },
  disabled: { opacity: 0.45 },
  error: { marginTop: 12, color: colors.danger },
  message: {
    marginTop: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.goldLight,
  },
});
