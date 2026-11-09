import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { GoMeter } from '../src/components/GoMeter';
import { MarketingPage } from '../src/components/marketing/MarketingPage';
import { runAssessment, type AssessmentResult } from '../src/lib/os/assessment';
import { colors } from '../src/theme/colors';
import { GO_THRESHOLD } from '../src/types/db';

export default function AssessmentDemoPage() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const onRun = async () => {
    setBusy(true);
    try {
      const r = await runAssessment();
      setResult(r);
    } finally {
      setBusy(false);
    }
  };

  return (
    <MarketingPage
      kicker="FREE DEMO · NO SIGNUP"
      title="68% GO meter"
      lead={`Lead magnet: feel the volatility regime before you join. ≥${GO_THRESHOLD}% means GO — Trade. Below means wait.`}
    >
      <View style={styles.meter}>
        {result ? (
          <GoMeter score={result.score} />
        ) : (
          <Text style={styles.waiting}>Tap run to sample today’s regime.</Text>
        )}
      </View>

      {result ? (
        <Text style={styles.meta}>
          {result.regime.toUpperCase()} · {result.source.toUpperCase()} ·{' '}
          {result.go ? 'GO' : 'NO-GO'}
        </Text>
      ) : null}

      <Pressable style={styles.btn} onPress={onRun} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={colors.navy} />
        ) : (
          <Text style={styles.btnText}>
            {result ? 'Run again' : 'Run free assessment'}
          </Text>
        )}
      </Pressable>

      <Link href="/app/login" asChild>
        <Pressable style={styles.secondary}>
          <Text style={styles.secondaryText}>
            Ready to install the OS? Sign in →
          </Text>
        </Pressable>
      </Link>
    </MarketingPage>
  );
}

const styles = StyleSheet.create({
  meter: { alignItems: 'center', paddingVertical: 12 },
  waiting: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
  },
  meta: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
    color: colors.goldLight,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: colors.gold,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.navy,
  },
  secondary: { alignItems: 'center', padding: 12 },
  secondaryText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.gold,
  },
});
