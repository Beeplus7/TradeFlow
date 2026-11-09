import { StyleSheet, Text, View } from 'react-native';
import { MarketingPage } from '../src/components/marketing/MarketingPage';
import { brandCopy, colors } from '../src/theme/colors';

const LINES = [
  'Zero Knowledge Needed — Flow teaches as you move.',
  'Mon→Fri must-complete is THE HEART. Skip and the next locks RED.',
  'Guardian taps you out before ego does — £10 vault holds the line.',
  'Legacy Fri 11pm: Smile Out with 40/30/20/10 and HMRC ready.',
  brandCopy.proof,
] as const;

export default function ManifestoPage() {
  return (
    <MarketingPage
      kicker="MANIFESTO"
      title="Assessment to Legacy. On Flow."
      lead="Friendly. Disciplined. UPRM heartbeat. Twelve engines, one operating system."
    >
      <View style={styles.list}>
        {LINES.map((line, i) => (
          <View key={line} style={styles.item}>
            <Text style={styles.n}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={styles.line}>{line}</Text>
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
  item: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  n: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 1,
    marginTop: 4,
  },
  line: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    color: colors.white,
    fontSize: 17,
    lineHeight: 28,
  },
});
