import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import { ScreenFrame } from '../../../src/components/layout/ScreenFrame';
import { useAuth } from '../../../src/lib/auth/AuthProvider';
import { fetchElites } from '../../../src/lib/os/elites';
import { colors } from '../../../src/theme/colors';

export default function AdminTribe() {
  const { user, loading } = useAuth();
  const [boot, setBoot] = useState(true);
  const [count, setCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      fetchElites(user.id)
        .then((e) => setCount(e.length))
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
      <Text style={styles.kicker}>ADMIN · TRIBE</Text>
      <Text style={styles.title}>Commonwealth pulse</Text>
      <Text style={styles.stat}>{count} personal elites on this desk</Text>
      <Text style={styles.copy}>
        Global tribe analytics ship with shared company API. Today: your
        EliteFlow seat count is the live signal.
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
    fontSize: 22,
    color: colors.gold,
  },
  copy: {
    marginTop: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 22,
  },
});
