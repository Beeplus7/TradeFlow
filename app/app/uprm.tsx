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
import { fetchWeekJourney } from '../../src/lib/os/assessment';
import { doneCount } from '../../src/lib/os/flowChain';
import { fetchProfile } from '../../src/lib/os/profile';
import {
  companionLine,
  welcomeName,
} from '../../src/lib/os/uprmHome';
import { fetchTimeline, type TimelineEvent } from '../../src/lib/os/timeline';
import { colors } from '../../src/theme/colors';

export default function UprmScreen() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [boot, setBoot] = useState(true);
  const [line, setLine] = useState('');
  const [name, setName] = useState('Trader');
  const [chain, setChain] = useState(0);
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      Promise.all([
        fetchProfile(user.id),
        fetchWeekJourney(user.id),
        fetchTimeline(user.id, 16),
      ])
        .then(([profile, journey, timeline]) => {
          const chainDone = doneCount(journey);
          setName(welcomeName(user.email, profile?.display_name));
          setChain(chainDone);
          setEvents(timeline);
          setLine(
            companionLine({
              onboarding: Boolean(profile?.onboarding_complete),
              goScore:
                journey?.go_score != null ? Number(journey.go_score) : null,
              monDone: Boolean(journey?.mon_done),
              chainDone,
              guardian: null,
            }),
          );
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
    <ScreenFrame maxWidth={640}>
      <Text style={styles.kicker}>UPRM · JOURNEY MEMORY</Text>
      <Text style={styles.title}>Welcome back, {name}</Text>
      <Text style={styles.sub}>
        Spine memory — companion line + timeline of what Flow already installed.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>COMPANION</Text>
        <Text style={styles.cardCopy}>{line}</Text>
      </View>

      <View style={styles.stat}>
        <Text style={styles.statLabel}>FLOWCHAIN MEMORY</Text>
        <Text style={styles.statValue}>{chain}/5 days complete</Text>
      </View>

      <Text style={styles.section}>TIMELINE</Text>
      {events.length === 0 ? (
        <Text style={styles.empty}>No events yet — move through the Heart.</Text>
      ) : (
        events.map((e) => (
          <View key={e.id} style={styles.event}>
            <Text style={styles.eventKey}>{e.event_key}</Text>
            <Text style={styles.eventWhen}>
              {new Date(e.created_at).toLocaleString()}
            </Text>
          </View>
        ))
      )}

      <Pressable style={styles.btn} onPress={() => router.push('/app')}>
        <Text style={styles.btnText}>Back to UPRM Home →</Text>
      </Pressable>
      <Pressable
        style={styles.link}
        onPress={() => router.push('/app/journey')}
      >
        <Text style={styles.linkText}>Open Journey Heart</Text>
      </Pressable>
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
    marginTop: 10,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 28,
    color: colors.white,
  },
  sub: {
    marginTop: 10,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 22,
  },
  card: {
    marginTop: 24,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    backgroundColor: 'rgba(14,36,71,0.7)',
  },
  cardLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 2,
    color: colors.gold,
  },
  cardCopy: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    color: colors.white,
    lineHeight: 22,
    fontSize: 15,
  },
  stat: {
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  statLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMuted,
  },
  statValue: {
    marginTop: 6,
    fontFamily: 'Montserrat_700Bold',
    color: colors.white,
    fontSize: 18,
  },
  section: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  empty: { fontFamily: 'Inter_400Regular', color: colors.textMuted },
  event: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  eventKey: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: colors.white,
  },
  eventWhen: {
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.textMuted,
  },
  btn: {
    marginTop: 24,
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { fontFamily: 'Montserrat_700Bold', color: colors.navy },
  link: { marginTop: 14, alignItems: 'center' },
  linkText: {
    fontFamily: 'Inter_500Medium',
    color: colors.goldLight,
  },
});
