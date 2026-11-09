import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenFrame } from '../../src/components/layout/ScreenFrame';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import {
  PLANS,
  ensureBilling,
  markCheckoutReturn,
  selectPlanPaper,
  startStripeCheckout,
  type BillingPrefs,
  type PlanId,
} from '../../src/lib/os/billing';
import { colors } from '../../src/theme/colors';

export default function SettingsScreen() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{
    checkout?: string;
    plan?: string;
  }>();
  const [boot, setBoot] = useState(true);
  const [billing, setBilling] = useState<BillingPrefs | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      ensureBilling(user.id)
        .then(async (b) => {
          if (
            params.checkout === 'success' &&
            params.plan &&
            ['starter', 'pro', 'elite', 'hybrid'].includes(params.plan)
          ) {
            const updated = await markCheckoutReturn(
              user.id,
              params.plan as PlanId,
            );
            setBilling(updated);
            setNote(`Stripe checkout complete · ${params.plan} active (test).`);
          } else if (params.checkout === 'cancelled') {
            setBilling(b);
            setNote('Checkout cancelled — no charge.');
          } else {
            setBilling(b);
          }
        })
        .finally(() => setBoot(false));
    }, [user, params.checkout, params.plan]),
  );

  if (loading || boot) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (!user) return <Redirect href="/app/login" />;

  const checkout = async (plan: PlanId) => {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      await startStripeCheckout(plan);
      setNote('Opening Stripe Checkout…');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    } finally {
      setBusy(false);
    }
  };

  const paper = async (plan: PlanId) => {
    setBusy(true);
    setError(null);
    try {
      setBilling(await selectPlanPaper(user.id, plan));
      setNote(`Paper preference · ${plan} (no charge).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>SETTINGS · STRIPE</Text>
      <Text style={styles.title}>Billing</Text>
      <Text style={styles.sub}>
        Current: {billing?.plan ?? '—'} · {billing?.status ?? 'paper'} · test
        mode
      </Text>

      <Text style={styles.section}>STRIPE CHECKOUT (TEST)</Text>
      {PLANS.map((p) => (
        <View
          key={p.id}
          style={[styles.plan, billing?.plan === p.id && styles.planOn]}
        >
          <Text style={styles.planName}>
            {p.label} · {p.price}
          </Text>
          <Text style={styles.planBlurb}>{p.blurb}</Text>
          <View style={styles.row}>
            <Pressable
              style={[styles.btn, busy && styles.disabled]}
              disabled={busy}
              onPress={() => checkout(p.id)}
            >
              <Text style={styles.btnText}>Pay with Stripe →</Text>
            </Pressable>
            <Pressable
              style={[styles.ghost, busy && styles.disabled]}
              disabled={busy}
              onPress={() => paper(p.id)}
            >
              <Text style={styles.ghostText}>Paper only</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable style={styles.link} onPress={() => router.push('/app/connect')}>
        <Text style={styles.linkText}>Exchange connect →</Text>
      </Pressable>
      <Pressable style={styles.link} onPress={() => router.push('/app/profile')}>
        <Text style={styles.linkText}>Profile →</Text>
      </Pressable>
      <Pressable style={styles.signOut} onPress={() => signOut()}>
        <Text style={styles.signOutText}>Sign out</Text>
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
  },
  section: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  plan: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 10,
  },
  planOn: { borderColor: colors.gold },
  planName: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.white,
  },
  planBlurb: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 13,
  },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  btn: {
    backgroundColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  btnText: { fontFamily: 'Montserrat_700Bold', color: colors.navy, fontSize: 13 },
  ghost: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  ghostText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.goldLight,
    fontSize: 13,
  },
  disabled: { opacity: 0.5 },
  link: { marginTop: 14 },
  linkText: { fontFamily: 'Inter_500Medium', color: colors.goldLight },
  signOut: {
    marginTop: 24,
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOutText: { fontFamily: 'Inter_600SemiBold', color: colors.gold },
  note: { marginTop: 12, color: colors.goldLight },
  error: { marginTop: 12, color: colors.danger },
});
