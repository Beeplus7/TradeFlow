import { StyleSheet, Text, View } from 'react-native';
import { MarketingPage } from '../src/components/marketing/MarketingPage';
import { brandCopy, colors } from '../src/theme/colors';

export default function AboutPage() {
  return (
    <MarketingPage
      kicker="ABOUT"
      title={brandCopy.secondary}
      lead="Oldham Tribe Story — discipline over signals. Process installed — not learned."
    >
      <Text style={styles.p}>
        TradFlow started as a refusal of London fluff and Vegas hype. Oldham
        energy: small entry, joyful exit, accountable peers. We speak like a
        funded trader who made it — direct, warm, accountable.
      </Text>
      <Text style={styles.p}>
        The £50 dish is the whole thesis: £5 to train without fear, £35 to
        execute with a £7/day cap, £10 locked for Guardian. Friday Legacy splits
        the Smile Out so tax, vault, and reinvest stay honest.
      </Text>
      <View style={styles.quoteBlock}>
        <Text style={styles.quote}>
          Process &gt; prediction · Commonwealth &gt; competition · Legacy &gt;
          lifestyle
        </Text>
      </View>
    </MarketingPage>
  );
}

const styles = StyleSheet.create({
  p: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 28,
    maxWidth: 640,
  },
  quoteBlock: {
    marginTop: 8,
    paddingVertical: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(212,175,55,0.4)',
  },
  quote: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.gold,
    fontSize: 18,
    lineHeight: 30,
    maxWidth: 560,
  },
});
