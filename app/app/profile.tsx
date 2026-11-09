import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import { ScreenFrame } from '../../src/components/layout/ScreenFrame';
import { useAuth } from '../../src/lib/auth/AuthProvider';
import { ensureBilling } from '../../src/lib/os/billing';
import { ensureConnection } from '../../src/lib/os/connect';
import { fetchProfile } from '../../src/lib/os/profile';
import type { Profile } from '../../src/types/db';
import { colors } from '../../src/theme/colors';

export default function ProfileScreen() {
  const { user, loading } = useAuth();
  const [boot, setBoot] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [plan, setPlan] = useState('—');
  const [venue, setVenue] = useState('—');

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setBoot(false);
        return;
      }
      setBoot(true);
      Promise.all([
        fetchProfile(user.id),
        ensureBilling(user.id),
        ensureConnection(user.id),
      ])
        .then(([p, b, c]) => {
          setProfile(p);
          setPlan(`${b.plan} · ${b.status}`);
          setVenue(`${c.venue} · paper`);
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

  const rows = [
    ['Email', user.email ?? '—'],
    ['Display', profile?.display_name ?? '—'],
    ['ClearID', profile?.clear_id ?? '—'],
    ['Risk', profile?.risk_profile ? `${profile.risk_profile} · ${profile.risk_pct}%` : '—'],
    ['Experience', profile?.experience_level ?? '—'],
    ['Exchange', venue],
    ['Plan', plan],
    ['Onboarding', profile?.onboarding_complete ? 'COMPLETE' : 'PENDING'],
  ];

  return (
    <ScreenFrame maxWidth={560}>
      <Text style={styles.kicker}>PROFILE</Text>
      <Text style={styles.title}>Account</Text>
      <View style={styles.list}>
        {rows.map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.k}>{k}</Text>
            <Text style={styles.v}>{v}</Text>
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
  list: { marginTop: 22 },
  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  k: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.gold,
  },
  v: {
    marginTop: 4,
    fontFamily: 'Inter_500Medium',
    color: colors.white,
  },
});
