import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import { ScreenFrame } from '../../../src/components/layout/ScreenFrame';
import { useAuth } from '../../../src/lib/auth/AuthProvider';
import { fetchRecentScans } from '../../../src/lib/os/intelligence';
import { colors } from '../../../src/theme/colors';

export default function AdminElites() {
  const { user, loading } = useAuth();
  const [boot, setBoot] = useState(true);
  const [scans, setScans] = useState(0);
  const [avg, setAvg] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      fetchRecentScans(user.id, 100)
        .then((rows) => {
          setScans(rows.length);
          const a =
            rows.length === 0
              ? 0
              : rows.reduce((s, r) => s + Number(r.score), 0) / rows.length;
          setAvg(Math.round(a));
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

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>ADMIN · ELITES</Text>
      <Text style={styles.title}>100-wallet board</Text>
      <Text style={styles.stat}>{scans} scans · avg score {avg}</Text>
      <Text style={styles.copy}>
        Eyes Boat paper pulses feed this board. Production cron = 30s / 100
        wallets.
      </Text>
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
  stat: {
    marginTop: 22,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 20,
    color: colors.gold,
  },
  copy: {
    marginTop: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 22,
  },
});
