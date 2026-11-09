import { StyleSheet, Text, View } from 'react-native';
import { MarketingPage } from '../src/components/marketing/MarketingPage';
import { colors } from '../src/theme/colors';

const BLOCKS = [
  {
    t: 'Software license',
    b: 'TradFlow is trading software and coaching tools. We are not a fund manager, broker, or FCA-authorised investment firm.',
  },
  {
    t: 'Risk',
    b: 'Crypto and leveraged trading can result in total loss of capital. Past performance is not indicative of future results. Only risk what you can afford to lose.',
  },
  {
    t: 'Performance fee (hybrid)',
    b: 'Optional hybrid billing (base + % of gains, capped) requires explicit opt-in consent. You can stay on flat monthly plans.',
  },
  {
    t: 'Privacy & HMRC',
    b: 'Legacy exports support your own tax records. You remain responsible for filings. See Privacy for data handling.',
  },
] as const;

export default function LegalPage() {
  return (
    <MarketingPage
      kicker="LEGAL"
      title="Terms · Privacy · Risk"
      lead="FCA-safe framing: we ship process software, not managed funds. Read before you Flow."
    >
      <View style={styles.list}>
        {BLOCKS.map((block) => (
          <View key={block.t} style={styles.block}>
            <Text style={styles.t}>{block.t}</Text>
            <Text style={styles.b}>{block.b}</Text>
          </View>
        ))}
      </View>
    </MarketingPage>
  );
}

const styles = StyleSheet.create({
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  block: {
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 8,
  },
  t: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.gold,
    fontSize: 15,
  },
  b: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 24,
    fontSize: 15,
    maxWidth: 640,
  },
});
