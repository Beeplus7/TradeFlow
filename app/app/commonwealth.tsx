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
  MAX_PERSONAL_ELITES,
  addElite,
  fetchElites,
  type Elite,
} from '../../src/lib/os/elites';
import { colors } from '../../src/theme/colors';

export default function CommonwealthScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [boot, setBoot] = useState(true);
  const [elites, setElites] = useState<Elite[]>([]);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (id: string) => {
    setElites(await fetchElites(id));
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

  const add = async () => {
    if (!label.trim()) {
      setError('Name an elite.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await addElite({ userId: user.id, label });
      setLabel('');
      await reload(user.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={640}>
      <Text style={styles.kicker}>COMMONWEALTH · ELITEFLOW</Text>
      <Text style={styles.title}>Whale Tribe</Text>
      <Text style={styles.sub}>
        Personal {MAX_PERSONAL_ELITES} elites · Commonwealth over competition.
      </Text>

      <Text style={styles.meta}>
        {elites.length}/{MAX_PERSONAL_ELITES} seats filled
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Elite label"
        placeholderTextColor={colors.textMuted}
        value={label}
        onChangeText={setLabel}
      />
      <Pressable
        style={[styles.btn, busy && styles.disabled]}
        disabled={busy}
        onPress={add}
      >
        {busy ? (
          <ActivityIndicator color={colors.navy} />
        ) : (
          <Text style={styles.btnText}>Add elite →</Text>
        )}
      </Pressable>

      <View style={styles.list}>
        {elites.length === 0 ? (
          <Text style={styles.empty}>No elites yet — gather Tue intel here.</Text>
        ) : (
          elites.map((e) => (
            <View key={e.id} style={styles.row}>
              <Text style={styles.rowLabel}>{e.label}</Text>
              <Text style={styles.rowScore}>{Number(e.score).toFixed(0)}</Text>
            </View>
          ))
        )}
      </View>

      <Pressable style={styles.link} onPress={() => router.push('/app/intelligence')}>
        <Text style={styles.linkText}>Eyes Boat scan →</Text>
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
  meta: {
    marginTop: 18,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
    color: colors.goldLight,
  },
  input: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    fontFamily: 'Inter_400Regular',
  },
  btn: {
    marginTop: 12,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { fontFamily: 'Montserrat_700Bold', color: colors.navy },
  disabled: { opacity: 0.5 },
  list: { marginTop: 20, gap: 8 },
  empty: { fontFamily: 'Inter_400Regular', color: colors.textMuted },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowLabel: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.white,
  },
  rowScore: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: colors.gold,
  },
  link: { marginTop: 18, alignItems: 'center' },
  linkText: { fontFamily: 'Inter_500Medium', color: colors.goldLight },
  error: { marginTop: 12, color: colors.danger },
});
