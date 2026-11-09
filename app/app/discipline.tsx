import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import { ScreenFrame } from '../../src/components/layout/ScreenFrame';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import {
  breatheReset,
  ensureDiscipline,
  fetchDisciplineEvents,
  isLocked,
  triggerLock,
  type DisciplineEvent,
  type DisciplineState,
  type LockKind,
} from '../../src/lib/os/discipline';
import { colors } from '../../src/theme/colors';

const TRIGGERS: { kind: LockKind; label: string; cool: string }[] = [
  { kind: 'revenge', label: 'Revenge after loss', cool: '24h' },
  { kind: 'overtrade', label: 'Overtrading >3', cool: '10m' },
  { kind: 'fomo', label: 'FOMO chase', cool: '30m' },
  { kind: 'tilt', label: 'Tilt sizing >£7', cool: '10m' },
  { kind: 'guardian_ignore', label: 'Guardian ignore', cool: '30m' },
];

export default function DisciplineScreen() {
  const { user, loading } = useAuth();
  const [boot, setBoot] = useState(true);
  const [state, setState] = useState<DisciplineState | null>(null);
  const [events, setEvents] = useState<DisciplineEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async (id: string) => {
    const [s, e] = await Promise.all([
      ensureDiscipline(id),
      fetchDisciplineEvents(id),
    ]);
    setState(s);
    setEvents(e);
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

  const locked = isLocked(state);

  const fire = async (kind: LockKind) => {
    setBusy(true);
    setError(null);
    try {
      await triggerLock(user.id, kind);
      await reload(user.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lock failed');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    try {
      await breatheReset(user.id);
      await reload(user.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>DISCIPLINE OS</Text>
      <Text style={styles.title}>Coach lock</Text>
      <Text style={styles.sub}>
        Tilt · FOMO · revenge · cooldowns 10m / 30m / 24h
      </Text>

      <View style={styles.scoreBox}>
        <Text style={styles.scoreLabel}>DISCIPLINE SCORE</Text>
        <Text style={styles.scoreValue}>
          {Number(state?.score ?? 100).toFixed(0)}
        </Text>
      </View>

      {locked ? (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockTitle}>COOLDOWN</Text>
          <Text style={styles.lockKind}>
            {(state?.lock_kind ?? 'tilt').toUpperCase()}
          </Text>
          <Text style={styles.lockCopy}>
            Breathe. £50 In. Smile Out. Until{' '}
            {state?.locked_until
              ? new Date(state.locked_until).toLocaleTimeString()
              : '—'}
          </Text>
          <Pressable style={styles.btn} disabled={busy} onPress={reset}>
            <Text style={styles.btnText}>Paper breathe reset →</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.triggers}>
          {TRIGGERS.map((t) => (
            <Pressable
              key={t.kind}
              style={[styles.trigger, busy && styles.disabled]}
              disabled={busy}
              onPress={() => fire(t.kind)}
            >
              <Text style={styles.triggerLabel}>{t.label}</Text>
              <Text style={styles.triggerCool}>{t.cool}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.section}>HISTORY</Text>
      {events.length === 0 ? (
        <Text style={styles.empty}>No tilt events — stay sharp.</Text>
      ) : (
        events.map((e) => (
          <Text key={e.id} style={styles.event}>
            {e.kind} · {e.note}
          </Text>
        ))
      )}
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
  scoreBox: {
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  scoreValue: {
    marginTop: 6,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 48,
    color: colors.white,
  },
  lockOverlay: {
    marginTop: 18,
    padding: 22,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: colors.navyDeep,
    alignItems: 'center',
  },
  lockTitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    letterSpacing: 3,
    color: colors.gold,
  },
  lockKind: {
    marginTop: 8,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 24,
    color: colors.white,
  },
  lockCopy: {
    marginTop: 10,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  triggers: { marginTop: 18, gap: 8 },
  trigger: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  triggerLabel: {
    fontFamily: 'Inter_500Medium',
    color: colors.white,
  },
  triggerCool: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: colors.gold,
    fontSize: 11,
  },
  btn: {
    marginTop: 16,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  btnText: { fontFamily: 'Montserrat_700Bold', color: colors.navy },
  disabled: { opacity: 0.5 },
  section: {
    marginTop: 24,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  empty: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
  },
  event: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 13,
  },
  error: { marginTop: 12, color: colors.danger },
});
