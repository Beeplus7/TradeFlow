import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenFrame } from '../../../src/components/layout/ScreenFrame';
import { ADMIN_ROUTES } from '../../../src/navigation/routes';
import { colors } from '../../../src/theme/colors';

export default function AdminHome() {
  const router = useRouter();
  return (
    <ScreenFrame maxWidth={720}>
      <Text style={styles.kicker}>ADMIN</Text>
      <Text style={styles.title}>Control desk</Text>
      <Text style={styles.sub}>
        Tribe · elites · nudges · billing · support — paper ops until Stripe/VPS.
      </Text>
      <View style={styles.list}>
        {ADMIN_ROUTES.filter((r) => r.href !== '/app/admin').map((r) => (
          <Pressable
            key={r.href}
            style={styles.row}
            onPress={() => router.push(r.href as any)}
          >
            <View>
              <Text style={styles.name}>{r.title}</Text>
              <Text style={styles.blurb}>{r.subtitle}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        ))}
      </View>
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
    lineHeight: 22,
  },
  list: { marginTop: 22, gap: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  name: { fontFamily: 'Montserrat_700Bold', color: colors.white },
  blurb: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 13,
  },
  arrow: {
    fontFamily: 'Montserrat_800ExtraBold',
    color: colors.gold,
    fontSize: 20,
  },
});
