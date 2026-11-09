import { StyleSheet, Text, View } from 'react-native';
import { MarketingPage } from '../src/components/marketing/MarketingPage';
import { colors } from '../src/theme/colors';

const DAYS = [
  ['01', 'Mon', 'Assessment', '68% GO unlock'],
  ['02', 'Tue', 'EliteFlow', 'Intel + whales'],
  ['03', 'Wed', 'Simulator', '£5 fake proof'],
  ['04', 'Thu', 'Execute', '£7/day live'],
  ['05', 'Fri', 'Legacy', '40/30/20/10 · 11pm'],
] as const;

const BOTS = [
  ['Eyes Boat', '30s cron · 100 wallets · 10 elites · whale watcher'],
  ['Discipline Coach', 'Tilt · FOMO · revenge · cooldowns'],
  ['Guardian Execution', 'Gate 5 · £7/day · 8/15/25 tap-out'],
] as const;

const ENGINES = [
  'Mindset',
  'Risk',
  'Strategy',
  'Backtest',
  'Journal',
  'Analytics',
  'Funding',
  'Growth',
  'Community',
  'Mentor',
  'Legacy',
  'Flow State',
] as const;

export default function HowItWorksPage() {
  return (
    <MarketingPage
      kicker="HOW IT WORKS"
      title="12 Engines · FlowChain · 3 Bots"
      lead="The Discipline OS has 12 Engines. One Heart. Not signals. Not bot. Must-complete Mon→Fri protects £35 live."
    >
      <Text style={styles.section}>FLOWCHAIN · THE HEART</Text>
      <View style={styles.chain}>
        {DAYS.map(([n, day, label, must]) => (
          <View key={day} style={styles.chainItem}>
            <Text style={styles.chainN}>{n}</Text>
            <Text style={styles.chainDay}>{day}</Text>
            <Text style={styles.chainLabel}>{label}</Text>
            <Text style={styles.chainMust}>{must}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>3 BOTS · INFRA AS FEATURE</Text>
      {BOTS.map(([name, line]) => (
        <View key={name} style={styles.botRow}>
          <Text style={styles.botName}>{name}</Text>
          <Text style={styles.botLine}>{line}</Text>
        </View>
      ))}

      <Text style={styles.section}>12 ENGINES</Text>
      <View style={styles.engineRow}>
        {ENGINES.map((name, i) => (
          <Text key={name} style={styles.engine}>
            <Text style={styles.engineN}>
              {String(i + 1).padStart(2, '0')}{' '}
            </Text>
            {name}
          </Text>
        ))}
      </View>
    </MarketingPage>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.gold,
  },
  chain: { gap: 0 },
  chainItem: {
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  chainN: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.gold,
  },
  chainDay: {
    marginTop: 4,
    fontFamily: 'Montserrat_800ExtraBold',
    color: colors.white,
    fontSize: 20,
  },
  chainLabel: {
    marginTop: 4,
    fontFamily: 'Montserrat_700Bold',
    color: colors.goldLight,
    fontSize: 15,
  },
  chainMust: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 14,
  },
  botRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 4,
  },
  botName: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.white,
    fontSize: 15,
  },
  botLine: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 14,
  },
  engineRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  engine: {
    fontFamily: 'Inter_500Medium',
    color: colors.white,
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(212,175,55,0.28)',
    backgroundColor: 'rgba(14,36,71,0.4)',
  },
  engineN: {
    fontFamily: 'JetBrainsMono_400Regular',
    color: colors.gold,
    fontSize: 11,
  },
});
