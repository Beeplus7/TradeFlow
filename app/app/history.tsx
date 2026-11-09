import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import { ScreenFrame } from '../../src/components/layout/ScreenFrame';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import { assertSupabase } from '../../src/lib/supabase';
import { colors } from '../../src/theme/colors';

type TradeRow = {
  id: string;
  mode: string;
  side: string;
  symbol: string;
  notional_gbp: number;
  pnl_gbp: number;
  created_at: string;
};

export default function HistoryScreen() {
  const { user, loading } = useAuth();
  const [boot, setBoot] = useState(true);
  const [trades, setTrades] = useState<TradeRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      (async () => {
        const { data, error } = await assertSupabase()
          .from('trades')
          .select('id,mode,side,symbol,notional_gbp,pnl_gbp,created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        if (!error) setTrades((data ?? []) as TradeRow[]);
        setBoot(false);
      })().catch(() => setBoot(false));
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

  return (
    <ScreenFrame maxWidth={640}>
      <Text style={styles.kicker}>HISTORY</Text>
      <Text style={styles.title}>Trade log</Text>
      <Text style={styles.sub}>Sim + live paper ticks · newest first.</Text>
      <View style={styles.list}>
        {trades.length === 0 ? (
          <Text style={styles.empty}>No trades yet.</Text>
        ) : (
          trades.map((t) => (
            <View key={t.id} style={styles.row}>
              <View>
                <Text style={styles.main}>
                  {t.mode.toUpperCase()} · {t.side.toUpperCase()} {t.symbol}
                </Text>
                <Text style={styles.meta}>
                  £{Number(t.notional_gbp).toFixed(2)} ·{' '}
                  {new Date(t.created_at).toLocaleString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.pnl,
                  Number(t.pnl_gbp) >= 0 ? styles.pos : styles.neg,
                ]}
              >
                {Number(t.pnl_gbp) >= 0 ? '+' : ''}£
                {Number(t.pnl_gbp).toFixed(2)}
              </Text>
            </View>
          ))
        )}
      </View>
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
  },
  list: { marginTop: 20, gap: 8 },
  empty: { fontFamily: 'Inter_400Regular', color: colors.textMuted },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  main: { fontFamily: 'Montserrat_700Bold', color: colors.white, fontSize: 13 },
  meta: {
    marginTop: 4,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: colors.textMuted,
  },
  pnl: { fontFamily: 'Montserrat_700Bold', fontSize: 14 },
  pos: { color: colors.ready },
  neg: { color: colors.danger },
});
