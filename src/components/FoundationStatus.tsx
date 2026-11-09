import { StyleSheet, Text, View } from 'react-native';
import { getCredentialStatuses, isFoundationReady } from '../config/env';
import { brandCopy, colors } from '../theme/colors';

export function FoundationStatus() {
  const statuses = getCredentialStatuses();
  const ready = isFoundationReady();

  return (
    <View style={styles.wrap}>
      <Text style={styles.brand}>TradFlow</Text>
      <Text style={styles.tagline}>{brandCopy.primary}</Text>
      <Text style={styles.subTag}>{brandCopy.secondary}</Text>

      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>
          {ready ? 'Foundation ready' : 'Waiting for credentials'}
        </Text>
        <Text style={styles.bannerBody}>
          {ready
            ? 'Supabase, Google Auth, GitHub, and VPS are configured. You can continue feature work.'
            : 'Fill .env from .env.example. The app shell stays parked until integrations are wired.'}
        </Text>
      </View>

      <View style={styles.list}>
        {statuses.map((item) => (
          <View key={item.group} style={styles.row}>
            <View
              style={[
                styles.dot,
                { backgroundColor: item.ready ? colors.ready : colors.waiting },
              ]}
            />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowMeta}>
                {item.ready
                  ? 'Configured'
                  : `Missing: ${item.missing.join(', ')}`}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.hint}>
        Paste credentials into TradFlow/.env, then restart Expo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 24,
  },
  brand: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.brand,
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: colors.gold,
  },
  subTag: {
    marginTop: 6,
    fontSize: 14,
    color: colors.textMuted,
  },
  banner: {
    marginTop: 28,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  bannerBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  list: {
    marginTop: 20,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  rowMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  hint: {
    marginTop: 24,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
