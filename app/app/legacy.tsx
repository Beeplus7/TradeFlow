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
import { canAccessDay, dayDone } from '../../src/lib/os/flowChain';
import { ensureWeekJourney, markDayDone } from '../../src/lib/os/journey';
import {
  ensureLegacyVault,
  hmrcCsv,
  runLegacySplit,
  type LegacyVault,
} from '../../src/lib/os/legacy';
import type { Journey } from '../../src/types/db';
import { colors } from '../../src/theme/colors';

export default function LegacyScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [boot, setBoot] = useState(true);
  const [vault, setVault] = useState<LegacyVault | null>(null);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [csv, setCsv] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const reload = useCallback(async (id: string) => {
    const [v, j] = await Promise.all([
      ensureLegacyVault(id),
      ensureWeekJourney(id),
    ]);
    setVault(v);
    setJourney(j);
    setCsv(hmrcCsv(v));
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

  const locked = !canAccessDay(journey, 'fri');
  const friDone = dayDone(journey, 'fri');

  const split = async () => {
    setBusy(true);
    setError(null);
    try {
      const v = await runLegacySplit(user.id);
      setVault(v);
      setCsv(hmrcCsv(v));
      if (!friDone) {
        const j = await markDayDone(user.id, 'fri');
        setJourney(j);
      }
      setNote('Friday split dry-run complete · Heart open.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Split failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>LEGACY OS</Text>
      <Text style={styles.title}>40 / 30 / 20 / 10</Text>
      <Text style={styles.sub}>
        Reinvest · Smile · HMRC · Vault. Paper Friday split (11pm cron later).
      </Text>

      {locked ? (
        <View style={styles.lock}>
          <Text style={styles.lockTitle}>LOCKED RED</Text>
          <Text style={styles.lockCopy}>Complete Thu Execute first.</Text>
          <Pressable style={styles.btn} onPress={() => router.push('/app/journey')}>
            <Text style={styles.btnText}>Journey map</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.grid}>
            {[
              ['REINVEST 40%', vault?.reinvest_gbp],
              ['SMILE 30%', vault?.smile_gbp],
              ['HMRC 20%', vault?.hmrc_gbp],
              ['VAULT 10%', vault?.vault_gbp],
            ].map(([label, val]) => (
              <View key={String(label)} style={styles.cell}>
                <Text style={styles.cellL}>{label}</Text>
                <Text style={styles.cellV}>
                  £{Number(val ?? 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            style={[styles.btn, busy && styles.disabled]}
            disabled={busy}
            onPress={split}
          >
            {busy ? (
              <ActivityIndicator color={colors.navy} />
            ) : (
              <Text style={styles.btnText}>
                {friDone ? 'Run split again →' : 'Run Friday split →'}
              </Text>
            )}
          </Pressable>

          {csv ? (
            <View style={styles.csv}>
              <Text style={styles.csvLabel}>HMRC CSV (paper)</Text>
              <Text style={styles.csvBody}>{csv}</Text>
            </View>
          ) : null}
        </>
      )}

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
  lock: {
    marginTop: 22,
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.danger,
  },
  lockTitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: colors.danger,
    letterSpacing: 2,
  },
  lockCopy: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
  },
  grid: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cell: {
    width: '47%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cellL: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    color: colors.gold,
  },
  cellV: {
    marginTop: 6,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 22,
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
  csv: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#02060C',
    borderWidth: 1,
    borderColor: colors.border,
  },
  csvLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.gold,
  },
  csvBody: {
    marginTop: 8,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: colors.goldLight,
  },
  note: { marginTop: 12, color: colors.goldLight },
  error: { marginTop: 12, color: colors.danger },
});
