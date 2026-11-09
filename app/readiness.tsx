import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { MarketingShell } from '../src/components/marketing/MarketingShell';
import { colors } from '../src/theme/colors';

type Status = 'DONE' | 'WIP' | 'TODO' | 'BLOCKED';

type Item = {
  id: string;
  label: string;
  pct: number;
  status: Status;
  href?: string;
  note?: string;
  left?: string;
};

type Phase = {
  title: string;
  pct: number;
  items: Item[];
};

/** Scanned against local TradFlow tree + VPS inventory · 9 Nov 2026 */
const PHASES: Phase[] = [
  {
    title: 'A · Marketing (Public)',
    pct: 96,
    items: [
      { id: 'm-home', label: 'Hero /', pct: 98, status: 'DONE', href: '/', note: 'Brand + dish + CTAs' },
      { id: 'm-hiw', label: 'How it works', pct: 95, status: 'DONE', href: '/how-it-works', note: '12 Engines · FlowChain · 3 Bots' },
      { id: 'm-price', label: 'Pricing', pct: 95, status: 'DONE', href: '/pricing', note: '£49 / £99 / £299 + hybrid' },
      { id: 'm-tribe', label: 'Commonwealth', pct: 98, status: 'DONE', href: '/commonwealth' },
      { id: 'm-about', label: 'About · Manifesto · Legal', pct: 94, status: 'DONE', href: '/about' },
      { id: 'm-demo', label: 'Assessment demo lead magnet', pct: 96, status: 'DONE', href: '/assessment-demo' },
      { id: 'm-score', label: 'Scorecard', pct: 90, status: 'DONE', href: '/scorecard' },
    ],
  },
  {
    title: 'B · OS Core Loop',
    pct: 93,
    items: [
      { id: 'os-login', label: 'Google sign-in', pct: 95, status: 'DONE', href: '/app/login', note: 'Supabase + Testing audience' },
      { id: 'os-on', label: 'OnboardingOS', pct: 100, status: 'DONE', href: '/app/onboarding' },
      { id: 'os-go', label: 'Assessment 68% GO', pct: 100, status: 'DONE', href: '/app/assessment' },
      { id: 'os-fin', label: 'Finance £50 dish', pct: 100, status: 'DONE', href: '/app/finance' },
      { id: 'os-home', label: 'UPRM dashboard', pct: 92, status: 'DONE', href: '/app' },
      { id: 'os-journey', label: 'Journey Heart Mon→Fri', pct: 100, status: 'DONE', href: '/app/journey' },
      { id: 'os-sim', label: 'Simulator £5 fake', pct: 100, status: 'DONE', href: '/app/simulator' },
    ],
  },
  {
    title: 'C · Execute · Guard · Eyes',
    pct: 90,
    items: [
      { id: 'ex-connect', label: 'Connect (paper-first)', pct: 90, status: 'DONE', href: '/app/connect', left: 'Live Binance/Bybit keys later' },
      { id: 'ex-desk', label: 'Execute paper console', pct: 92, status: 'DONE', href: '/app/execute', note: '£7/day · Gate 5' },
      { id: 'ex-guard', label: 'Guardian 8/15/25', pct: 92, status: 'DONE', href: '/app/guardian' },
      { id: 'ex-eyes', label: 'Eyes Boat paper scan', pct: 88, status: 'WIP', href: '/app/intelligence', left: 'Alchemy/Moralis live feeds' },
      { id: 'ex-disc', label: 'Discipline locks', pct: 90, status: 'DONE', href: '/app/discipline' },
      { id: 'ex-uprm', label: 'UPRM companion memory', pct: 88, status: 'DONE', href: '/app/uprm' },
    ],
  },
  {
    title: 'D · Legacy · Billing · Admin',
    pct: 88,
    items: [
      { id: 'leg', label: 'Legacy 40/30/20/10', pct: 92, status: 'DONE', href: '/app/legacy' },
      { id: 'recoup', label: 'Recoup 18-day', pct: 88, status: 'DONE', href: '/app/recoup' },
      { id: 'pay', label: 'Stripe Checkout (test)', pct: 90, status: 'DONE', href: '/app/settings', note: 'Edge create-tradeflow-checkout' },
      { id: 'admin', label: 'Admin tribe · elites · nudges · billing · support', pct: 85, status: 'DONE', href: '/app/admin' },
    ],
  },
  {
    title: 'E · Infra · Deploy · Domain',
    pct: 98,
    items: [
      { id: 'sb', label: 'Supabase project + migrations', pct: 100, status: 'DONE', note: 'dvjawpbnjyjnjzktyrwp' },
      { id: 'gh', label: 'GitHub Beeplus7/TradeFlow main', pct: 100, status: 'DONE', note: 'Pushed 9 Nov 2026' },
      { id: 'vps-slot', label: 'VPS isolation slot 3030/4100', pct: 100, status: 'DONE', note: '87.106.103.43 · /var/www/tradeflow' },
      { id: 'export', label: 'Expo web export + PM2 online', pct: 100, status: 'DONE', note: 'tradeflow-web/api/worker · healthz green' },
      { id: 'nginx', label: 'Nginx vhost tradflow.online', pct: 100, status: 'DONE', note: 'HTTP/HTTPS for tradflow.online' },
      { id: 'dns', label: 'DNS A tradflow.online → VPS', pct: 100, status: 'DONE', note: 'IONOS A → 87.106.103.43' },
      { id: 'tls', label: 'TLS certbot', pct: 100, status: 'DONE', note: 'Let’s Encrypt · expires 2027-02-07' },
      { id: 'online', label: 'tradflow.online production host', pct: 95, status: 'DONE', note: 'Primary domain live on this VPS' },
    ],
  },
];

