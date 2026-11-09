import { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
  children: ReactNode;
  /** Content max width — auth forms stay narrow; dashboards wider. */
  maxWidth?: number;
  /** Center content vertically (login). */
  centered?: boolean;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Keeps mobile layouts readable on desktop web:
 * navy full-bleed background, capped/centered content column.
 */
export function ScreenFrame({
  children,
  maxWidth = 720,
  centered = false,
  scroll = true,
  style,
  contentStyle,
}: Props) {
  const { width } = useWindowDimensions();
  const pad = width >= 900 ? 40 : width >= 600 ? 28 : 20;
  const columnWidth = Math.min(maxWidth, width - pad * 2);

  const inner = (
    <View
      style={[
        styles.column,
        {
          width: columnWidth,
          maxWidth,
          paddingHorizontal: 0,
        },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  if (!scroll) {
    return (
      <View
        style={[
          styles.root,
          centered && styles.centered,
          { paddingHorizontal: pad },
          style,
        ]}
      >
        {inner}
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, style]}
      contentContainerStyle={[
        styles.scrollContent,
        centered && styles.centered,
        {
          paddingHorizontal: pad,
          paddingTop: width >= 900 ? 40 : 24,
          paddingBottom: 64,
        },
      ]}
    >
      {inner}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    width: '100%',
  },
  centered: {
    justifyContent: 'center',
  },
  column: {
    alignSelf: 'center',
    width: '100%',
  },
});
