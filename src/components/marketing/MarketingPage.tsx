import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MarketingShell } from './MarketingShell';
import { colors } from '../../theme/colors';

type Props = {
  kicker: string;
  title: string;
  lead: string;
  children?: ReactNode;
};

/** Inner marketing pages — same vault language as home. */
export function MarketingPage({ kicker, title, lead, children }: Props) {
  return (
    <MarketingShell>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rule} />
      <Text style={styles.lead}>{lead}</Text>
      <View style={styles.body}>{children}</View>
    </MarketingShell>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.gold,
  },
  title: {
    marginTop: 14,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 40,
    lineHeight: 46,
    color: colors.white,
    letterSpacing: -1.2,
    maxWidth: 720,
  },
  rule: {
    marginTop: 20,
    width: 48,
    height: 2,
    backgroundColor: colors.gold,
  },
  lead: {
    marginTop: 18,
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    lineHeight: 28,
    color: colors.textMuted,
    maxWidth: 640,
  },
  body: { marginTop: 40, gap: 20 },
});
