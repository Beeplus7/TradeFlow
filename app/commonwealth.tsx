import { StyleSheet, Text, View } from 'react-native';
import { MarketingPage } from '../src/components/marketing/MarketingPage';
import { colors } from '../src/theme/colors';

const ELITES = [
  { tag: '01', line: 'Anon whale · +£2.1k week · tilt low' },
  { tag: '02', line: 'Discipline proof · 18-day streak' },
  { tag: '03', line: 'Guardian held · £35 protected · £7 cap' },
  { tag: '04', line: 'Legacy split Fri 11pm · Smile Out £42' },
] as const;

export default function CommonwealthMarketingPage() {
  return (
    <MarketingPage
      kicker="COMMONWEALTH"
      title="Whale Tribe. Not competition."
      lead="£50 In. Smile Out. Oldham energy scaled — anonymized elites, live discipline, Commonwealth over ego."
    >
      <Text style={styles.copy}>
        10 elites per trader · Eyes Boat real-time pulse · Revenge patterns
        blocked · Guardian held. Social proof without Vegas hype.
      </Text>

      <View style={styles.list}>
        {ELITES.map((e) => (
          <View key={e.tag} style={styles.row}>
            <Text style={styles.tag}>ELITE {e.tag}</Text>
            <Text style={styles.line}>{e.line}</Text>
          </View>
        ))}
      </View>
    </MarketingPage>
  );
}

const styles = StyleSheet.create({
  copy: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 26,
    fontSize: 16,
    maxWidth: 640,
  },
  list: {
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  row: {
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tag: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  line: {
    marginTop: 8,
    fontFamily: 'Inter_500Medium',
    color: colors.white,
    fontSize: 16,
  },
});
