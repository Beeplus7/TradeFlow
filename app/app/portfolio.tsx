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
import { ensureFinanceDish } from '../../src/lib/os/finance';
import { ensureGuardianState } from '../../src/lib/os/guardian';
import { fetchTodayLiveTrades } from '../../src/lib/os/execution';
import { fetchSimTrades } from '../../src/lib/os/simulator';
import type { FinanceDish } from '../../src/types/db';
import { colors } from '../../src/theme/colors';

export default function PortfolioScreen() {
  const { user, loading } = useAuth();
  const [boot, setBoot] = useState(true);
  const [dish, setDish] = useState<FinanceDish | null>(null);
  const [simPnl, setSimPnl] = useState(0);
  const [livePnl, setLivePnl] = useState(0);
  const [guard, setGuard] = useState('—');

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      Promise.all([
        ensureFinanceDish(user.id),
        fetchSimTrades(user.id),
        fetchTodayLiveTrades(user.id),
        ensureGuardianState(user.id).catch(() => null),
      ])
        .then(([d, sim, live, g]) => {
          setDish(d);
          setSimPnl(sim.reduce((a, t) => a + Number(t.pnl_gbp), 0));
          setLivePnl(live.reduce((a, t) => a + Number(t.pnl_gbp), 0));
          setGuard(g?.status ?? '—');
        })
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

  const rows = [
    ['Sim bank', `£${(5 + simPnl).toFixed(2)}`],
    ['Live desk', `£${Number(dish?.live_gbp ?? 0).toFixed(2)}`],
    ['Safety vault', `£${Number(dish?.safety_gbp ?? 0).toFixed(2)}`],
    ['Today PnL (live)', `£${livePnl.toFixed(2)}`],
    ['Day spent', `£${Number(dish?.day_spent_gbp ?? 0).toFixed(2)}`],
    ['Guardian', guard.toUpperCase()],
  ];

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>PORTFOLIO</Text>
      <Text style={styles.title}>Positions desk</Text>
      <Text style={styles.sub}>Paper balances across sim, live, and vault.</Text>
      <View style={styles.list}>
        {rows.map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.k}>{k}</Text>
            <Text style={styles.v}>{v}</Text>
          </View>
        ))}
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
  list: { marginTop: 22, gap: 0 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  k: { fontFamily: 'Inter_400Regular', color: colors.textMuted },
  v: { fontFamily: 'Montserrat_700Bold', color: colors.white },
});
