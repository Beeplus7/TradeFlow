import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { GO_THRESHOLD } from '../types/db';

type Props = {
  score: number;
  animated?: boolean;
};

export function GoMeter({ score, animated = true }: Props) {
  const [display, setDisplay] = useState(animated ? 0 : score);
  const go = score >= GO_THRESHOLD;
  const pct = Math.max(0, Math.min(100, score));

  useEffect(() => {
    if (!animated) {
      setDisplay(score);
      return;
    }
    let frame = 0;
    const frames = 28;
    const id = setInterval(() => {
      frame += 1;
      setDisplay(Math.round((score * frame) / frames));
      if (frame >= frames) clearInterval(id);
    }, 24);
    return () => clearInterval(id);
  }, [score, animated]);

  return (
    <View style={styles.wrap}>
      <View style={styles.ring}>
        <View style={[styles.fill, { height: `${pct}%` as `${number}%` }]} />
        <View style={styles.center}>
          <Text style={styles.value}>{display.toFixed(0)}%</Text>
          <Text style={[styles.badge, go ? styles.go : styles.nogo]}>
            {go ? 'GO — TRADE' : 'NO-GO — WAIT'}
          </Text>
        </View>
      </View>
      <Text style={styles.threshold}>Threshold {GO_THRESHOLD}% · volatility regime</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  ring: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.navyDeep,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gold,
    opacity: 0.35,
  },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  value: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 42,
    color: colors.white,
    letterSpacing: -1,
  },
  badge: {
    marginTop: 6,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '700',
  },
  go: { color: colors.ready },
  nogo: { color: colors.waiting },
  threshold: {
    marginTop: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
});
