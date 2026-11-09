import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, Link } from 'expo-router';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import { ScreenFrame } from '../../src/components/layout/ScreenFrame';
import { brandCopy, colors } from '../../src/theme/colors';
import { getCredentialStatuses } from '../../src/config/env';

export default function LoginScreen() {
  const { user, loading, configured, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const statuses = getCredentialStatuses();

  if (!loading && user) {
    return <Redirect href="/app" />;
  }

  const onGoogle = async () => {
    setBusy(true);
    setError(null);
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
    }
    setBusy(false);
  };

  return (
    <ScreenFrame maxWidth={420} centered scroll={false}>
      <View style={styles.card}>
        <Link href="/" asChild>
          <Pressable>
            <Text style={styles.brand}>TradFlow</Text>
          </Pressable>
        </Link>
        <Text style={styles.tag}>{brandCopy.primary}</Text>
        <Text style={styles.sub}>{brandCopy.secondary}</Text>

        <Pressable
          style={[styles.btn, (!configured || busy) && styles.btnDisabled]}
          disabled={!configured || busy}
          onPress={onGoogle}
        >
          {busy ? (
            <ActivityIndicator color={colors.navy} />
          ) : (
            <Text style={styles.btnText}>Continue with Google</Text>
          )}
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.statusBox}>
          {statuses.map((s) => (
            <Text key={s.group} style={styles.statusLine}>
              {s.ready ? '●' : '○'} {s.label}
            </Text>
          ))}
        </View>

        <Text style={styles.hint}>
          OAuth test users must be listed on the Google consent screen while in
          Testing mode.
        </Text>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 28,
  },
  brand: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 36,
    color: colors.gold,
    letterSpacing: -1,
  },
  tag: {
    marginTop: 12,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.goldLight,
  },
  sub: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: colors.textMuted,
  },
  btn: {
    marginTop: 28,
    backgroundColor: colors.gold,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.navy,
    fontSize: 15,
  },
  error: {
    marginTop: 12,
    color: colors.danger,
    fontFamily: 'Inter_500Medium',
  },
  statusBox: {
    marginTop: 24,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.navyDeep,
    gap: 6,
  },
  statusLine: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: colors.textMuted,
  },
  hint: {
    marginTop: 16,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
