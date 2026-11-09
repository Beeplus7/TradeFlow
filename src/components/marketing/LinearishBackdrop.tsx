import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

/** Atmosphere layer — navy vault with gold wash (no flat single fill). */
export function LinearishBackdrop({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <View style={styles.washTop} />
      <View style={styles.washGold} />
      <View style={styles.washDeep} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.navy,
    overflow: 'hidden',
  },
  washTop: {
    position: 'absolute',
    top: -80,
    left: -40,
    right: -40,
    height: 280,
    backgroundColor: colors.navyLift,
    opacity: 0.55,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  washGold: {
    position: 'absolute',
    top: 120,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.gold,
    opacity: 0.08,
  },
  washDeep: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.navyDeep,
    opacity: 0.9,
  },
  content: { flex: 1, zIndex: 1 },
});
