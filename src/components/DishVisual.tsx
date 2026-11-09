import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  fake: number;
  live: number;
  safety: number;
  daySpent?: number;
  dayCap?: number;
};

const slices = [
  { key: 'fake', label: '£5 FAKE', color: '#C9A86A', desc: 'Simulator' },
  { key: 'live', label: '£35 LIVE', color: '#D4AF37', desc: '£7/day Mon–Fri' },
  { key: 'safety', label: '£10 SAFE', color: '#FFFFFF', desc: 'Guardian vault' },
] as const;

export function DishVisual({
  fake,
  live,
  safety,
  daySpent = 0,
  dayCap = 7,
}: Props) {
  const total = fake + live + safety || 50;
  const values = { fake, live, safety };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>£50 DISH</Text>
      <Text style={styles.sub}>£5 fake · £35 live · £10 safety</Text>

      <View style={styles.bar}>
        {slices.map((s) => (
          <View
            key={s.key}
            style={[
              styles.slice,
              {
                flex: values[s.key] / total,
                backgroundColor: s.color,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.legend}>
        {slices.map((s) => (
          <View key={s.key} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{s.label}</Text>
              <Text style={styles.desc}>{s.desc}</Text>
            </View>
            <Text style={styles.amount}>£{values[s.key].toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.capBox}>
        <Text style={styles.capLabel}>TODAY £7 CAP</Text>
        <Text style={styles.capValue}>
          £{daySpent.toFixed(2)} / £{dayCap.toFixed(2)}
        </Text>
        <View style={styles.capTrack}>
          <View
            style={[
              styles.capFill,
              {
                width: `${Math.min(100, (daySpent / dayCap) * 100)}%` as `${number}%`,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  title: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 22,
    color: colors.gold,
  },
  sub: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 13,
  },
  bar: {
    marginTop: 18,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: colors.navyDeep,
  },
  slice: { height: '100%' },
  legend: { marginTop: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
    color: colors.white,
  },
  desc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  amount: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.white,
    fontSize: 15,
  },
  capBox: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  capLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.goldLight,
  },
  capValue: {
    marginTop: 4,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18,
    color: colors.white,
  },
  capTrack: {
    marginTop: 10,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.navyDeep,
    overflow: 'hidden',
  },
  capFill: {
    height: '100%',
    backgroundColor: colors.gold,
  },
});
