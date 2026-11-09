import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import { ScreenFrame } from '../../../src/components/layout/ScreenFrame';
import { useAuth } from '../../../src/lib/auth/AuthProvider';
import { assertSupabase } from '../../../src/lib/supabase';
import { colors } from '../../../src/theme/colors';

type Nudge = {
  id: string;
  kind: string;
  body: string;
  created_at: string;
};

export default function AdminNudges() {
  const { user, loading } = useAuth();
  const [boot, setBoot] = useState(true);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async (id: string) => {
    const { data, error } = await assertSupabase()
      .from('nudges')
      .select('id,kind,body,created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) throw error;
    setNudges((data ?? []) as Nudge[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      reload(user.id).finally(() => setBoot(false));
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

  const send = async () => {
    setBusy(true);
    try {
      await assertSupabase().from('nudges').insert({
        user_id: user.id,
        kind: 'uprm',
        body: 'UPRM nudge · keep FlowChain must-complete. £50 In Smile Out.',
      });
      await reload(user.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>ADMIN · NUDGES</Text>
      <Text style={styles.title}>UPRM nudges</Text>
      <Pressable style={[styles.btn, busy && styles.disabled]} disabled={busy} onPress={send}>
        <Text style={styles.btnText}>Send paper nudge →</Text>
      </Pressable>
      <View style={styles.list}>
        {nudges.map((n) => (
          <View key={n.id} style={styles.row}>
            <Text style={styles.kind}>{n.kind}</Text>
            <Text style={styles.body}>{n.body}</Text>
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
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kind: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: colors.gold,
  },
  body: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    color: colors.white,
  },
});
