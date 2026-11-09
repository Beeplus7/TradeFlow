import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import { ScreenFrame } from '../../src/components/layout/ScreenFrame';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import {
  ensureConnection,
  saveConnection,
  type ExchangeConnection,
  type ExchangeVenue,
} from '../../src/lib/os/connect';
import { colors } from '../../src/theme/colors';

const VENUES: { id: ExchangeVenue; title: string; blurb: string }[] = [
  { id: 'paper', title: 'Paper', blurb: 'Safe desk · no real keys' },
  { id: 'binance', title: 'Binance', blurb: 'Paper flag on · keys later' },
  { id: 'bybit', title: 'Bybit', blurb: 'Paper flag on · keys later' },
];

export default function ConnectScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [boot, setBoot] = useState(true);
  const [conn, setConn] = useState<ExchangeConnection | null>(null);
  const [venue, setVenue] = useState<ExchangeVenue>('paper');
  const [hint, setHint] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      ensureConnection(user.id)
        .then((c) => {
          setConn(c);
          setVenue(c.venue);
        })
        .catch((e) => setError(e.message))
        .finally(() => setBoot(false));
    }, [user]),
  );

  if (authLoading || boot) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (!user) return <Redirect href="/app/login" />;

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const c = await saveConnection({
        userId: user.id,
        venue,
        paperMode: true,
        keyHint: hint || undefined,
      });
      setConn(c);
      setNote('Connected in paper mode. Live executors stay feature-flagged off.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>CONNECT</Text>
      <Text style={styles.title}>Exchange desk</Text>
      <Text style={styles.sub}>
        Paper mode first. Binance / Bybit live keys unlock behind a flag later —
        never paste production secrets into this build.
      </Text>

      <View style={styles.row}>
        {VENUES.map((v) => {
          const on = venue === v.id;
          return (
            <Pressable
              key={v.id}
              style={[styles.card, on && styles.cardOn]}
              onPress={() => setVenue(v.id)}
            >
              <Text style={[styles.cardTitle, on && styles.cardTitleOn]}>
                {v.title}
              </Text>
              <Text style={styles.cardBlurb}>{v.blurb}</Text>
            </Pressable>
          );
        })}
      </View>

      {venue !== 'paper' ? (
        <TextInput
          style={styles.input}
          placeholder="Optional key last-4 hint (not the secret)"
          placeholderTextColor={colors.textMuted}
          value={hint}
          onChangeText={setHint}
          maxLength={8}
          autoCapitalize="characters"
        />
      ) : null}

      <View style={styles.status}>
        <Text style={styles.statusLabel}>CURRENT</Text>
        <Text style={styles.statusValue}>
          {conn?.label ?? '—'} · PAPER{' '}
          {conn?.key_hint ? `· ···${conn.key_hint}` : ''}
        </Text>
      </View>

      <Pressable
        style={[styles.btn, busy && styles.disabled]}
        disabled={busy}
        onPress={save}
      >
        {busy ? (
          <ActivityIndicator color={colors.navy} />
        ) : (
          <Text style={styles.btnText}>Save paper connection →</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.link}
        onPress={() => router.push('/app/execute')}
      >
        <Text style={styles.linkText}>Open Execution console →</Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {note ? <Text style={styles.note}>{note}</Text> : null}
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
  row: { marginTop: 20, gap: 10 },
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardOn: { borderColor: colors.gold },
  cardTitle: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.white,
    fontSize: 16,
  },
  cardTitleOn: { color: colors.gold },
  cardBlurb: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 13,
  },
  input: {
    marginTop: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    fontFamily: 'Inter_400Regular',
  },
  status: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.navyDeep,
  },
  statusLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 2,
    color: colors.gold,
  },
  statusValue: {
    marginTop: 6,
    fontFamily: 'Inter_500Medium',
    color: colors.white,
  },
  btn: {
    marginTop: 18,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { fontFamily: 'Montserrat_700Bold', color: colors.navy },
  disabled: { opacity: 0.5 },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: {
    fontFamily: 'Inter_500Medium',
    color: colors.goldLight,
  },
  error: { marginTop: 12, color: colors.danger },
  note: {
    marginTop: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.goldLight,
  },
});
