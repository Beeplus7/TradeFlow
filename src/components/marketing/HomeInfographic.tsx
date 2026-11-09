import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors } from '../../theme/colors';

const TILES = [
  {
    kicker: 'DISH',
    title: '£50 In',
    lines: ['£5 Simulator', '£35 Live · £7/day', '£10 Guardian vault'],
    tone: 'navy' as const,
  },
  {
    kicker: 'ASSESSMENT',
    title: '68% GO',
    lines: ['Market regime', 'Volatility gate', 'Unlocks Monday'],
    tone: 'gold' as const,
  },
  {
    kicker: 'LIVE CONSOLE',
    title: '£7 / £7',
    lines: ['Gate 5 greens', 'Guardian 15%', 'Cap hit → auto stop'],
    tone: 'console' as const,
  },
  {
    kicker: 'FLOWCHAIN',
    title: 'THE HEART',
    lines: ['Mon→Fri must-complete', 'Skip locks next RED', 'Flow as One'],
    tone: 'navy' as const,
  },
] as const;

/** Home infographic grid — from React Artifact marketing prototype. */
export function HomeInfographic() {
  const { width } = useWindowDimensions();
  const tileW: `${number}%` = width >= 900 ? '48%' : '100%';

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>TRADEFLOW OS · INSTALLED</Text>
      <View style={styles.grid}>
        {TILES.map((t) => (
          <View
            key={t.kicker}
            style={[
              styles.tile,
              { width: tileW },
              t.tone === 'gold' && styles.tileGold,
              t.tone === 'console' && styles.tileConsole,
            ]}
          >
            <Text
              style={[
                styles.tileKicker,
                t.tone === 'gold' && styles.onGold,
                t.tone === 'console' && styles.onConsole,
              ]}
            >
              {t.kicker}
            </Text>
            <Text
              style={[
                styles.tileTitle,
                t.tone === 'gold' && styles.onGold,
                t.tone === 'console' && styles.consoleTitle,
              ]}
            >
              {t.title}
            </Text>
            {t.lines.map((line) => (
              <Text
                key={line}
                style={[
                  styles.tileLine,
                  t.tone === 'gold' && styles.onGoldMuted,
                  t.tone === 'console' && styles.onConsoleMuted,
                ]}
              >
                {line}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', maxWidth: 920, alignSelf: 'center', gap: 16 },
  kicker: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.gold,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  tile: {
    minWidth: 200,
    padding: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#0E1D3D',
    marginBottom: 4,
  },
  tileGold: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  tileConsole: {
    backgroundColor: '#02060C',
    borderColor: 'rgba(212,175,55,0.35)',
  },
  tileKicker: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.6,
    color: colors.gold,
  },
  tileTitle: {
    marginTop: 8,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 26,
    color: colors.white,
    letterSpacing: -0.5,
  },
  consoleTitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 20,
    color: colors.gold,
  },
  tileLine: {
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMuted,
  },
  onGold: { color: colors.navy },
  onGoldMuted: { color: 'rgba(10,25,49,0.7)' },
  onConsole: { color: colors.gold },
  onConsoleMuted: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: colors.goldLight,
  },
});
