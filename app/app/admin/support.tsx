import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { ScreenFrame } from '../../../src/components/layout/ScreenFrame';
import { useAuth } from '../../../src/lib/auth/AuthProvider';
import { pushTimeline } from '../../../src/lib/os/timeline';
import { colors } from '../../../src/theme/colors';

export default function AdminSupport() {
  const { user, loading } = useAuth();
  const [body, setBody] = useState('');
  const [note, setNote] = useState<string | null>(null);

  if (loading) return null;
  if (!user) return <Redirect href="/app/login" />;

  const submit = async () => {
    if (!body.trim()) return;
    await pushTimeline(user.id, 'support.ticket', { body: body.trim() });
    setBody('');
    setNote('Ticket logged to timeline (paper).');
  };

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>ADMIN · SUPPORT</Text>
      <Text style={styles.title}>Tickets</Text>
      <Text style={styles.sub}>Paper intake — wires to real helpdesk later.</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe the issue"
        placeholderTextColor={colors.textMuted}
        value={body}
        onChangeText={setBody}
        multiline
      />
      <Pressable style={styles.btn} onPress={submit}>
        <Text style={styles.btnText}>Log ticket →</Text>
      </Pressable>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
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
  input: {
    marginTop: 18,
    minHeight: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    color: colors.white,
    fontFamily: 'Inter_400Regular',
    textAlignVertical: 'top',
  },
  btn: {
    marginTop: 14,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { fontFamily: 'Montserrat_700Bold', color: colors.navy },
  note: { marginTop: 12, color: colors.goldLight },
});
