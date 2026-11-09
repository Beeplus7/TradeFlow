import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { HeroDish } from '../src/components/marketing/HeroDish';
import { HomeInfographic } from '../src/components/marketing/HomeInfographic';
import { MarketingShell } from '../src/components/marketing/MarketingShell';
import { brandCopy, colors } from '../src/theme/colors';

/**
 * Marketing home — React Artifact IA + dish plane + brand tagline.
 * First viewport: brand, headline, support, CTAs, dominant dish.
 */
export default function MarketingHome() {
  const { height, width } = useWindowDimensions();
  const heroMin = Math.max(620, height - 120);
  const pad = width >= 1200 ? 56 : width >= 800 ? 36 : 20;

  return (
    <MarketingShell fullBleedHero>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ minHeight: height }}>
        <View
          style={[
            styles.hero,
            { minHeight: heroMin, paddingHorizontal: pad },
          ]}
        >
          <Text style={styles.private}>PRIVATE BETA · DISCIPLINE OS</Text>
          <Text style={styles.brand}>TradFlow</Text>
          <Text style={styles.headline}>
            £50 In. Smile Out. Zero Knowledge Needed.
          </Text>
          <Text style={styles.support}>
            for Crypto Traders Who Want to Smile Out — Assessment to Legacy, on
            Flow.
          </Text>

          <View style={styles.ctaRow}>
            <Link href="/app/login" asChild>
              <Pressable style={styles.primary}>
                <Text style={styles.primaryText}>Start £50 Journey →</Text>
              </Pressable>
            </Link>
            <Link href="/assessment-demo" asChild>
              <Pressable style={styles.secondary}>
                <Text style={styles.secondaryText}>
                  Free Assessment Demo 68% GO
                </Text>
              </Pressable>
            </Link>
          </View>

          <Text style={styles.tagline}>{brandCopy.primary}</Text>

          <View style={styles.dishPlane}>
            <HeroDish />
          </View>
        </View>

        <View style={[styles.section, { paddingHorizontal: pad }]}>
          <HomeInfographic />
        </View>

        <View style={[styles.section, { paddingHorizontal: pad }]}>
          <Text style={styles.bandKicker}>FLOWCHAIN · THE HEART</Text>
          <Text style={styles.bandLine}>
            Not signals. Not bot. Discipline over FOMO. Must-complete Mon→Fri
            is THE HEART. Everything else protects £35 live.
          </Text>
          <View style={styles.days}>
            {(
              [
                ['MON', 'Assessment'],
                ['TUE', 'EliteFlow'],
                ['WED', 'Simulator'],
                ['THU', 'Execute'],
                ['FRI', 'Legacy'],
              ] as const
            ).map(([d, label], i) => (
              <View key={d} style={styles.day}>
                <Text style={styles.dayN}>{String(i + 1).padStart(2, '0')}</Text>
                <Text style={styles.dayD}>{d}</Text>
                <Text style={styles.dayL}>{label}</Text>
              </View>
            ))}
          </View>
          <Link href="/how-it-works" asChild>
            <Pressable style={styles.bandCta}>
              <Text style={styles.bandCtaText}>
                12 Engines · FlowChain · 3 Bots →
              </Text>
            </Pressable>
          </Link>
        </View>

        <View style={[styles.closing, { paddingHorizontal: pad }]}>
          <Text style={styles.closingBrand}>TradFlow</Text>
          <Text style={styles.closingTag}>{brandCopy.primary}</Text>
          <Text style={styles.closingSub}>{brandCopy.secondary}</Text>
          <View style={styles.closingLinks}>
            <Link href="/pricing" asChild>
              <Pressable>
                <Text style={styles.closingLink}>Pricing</Text>
              </Pressable>
            </Link>
            <Link href="/manifesto" asChild>
              <Pressable>
                <Text style={styles.closingLink}>Manifesto</Text>
              </Pressable>
            </Link>
            <Link href="/legal" asChild>
              <Pressable>
                <Text style={styles.closingLink}>Legal</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </MarketingShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 40,
    paddingBottom: 36,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  private: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.goldLight,
    marginBottom: 12,
  },
  brand: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 64,
    lineHeight: 68,
    color: colors.gold,
    letterSpacing: -2,
    textAlign: 'center',
  },
  headline: {
    marginTop: 16,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 24,
    lineHeight: 32,
    color: colors.white,
    textAlign: 'center',
    maxWidth: 520,
  },
  support: {
    marginTop: 12,
    maxWidth: 460,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 25,
    color: colors.textMuted,
    textAlign: 'center',
  },
  ctaRow: {
    marginTop: 26,
    marginBottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.gold,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 4,
  },
  primaryText: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.navy,
    fontSize: 14,
  },
  secondary: {
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.45)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 4,
  },
  secondaryText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.goldLight,
    fontSize: 14,
  },
  tagline: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2.2,
    color: colors.gold,
    marginBottom: 20,
  },
  dishPlane: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 24,
    backgroundColor: 'rgba(6,14,31,0.4)',
  },
  section: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingVertical: 48,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  bandKicker: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2.4,
    color: colors.gold,
    textAlign: 'center',
  },
  bandLine: {
    marginTop: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 26,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 560,
    alignSelf: 'center',
  },
  days: {
    marginTop: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  day: {
    minWidth: 88,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(212,175,55,0.35)',
    backgroundColor: 'rgba(14,36,71,0.5)',
  },
  dayN: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: colors.gold,
  },
  dayD: {
    marginTop: 6,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: colors.white,
  },
  dayL: {
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.textMuted,
  },
  bandCta: { marginTop: 28, alignSelf: 'center' },
  bandCtaText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.goldLight,
    fontSize: 14,
  },
  closing: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingVertical: 48,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    alignItems: 'center',
    gap: 8,
  },
  closingBrand: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 18,
    color: colors.white,
  },
  closingTag: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 2,
    color: colors.gold,
  },
  closingSub: {
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 14,
  },
  closingLinks: { flexDirection: 'row', gap: 24, marginTop: 8 },
  closingLink: {
    fontFamily: 'Inter_500Medium',
    color: colors.goldLight,
    fontSize: 13,
  },
});
