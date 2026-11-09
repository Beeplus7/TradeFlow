import { ReactNode, useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Link, usePathname } from 'expo-router';
import { MARKETING_NAV } from '../../navigation/routes';
import { brandCopy, colors } from '../../theme/colors';
import { MarketAtmosphere } from './MarketAtmosphere';

type Props = {
  children: ReactNode;
  fullBleedHero?: boolean;
};

const PRIMARY_NAV = MARKETING_NAV.filter((l) =>
  ['/how-it-works', '/pricing', '/commonwealth', '/about'].includes(l.href),
);

export function MarketingShell({ children, fullBleedHero }: Props) {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const compact = width < 960;
  const pad = width >= 1200 ? 56 : width >= 800 ? 36 : 20;
  const tick = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tick, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(tick, {
          toValue: 0.35,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [tick]);

  return (
    <View style={styles.root}>
      <View style={styles.topStrip}>
        <View style={[styles.topInner, { paddingHorizontal: pad }]}>
          <View style={styles.liveRow}>
            <Animated.View style={[styles.liveDot, { opacity: tick }]} />
            <Text style={styles.liveText}>SYSTEMS ONLINE</Text>
            <Text style={styles.liveSep}>·</Text>
            <Text style={styles.liveMuted}>GO ≥68%</Text>
            <Text style={styles.liveSep}>·</Text>
            <Text style={styles.liveMuted}>£7/DAY CAP</Text>
            {!compact ? (
              <>
                <Text style={styles.liveSep}>·</Text>
                <Text style={styles.liveMuted}>GUARDIAN 8/15/25</Text>
              </>
            ) : null}
          </View>
          <Text style={styles.liveRight}>{brandCopy.primary}</Text>
        </View>
      </View>

      <View style={[styles.navBar, { paddingHorizontal: pad }]}>
        <View style={styles.navInner}>
          <Link href="/" asChild>
            <Pressable style={styles.brandWrap}>
              <View style={styles.mark}>
                <Text style={styles.markText}>TF</Text>
              </View>
              <Text style={styles.brand}>TradFlow</Text>
            </Pressable>
          </Link>

          {!compact ? (
            <View style={styles.links}>
              {PRIMARY_NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href as any} asChild>
                    <Pressable style={styles.linkHit}>
                      <Text style={[styles.link, active && styles.linkActive]}>
                        {item.label}
                      </Text>
                      {active ? <View style={styles.linkUnderline} /> : null}
                    </Pressable>
                  </Link>
                );
              })}
            </View>
          ) : null}

          <View style={styles.actions}>
            <Link href="/app/login" asChild>
              <Pressable style={styles.ghost}>
                <Text style={styles.ghostText}>Sign in</Text>
              </Pressable>
            </Link>
            <Link href="/app/login" asChild>
              <Pressable style={styles.cta}>
                <Text style={styles.ctaText}>Enter OS</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>

      <MarketAtmosphere>
        {fullBleedHero ? (
          children
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.page,
              { paddingHorizontal: pad },
            ]}
          >
            <View style={styles.pageColumn}>{children}</View>
            <MarketingFooter pad={pad} />
          </ScrollView>
        )}
      </MarketAtmosphere>
    </View>
  );
}

function MarketingFooter({ pad }: { pad: number }) {
  return (
    <View style={[styles.footer, { marginHorizontal: -pad, paddingHorizontal: pad }]}>
      <View style={styles.footerInner}>
        <View>
          <Text style={styles.footerBrand}>TradFlow</Text>
          <Text style={styles.footerTag}>{brandCopy.secondary}</Text>
        </View>
        <View style={styles.footerLinks}>
          <Link href="/manifesto" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Manifesto</Text>
            </Pressable>
          </Link>
          <Link href="/assessment-demo" asChild>
            <Pressable>
              <Text style={styles.footerLink}>GO Demo</Text>
            </Pressable>
          </Link>
          <Link href="/scorecard" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Score Card</Text>
            </Pressable>
          </Link>
          <Link href="/legal" asChild>
            <Pressable>
              <Text style={styles.footerLink}>Legal</Text>
            </Pressable>
          </Link>
        </View>
      </View>
      <Text style={styles.footerFine}>
        Software license · not investment advice · not a fund manager
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navyDeep },
  topStrip: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(212,175,55,0.25)',
    backgroundColor: colors.navyDeep,
    zIndex: 30,
  },
  topInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.ready,
  },
  liveText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.ready,
  },
  liveSep: { color: colors.textMuted, fontSize: 10 },
  liveMuted: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.textMuted,
  },
  liveRight: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    letterSpacing: 1.6,
    color: colors.gold,
  },
  navBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: 'rgba(6,14,31,0.88)',
    zIndex: 20,
  },
  navInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    gap: 16,
  },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.55)',
    backgroundColor: colors.navyLift,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    fontFamily: 'Montserrat_800ExtraBold',
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  brand: {
    fontFamily: 'Montserrat_800ExtraBold',
    color: colors.white,
    fontSize: 18,
    letterSpacing: 0.2,
  },
  links: {
    flexDirection: 'row',
    gap: 28,
    flex: 1,
    justifyContent: 'center',
  },
  linkHit: { alignItems: 'center', paddingVertical: 4 },
  link: {
    fontFamily: 'Inter_500Medium',
    color: colors.textMuted,
    fontSize: 13,
    letterSpacing: 0.2,
  },
  linkActive: { color: colors.white },
  linkUnderline: {
    marginTop: 6,
    height: 1,
    width: '100%',
    backgroundColor: colors.gold,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ghost: { paddingHorizontal: 8, paddingVertical: 10 },
  ghostText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.goldLight,
    fontSize: 13,
  },
  cta: {
    backgroundColor: colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 4,
  },
  ctaText: {
    fontFamily: 'Montserrat_700Bold',
    color: colors.navy,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  scroll: { flex: 1 },
  page: {
    paddingTop: 56,
    paddingBottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  pageColumn: {
    width: '100%',
    maxWidth: 960,
    paddingBottom: 48,
  },
  footer: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: 'rgba(6,14,31,0.95)',
    paddingTop: 36,
    paddingBottom: 40,
    marginTop: 24,
  },
  footerInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 20,
  },
  footerBrand: {
    fontFamily: 'Montserrat_800ExtraBold',
    color: colors.white,
    fontSize: 16,
  },
  footerTag: {
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
    color: colors.textMuted,
    fontSize: 13,
  },
  footerLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  footerLink: {
    fontFamily: 'Inter_500Medium',
    color: colors.goldLight,
    fontSize: 13,
  },
  footerFine: {
    marginTop: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textMuted,
  },
});