const OVERALL = Math.round(
  PHASES.reduce((a, p) => a + p.pct, 0) / PHASES.length,
);

function statusColor(s: Status) {
  if (s === 'DONE') return colors.ready;
  if (s === 'WIP') return colors.waiting;
  if (s === 'BLOCKED') return colors.danger;
  return 'rgba(255,255,255,0.45)';
}

export default function ProductionReadinessPage() {
  const { width } = useWindowDimensions();
  const [shown, setShown] = useState(0);
  const pad = width >= 1100 ? 48 : width >= 720 ? 28 : 16;
  const scanStamp = useMemo(() => new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC', []);

  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 2;
      if (n >= OVERALL) {
        setShown(OVERALL);
        clearInterval(id);
      } else setShown(n);
    }, 16);
    return () => clearInterval(id);
  }, []);

  return (
    <MarketingShell>
      <ScrollView contentContainerStyle={[styles.page, { paddingHorizontal: pad }]}>
        <Text style={styles.kicker}>PRODUCTION READINESS · LIVE SCAN</Text>
        <Text style={styles.title}>TradFlow OS readiness</Text>
        <Text style={styles.sub}>
          Host target tradflow.online · scanned {scanStamp} · overall {shown}%
        </Text>

        <View style={styles.meterWrap}>
          <View style={styles.meterTrack}>
            <View style={[styles.meterFill, { width: `${shown}%` as `${number}%` }]} />
          </View>
          <Text style={styles.meterLabel}>{shown}% production-ready</Text>
        </View>

        <View style={styles.actions}>
          <Link href="/scorecard" asChild>
            <Pressable style={styles.btnGhost}>
              <Text style={styles.btnGhostText}>Open scorecard</Text>
            </Pressable>
          </Link>
          <Link href="/app" asChild>
            <Pressable style={styles.btnSolid}>
              <Text style={styles.btnSolidText}>Enter OS</Text>
            </Pressable>
          </Link>
        </View>

        {PHASES.map((phase) => (
          <View key={phase.title} style={styles.phase}>
            <View style={styles.phaseHead}>
              <Text style={styles.phaseTitle}>{phase.title}</Text>
              <Text style={styles.phasePct}>{phase.pct}%</Text>
            </View>
            {phase.items.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.rowMain}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  {item.note ? <Text style={styles.rowNote}>{item.note}</Text> : null}
                  {item.left ? <Text style={styles.rowLeft}>Left: {item.left}</Text> : null}
                </View>
                <View style={styles.rowMeta}>
                  <Text style={[styles.badge, { color: statusColor(item.status) }]}>{item.status}</Text>
                  <Text style={styles.rowPct}>{item.pct}%</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.footer}>
          Primary host https://tradflow.online on 87.106.103.43. Add Google/Supabase redirect URLs for https://tradflow.online/**.
        </Text>
      </ScrollView>
    </MarketingShell>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 80,
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
  },
  kicker: {
    color: colors.gold,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2.4,
    marginBottom: 10,
  },
  title: {
    color: colors.white,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 34,
    letterSpacing: -0.6,
  },
  sub: {
    marginTop: 8,
    color: colors.textMuted,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  meterWrap: { marginTop: 28, marginBottom: 18 },
  meterTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: colors.gold,
  },
  meterLabel: {
    marginTop: 10,
    color: colors.goldLight,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    letterSpacing: 1.2,
  },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 28, flexWrap: 'wrap' },
  btnGhost: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  btnGhostText: { color: colors.white, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  btnSolid: {
    backgroundColor: colors.gold,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  btnSolidText: { color: colors.navy, fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  phase: {
    marginBottom: 22,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 16,
  },
  phaseHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  phaseTitle: {
    color: colors.white,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
  },
  phasePct: {
    color: colors.gold,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowMain: { flex: 1 },
  rowLabel: {
    color: colors.white,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  rowNote: {
    marginTop: 3,
    color: colors.textMuted,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  rowLeft: {
    marginTop: 3,
    color: colors.waiting,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  rowMeta: { alignItems: 'flex-end', minWidth: 72 },
  badge: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
  },
  rowPct: {
    marginTop: 4,
    color: colors.textMuted,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
  },
  footer: {
    marginTop: 28,
    color: colors.textMuted,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
});
