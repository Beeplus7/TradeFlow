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
import {
  fetchRecentScans,
  runEyesBoatScan,
  type WalletScan,
} from '../../src/lib/os/intelligence';
import { colors } from '../../src/theme/colors';

export default function IntelligenceScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [boot, setBoot] = useState(true);
  const [scans, setScans] = useState<WalletScan[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const reload = useCallback(async (id: string) => {
    setScans(await fetchRecentScans(id));
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

  if (loading || boot) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (!user) return <Redirect href="/app/login" />;

  const scan = async () => {
    setBusy(true);
    setError(null);
    try {
      const batch = await runEyesBoatScan(user.id);
      setNote(`Eyes Boat pulse · ${batch.length} wallets scored (paper).`);
      await reload(user.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={640}>
      <Text style={styles.kicker}>INTELLIGENCE · EYES BOAT</Text>
      <Text style={styles.title}>100-wallet pulse</Text>
      <Text style={styles.sub}>
        Paper scan stands in for the 30s cron. Live Arkham/DeFiLlama keys later.
      </Text>

      <Pressable
        style={[styles.btn, busy && styles.disabled]}
        disabled={busy}
        onPress={scan}
      >
        {busy ? (
          <ActivityIndicator color={colors.navy} />
        ) : (
          <Text style={styles.btnText}>Run Eyes Boat scan →</Text>
        )}
      </Pressable>

      <View style={styles.list}>
        {scans.slice(0, 20).map((s) => (
          <View key={s.id} style={styles.row}>
            <View>
              <Text style={styles.label}>{s.label}</Text>
              <Text style={styles.hint}>{s.wallet_hint}</Text>
            </View>
            <Text style={styles.score}>{Number(s.score).toFixed(0)}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.link} onPress={() => router.push('/app/commonwealth')}>
        <Text style={styles.linkText}>EliteFlow tribe →</Text>
      </Pressable>
      {note ? <Text style={styles.note}>{note}</Text> : null}
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
  btn: {
    marginTop: 20,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { fontFamily: 'Montserrat_700Bold', color: colors.navy },
  disabled: { opacity: 0.5 },
  list: { marginTop: 18, gap: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  label: { fontFamily: 'Montserrat_700Bold', color: colors.white },
  hint: {
    marginTop: 2,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: colors.textMuted,
  },
  score: { fontFamily: 'Montserrat_800ExtraBold', color: colors.gold, fontSize: 18 },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { fontFamily: 'Inter_500Medium', color: colors.goldLight },
  note: { marginTop: 12, color: colors.goldLight },
  error: { marginTop: 12, color: colors.danger },
});
