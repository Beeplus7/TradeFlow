import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

/** UPRM-style progress ring — TradFlow gold on navy. */
export function FlowProgressRing({
  progress,
  size = 128,
  label = 'FlowChain',
}: {
  progress: number;
  size?: number;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  const stroke = 8;
  const track = size - stroke * 2;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View
        style={[
          styles.track,
          {
            width: track,
            height: track,
            borderRadius: track / 2,
            borderWidth: stroke,
          },
        ]}
      />
      <View
        style={[
          styles.arc,
          {
            width: track,
            height: track,
            borderRadius: track / 2,
            borderWidth: stroke,
            // Approximate fill via opacity bands — full SVG later if needed
            borderColor: pct >= 80 ? colors.ready : colors.gold,
            opacity: 0.25 + (pct / 100) * 0.75,
            transform: [{ rotate: '-90deg' }],
          },
        ]}
      />
      <View style={styles.center}>
        <Text style={styles.pct}>{pct}%</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  track: {
    position: 'absolute',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  arc: {
    position: 'absolute',
    borderTopColor: colors.gold,
    borderRightColor: colors.gold,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  center: { alignItems: 'center' },
  pct: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 28,
    color: colors.white,
  },
  label: {
    marginTop: 2,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
});
