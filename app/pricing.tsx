import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { MarketingPage } from '../src/components/marketing/MarketingPage';
import { colors } from '../src/theme/colors';

const PLANS = [
  {
    name: 'Starter',
    price: '£49',
    blurb: 'Assessment · Journey · Simulator · Discipline Coach basic',
  },
  {
    name: 'Pro',
    price: '£99',
    blurb: 'Full OS · Guardian · EliteFlow · Eyes Boat',
    featured: true,
  },
  {
    name: 'Elite',
    price: '£299',
    blurb: 'Everything · priority tribe · Whale Tribe seat',
  },
] as const;

export default function PricingPage() {
  return (
    <MarketingPage
      kicker="PRICING"
      title="Pricing that smiles out with you."
      lead="Choose discipline model. Same OS. Different monetization — monthly flat or hybrid that scales with Smile Out."
    >
      <Text style={styles.section}>MONTHLY</Text>
      <View style={styles.list}>
        {PLANS.map((p) => (
          <View
            key={p.name}
            style={[styles.row, 'featured' in p && p.featured && styles.featured]}
          >
            <View style={styles.rowLeft}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.blurb}>{p.blurb}</Text>
            </View>
            <Text style={styles.price}>
              {p.price}
              <Text style={styles.mo}>/mo</Text>
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.hybrid}>
        <Text style={styles.hybridTitle}>HYBRID · £49 + 10%</Text>
        <Text style={styles.hybridCopy}>
          £49 base + 10% of Smile Out gains · hard cap £299/mo · Fri 11pm calc ·
          opt-in consent. Whales love it — still software, not a fund.
        </Text>
      </View>

      <Link href="/assessment-demo" asChild>
        <Pressable style={styles.cta}>
          <Text style={styles.ctaText}>Start with free GO →</Text>
        </Pressable>
      </Link>
      <Link href="/app/settings" asChild>
        <Pressable style={styles.link}>
          <Text style={styles.linkText}>Stripe checkout (signed in) →</Text>
        </Pressable>
      </Link>
    </MarketingPage>
  );
}

const styles = StyleSheet.create({
  section: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.gold,
  },
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  featured: { borderBottomColor: 'rgba(212,175,55,0.45)' },
  rowLeft: { flex: 1, gap: 6 },
  name: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.white,
    fontSize: 18,
  },
  blurb: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  price: {
    fontFamily: 'Montserrat_800ExtraBold',
    color: colors.gold,
    fontSize: 32,
  },
  mo: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textMuted,
  },
  hybrid: {
    marginTop: 8,
    paddingVertical: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(212,175,55,0.35)',
  },
  hybridTitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.gold,
  },
  hybridCopy: {
    marginTop: 10,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    lineHeight: 24,
    fontSize: 15,
  },
  cta: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 4,
  },
  ctaText: { fontFamily: 'Montserrat_700Bold', color: colors.navy },
  link: { marginTop: 14 },
  linkText: { fontFamily: 'Inter_500Medium', color: colors.goldLight },
});
