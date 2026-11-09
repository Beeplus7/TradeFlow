import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { colors } from '../../theme/colors';

/** Full-bleed desk visual — £50 dish as the product, not a card. */
export function HeroDish() {
  const { width } = useWindowDimensions();
  const pulse = useRef(new Animated.Value(0)).current;
  const split = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.timing(split, {
      toValue: 1,
      duration: 1600,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 4800,
        useNativeDriver: true,
      }),
    ).start();
  }, [pulse, split, sweep]);

  const glow = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });
  const sweepX = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 40],
  });

  const fakeW = split.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '10%'],
  });
  const liveW = split.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '70%'],
  });
  const safeW = split.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '20%'],
  });

  const coinSize = width >= 900 ? 168 : width >= 560 ? 140 : 120;

  return (
    <View style={styles.plane} accessibilityRole="image" accessibilityLabel="£50 dish visual">
      <View style={styles.rail}>
        <Text style={styles.railL}>LIVE DESK</Text>
        <Text style={styles.railC}>DISH · £50 ALLOCATED</Text>
        <Text style={styles.railR}>PAPER → LIVE</Text>
      </View>

      <Animated.View
        style={[
          styles.coin,
          {
            width: coinSize,
            height: coinSize,
            borderRadius: coinSize / 2,
            opacity: glow,
            transform: [{ translateX: sweepX }],
          },
        ]}
      >
        <Text style={[styles.coinText, { fontSize: coinSize * 0.3 }]}>£50</Text>
        <Text style={styles.coinSub}>IN</Text>
      </Animated.View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.seg, styles.fake, { width: fakeW }]} />
        <Animated.View style={[styles.seg, styles.live, { width: liveW }]} />
        <Animated.View style={[styles.seg, styles.safe, { width: safeW }]} />
      </View>

      <View style={styles.labels}>
        <View>
          <Text style={styles.labelK}>SIM</Text>
          <Text style={styles.labelV}>£5</Text>
        </View>
        <View style={styles.labelMid}>
          <Text style={styles.labelK}>EXECUTE</Text>
          <Text style={styles.labelV}>£35 · £7/DAY</Text>
        </View>
        <View style={styles.labelEnd}>
          <Text style={styles.labelK}>VAULT</Text>
          <Text style={styles.labelV}>£10</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  plane: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  rail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(212,175,55,0.35)',
  },
  railL: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.6,
    color: colors.ready,
  },
  railC: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.6,
    color: colors.gold,
  },
  railR: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.6,
    color: colors.textMuted,
  },
  coin: {
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: 'rgba(14,36,71,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  coinText: {
    fontFamily: 'Montserrat_800ExtraBold',
    color: colors.gold,
    letterSpacing: -1.5,
  },
  coinSub: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 4,
    color: colors.goldLight,
    marginTop: 2,
  },
  barTrack: {
    width: '100%',
    height: 14,
    borderRadius: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: 'rgba(6,14,31,0.9)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  seg: { height: '100%' },
  fake: { backgroundColor: colors.goldLight },
  live: { backgroundColor: colors.gold },
  safe: { backgroundColor: colors.white },
  labels: {
    marginTop: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  labelMid: { alignItems: 'center' },
  labelEnd: { alignItems: 'flex-end' },
  labelK: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    letterSpacing: 1.4,
    color: colors.textMuted,
  },
  labelV: {
    marginTop: 4,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13,
    color: colors.white,
  },
});
