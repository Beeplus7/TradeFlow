import { StyleSheet, Text } from 'react-native';
import { Link } from 'expo-router';
import { ScreenFrame } from './layout/ScreenFrame';
import { colors } from '../theme/colors';

type Props = {
  title: string;
  subtitle?: string;
  phaseNote?: string;
};

export function OsStub({ title, subtitle, phaseNote }: Props) {
  return (
    <ScreenFrame maxWidth={560} centered>
      <Text style={styles.kicker}>TRADEFLOW OS</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      <Text style={styles.note}>
        {phaseNote ?? 'Screen scaffolded — logic ships in later build phases.'}
      </Text>
      <Link href="/app" style={styles.link}>
        ← Dashboard
      </Link>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sub: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 15,
  },
  note: {
    marginTop: 24,
    color: colors.goldLight,
    fontSize: 13,
    lineHeight: 20,
  },
  link: {
    marginTop: 28,
    color: colors.gold,
    fontWeight: '700',
    fontSize: 14,
  },
});
