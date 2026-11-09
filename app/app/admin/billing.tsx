import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import { ScreenFrame } from '../../../src/components/layout/ScreenFrame';
import { useAuth } from '../../../src/lib/auth/AuthProvider';
import { PLANS, ensureBilling } from '../../../src/lib/os/billing';
import { colors } from '../../../src/theme/colors';

export default function AdminBilling() {
  const { user, loading } = useAuth();
  const [boot, setBoot] = useState(true);
  const [plan, setPlan] = useState('—');
  const [status, setStatus] = useState('—');

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      ensureBilling(user.id)
        .then((b) => {
          setPlan(b.plan);
          setStatus(b.status);
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
      <Text style={styles.kicker}>ADMIN · BILLING</Text>
      <Text style={styles.title}>Stripe desk</Text>
      <Text style={styles.stat}>
        {plan.toUpperCase()} · {status.toUpperCase()}
      </Text>
      <Text style={styles.copy}>
        Test Checkout live via Edge Function. Webhook marks billing_prefs
        active on checkout.session.completed.
      </Text>
      {PLANS.map((p) => (
        <Text key={p.id} style={styles.line}>
          {p.label} · {p.price} — {p.blurb}
        </Text>
      ))}
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
  line: {
    marginTop: 10,
    fontFamily: 'Inter_400Regular',
    color: colors.white,
    fontSize: 14,
  },
});
