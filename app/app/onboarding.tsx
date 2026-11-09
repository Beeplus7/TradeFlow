import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';
import { Redirect, router } from 'expo-router';
import { ScreenFrame } from '../../src/components/layout/ScreenFrame';
import { DishVisual } from '../../src/components/DishVisual';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import { fetchProfile, saveOnboarding } from '../../src/lib/os/profile';
import { brandCopy, colors } from '../../src/theme/colors';
import {
  EXPERIENCE_OPTIONS,
  ONBOARDING_STEPS,
  RISK_OPTIONS,
  type ExchangeMode,
  type ExperienceLevel,
  type RiskProfile,
} from '../../src/types/db';

async function saveKeyHint(key: string, value: string) {
  if (!value.trim()) return;
  if (Platform.OS === 'web') {
    sessionStorage.setItem(key, value.trim());
    return;
  }
  await SecureStore.setItemAsync(key, value.trim());
}

export default function OnboardingScreen() {
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [risk, setRisk] = useState<RiskProfile>('balanced');
  const [exchangeMode, setExchangeMode] = useState<ExchangeMode>('simulator');
  const [binanceKey, setBinanceKey] = useState('');
  const [bybitKey, setBybitKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRisk = useMemo(
    () => RISK_OPTIONS.find((o) => o.profile === risk)!,
    [risk],
  );

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    fetchProfile(user.id)
      .then((p) => {
        if (p?.onboarding_complete) setAlreadyDone(true);
        if (p?.display_name) setName(p.display_name);
        if (p?.risk_profile) setRisk(p.risk_profile);
        if (p?.experience_level) setExperience(p.experience_level);
      })
      .catch((e) => setError(e.message))
      .finally(() => setChecking(false));
  }, [user]);

  if (authLoading || checking) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }
  if (!user) return <Redirect href="/app/login" />;
  if (alreadyDone) return <Redirect href="/app/assessment" />;

  const canContinue = () => {
    if (step === 1) return Boolean(experience);
    if (step === 4) return Boolean(risk);
    return true;
  };

  const onFinish = async () => {
    setBusy(true);
    setError(null);
    try {
      if (exchangeMode === 'connected') {
        await saveKeyHint('tradeflow_binance_key', binanceKey);
        await saveKeyHint('tradeflow_bybit_key', bybitKey);
      }
      await saveOnboarding({
        userId: user.id,
        displayName: name || user.email || 'Flow trader',
        riskProfile: risk,
        riskPct: selectedRisk.pct,
        experienceLevel: experience,
        exchangeMode,
      });
      router.replace('/app/assessment');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save onboarding');
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (step < 5) setStep((s) => s + 1);
    else void onFinish();
  };

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>ONBOARDING OS</Text>
      <Text style={styles.title}>
        {step === 0 ? '£50 In. Smile Out.' : ONBOARDING_STEPS[step]}
      </Text>

      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${((step + 1) / 6) * 100}%` }]}
        />
      </View>
      <View style={styles.stepRow}>
        {ONBOARDING_STEPS.map((label, i) => (
          <Pressable key={label} onPress={() => i <= step && setStep(i)} style={styles.stepDot}>
            <Text style={[styles.stepN, i === step && styles.stepNActive]}>
              {i + 1}
            </Text>
          </Pressable>
        ))}
      </View>

      {step === 0 && (
        <View style={styles.block}>
          <Text style={styles.lead}>
            Zero knowledge needed. We flow as one. Value in five seconds —
            Assessment unlocked after ClearID.
          </Text>
          <Text style={styles.mono}>{brandCopy.primary}</Text>
          <Text style={styles.checklist}>✓ user email</Text>
          <Text style={styles.checklist}>✓ £50 commitment intent</Text>
          <Text style={styles.checklist}>✓ zero-knowledge flag OK</Text>
          <Text style={styles.checklist}>○ exchange API (optional)</Text>
          <Text style={styles.checklist}>○ ClearID card</Text>
          <Text style={styles.checklist}>○ FinanceOS dish ready</Text>
          <Text style={styles.checklist}>○ AssessmentOS unlocked</Text>
        </View>
      )}

      {step === 1 && (
        <View style={styles.block}>
          <Text style={styles.lead}>Experience check — sets UPRM tone.</Text>
          {EXPERIENCE_OPTIONS.map((opt) => {
            const active = experience === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setExperience(opt.id)}
                style={[styles.option, active && styles.optionActive]}
              >
                <Text style={styles.optionTitle}>{opt.title}</Text>
                <Text style={styles.optionBlurb}>{opt.blurb}</Text>
                <Text style={styles.optionMeta}>{opt.uprm}</Text>
              </Pressable>
            );
          })}
          <Text style={styles.label}>DISPLAY NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Flow trader"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>
      )}

      {step === 2 && (
        <View style={styles.block}>
          <Text style={styles.lead}>
            Finance commit — £5 fake · £35 journey (£7/day) · £10 safety.
          </Text>
          <DishVisual fake={5} live={35} safety={10} daySpent={0} dayCap={7} />
        </View>
      )}

      {step === 3 && (
        <View style={styles.block}>
          <Text style={styles.lead}>
            Exchange connect optional. Skip → simulator mode. Keys encrypted
            locally until ConnectOS (Phase 4).
          </Text>
          <Pressable
            style={[
              styles.option,
              exchangeMode === 'simulator' && styles.optionActive,
            ]}
            onPress={() => setExchangeMode('simulator')}
          >
            <Text style={styles.optionTitle}>Simulator only</Text>
            <Text style={styles.optionBlurb}>
              → Simulator mode active · FinanceOS dish still valid · No keys stored
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.option,
              exchangeMode === 'connected' && styles.optionActive,
            ]}
            onPress={() => setExchangeMode('connected')}
          >
            <Text style={styles.optionTitle}>Connect keys</Text>
            <Text style={styles.optionBlurb}>
              → Encrypted → local vault · UPRM notified
            </Text>
          </Pressable>
          {exchangeMode === 'connected' ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Binance API key"
                placeholderTextColor={colors.textMuted}
                value={binanceKey}
                onChangeText={setBinanceKey}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Bybit API key"
                placeholderTextColor={colors.textMuted}
                value={bybitKey}
                onChangeText={setBybitKey}
                autoCapitalize="none"
                secureTextEntry
              />
            </>
          ) : null}
        </View>
      )}

      {step === 4 && (
        <View style={styles.block}>
          <Text style={styles.lead}>
            Risk profile — Guardian auto tap-out % (architecture: 8 / 15 / 25).
          </Text>
          {RISK_OPTIONS.map((opt) => {
            const active = risk === opt.profile;
            return (
              <Pressable
                key={opt.profile}
                onPress={() => setRisk(opt.profile)}
                style={[styles.option, active && styles.optionActive]}
              >
                <Text style={[styles.riskPct, active && styles.riskPctActive]}>
                  {opt.pct}%
                </Text>
                <Text style={styles.optionTitle}>{opt.label}</Text>
                <Text style={styles.optionBlurb}>{opt.blurb}</Text>
                <Text style={styles.optionMeta}>— {opt.dailyStop}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {step === 5 && (
        <View style={styles.clearCard}>
          <Text style={styles.clearKicker}>CLEARID</Text>
          <Text style={styles.clearId}>
            TF-{user.id.replace(/-/g, '').slice(0, 8).toUpperCase()}
          </Text>
          <Text style={styles.clearLine}>
            {name || 'Flow trader'} · {experience} mindset
          </Text>
          <Text style={styles.clearLine}>
            Risk {selectedRisk.label} · {selectedRisk.pct}% tap-out
          </Text>
          <Text style={styles.clearLine}>
            Mode · {exchangeMode === 'connected' ? 'KEYS CONNECTED' : 'SIMULATOR'}
          </Text>
          <Text style={styles.clearLine}>£50 intent · dish ready</Text>
          <Text style={styles.clearWelcome}>
            UPRM: Welcome back is ready. Journey memory — not session.
          </Text>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.navRow}>
        <Pressable
          style={[styles.back, step === 0 && styles.disabled]}
          disabled={step === 0 || busy}
          onPress={() => setStep((s) => Math.max(0, s - 1))}
        >
          <Text style={styles.backText}>BACK</Text>
        </Pressable>
        <Pressable
          style={[styles.next, (!canContinue() || busy) && styles.disabled]}
          disabled={!canContinue() || busy}
          onPress={next}
        >
          {busy ? (
            <ActivityIndicator color={colors.navy} />
          ) : (
            <Text style={styles.nextText}>
              {step === 5 ? 'UNLOCK ASSESSMENT' : 'CONTINUE FLOW'}
            </Text>
          )}
        </Pressable>
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
  progressTrack: {
    marginTop: 18,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.navyDeep,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.gold },
  stepRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepDot: { flex: 1, alignItems: 'center' },
  stepN: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: colors.textMuted,
  },
  stepNActive: { color: colors.gold },
  block: { marginTop: 20, gap: 10 },
  lead: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 6,
  },
  mono: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.goldLight,
    marginBottom: 8,
  },
  checklist: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
  },
  optionActive: {
    borderColor: colors.gold,
    backgroundColor: colors.navyLift,
  },
  optionTitle: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.white,
    fontSize: 15,
  },
  optionBlurb: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  optionMeta: {
    marginTop: 6,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    color: colors.goldLight,
  },
  riskPct: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 26,
    color: colors.textMuted,
  },
  riskPctActive: { color: colors.gold },
  label: {
    marginTop: 8,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.goldLight,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.white,
    fontFamily: 'Inter_400Regular',
  },
  clearCard: {
    marginTop: 20,
    padding: 20,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
    gap: 6,
  },
  clearKicker: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  clearId: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 28,
    color: colors.white,
  },
  clearLine: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 13,
  },
  clearWelcome: {
    marginTop: 10,
    fontFamily: 'Inter_500Medium',
    color: colors.goldLight,
    lineHeight: 20,
  },
  error: { marginTop: 12, color: colors.danger, fontFamily: 'Inter_500Medium' },
  navRow: { marginTop: 24, flexDirection: 'row', gap: 10 },
  back: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.goldLight,
  },
  next: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.navy,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  disabled: { opacity: 0.45 },
});
