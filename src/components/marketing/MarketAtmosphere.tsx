import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

/** Shared vault atmosphere — navy depth + gold key light. Used site-wide. */
export function MarketAtmosphere({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <View style={styles.vignette} />
      <View style={styles.goldKey} />
      <View style={styles.gridH} />
      <View style={styles.gridV} />
      <View style={styles.floor} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.navyDeep,
    overflow: 'hidden',
    position: 'relative',
  },
  vignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.navy,
    opacity: 0.92,
  },
  goldKey: {
    position: 'absolute',
    top: -120,
    left: '20%',
    width: '60%',
    height: 320,
    borderRadius: 200,
    backgroundColor: colors.gold,
    opacity: 0.07,
  },
  gridH: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.045,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.white,
    // layered via multiple thin bands
    backgroundColor: 'transparent',
  },
  gridV: {
    position: 'absolute',
    top: '8%',
    bottom: '8%',
    left: '12%',
    right: '12%',
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(212,175,55,0.18)',
  },
  floor: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    backgroundColor: colors.navyDeep,
    opacity: 0.85,
  },
  content: { flex: 1, zIndex: 1 },
});
