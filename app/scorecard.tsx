import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MarketingShell } from '../src/components/marketing/MarketingShell';
import { colors } from '../src/theme/colors';

type ModuleScore = {
  name: string;
  score: number;
  state: 'ready' | 'wait' | 'miss';
  note: string;
};

type PhaseRow = {
  phase: string;
  status: 'READY' | 'WAIT' | 'MISS';
  pts: number;
  note: string;
};

const MODULES: ModuleScore[] = [
  { name: 'Foundation', score: 100, state: 'ready', note: 'Supabase · Google Auth · schema' },
  { name: 'Marketing site', score: 95, state: 'ready', note: 'Hero · pricing · GO demo' },
  { name: 'Onboarding + GO', score: 100, state: 'ready', note: '6-step · 68% meter · dish' },
  { name: 'Journey Heart', score: 100, state: 'ready', note: 'Mon→Fri · FlowChain guard' },
  { name: 'Simulator', score: 100, state: 'ready', note: '£5 fake · discipline proof' },
  { name: 'Execution', score: 92, state: 'ready', note: 'Paper · £7 cap · Gate 5' },
  { name: 'Guardian', score: 92, state: 'ready', note: '8/15/25 tap-out · 10s check' },
  { name: 'Eyes / Discipline', score: 90, state: 'ready', note: 'EliteFlow · Eyes Boat · locks' },
  { name: 'Legacy + Billing', score: 88, state: 'ready', note: 'Split · Stripe Checkout test' },
  { name: 'VPS harden', score: 72, state: 'wait', note: 'PM2+nginx live · DNS/TLS blocked' },
];

const PHASES: PhaseRow[] = [
  { phase: '0–1 Foundation', status: 'READY', pts: 100, note: 'Credentials · brand · shell' },
  { phase: '2 Onboarding', status: 'READY', pts: 100, note: 'Risk · assessment · finance' },
  { phase: '3 Journey Heart', status: 'READY', pts: 100, note: 'FlowChain · simulator' },
  { phase: '4 Execute + Guard', status: 'READY', pts: 92, note: 'Paper console · shield' },
  { phase: '5 Commonwealth', status: 'READY', pts: 90, note: 'EliteFlow · Eyes · Discipline · UPRM' },
  { phase: '6 Legacy + Pay', status: 'READY', pts: 88, note: 'Legacy · Stripe · admin' },
  { phase: '7 Marketing polish', status: 'READY', pts: 95, note: 'Live under /' },
  { phase: '8 Deploy', status: 'WAIT', pts: 72, note: 'PM2+nginx live · DNS A missing' },
];

type ApiRow = {
  api: string;
  portal: string;
  need: 'FIRST TEST' | 'PAY TEST' | 'LATER';
  status: 'READY' | 'WAIT' | 'MISS';
  note: string;
};

/** External APIs — first test needs only 2; Stripe wired for pay test. */
const EXTERNAL_APIS: ApiRow[] = [
  {
    api: 'Supabase',
    portal: 'supabase.com/dashboard → Settings → API',
    need: 'FIRST TEST',
    status: 'READY',
    note: 'Auth · DB · Edge Functions · RLS',
  },
  {
    api: 'Google OAuth',
    portal: 'console.cloud.google.com → Credentials',
    need: 'FIRST TEST',
    status: 'READY',
    note: 'Sign-in · Testing audience',
  },
  {
    api: 'Stripe',
    portal: 'dashboard.stripe.com/test/apikeys',
    need: 'PAY TEST',
    status: 'READY',
    note: 'Checkout · webhook · VisaGuide/RoadAngel acct',
  },
  {
    api: 'Binance / Bybit',
    portal: 'Exchange → API Management',
    need: 'LATER',
    status: 'WAIT',
    note: 'Live execute · paper desk for now',
  },
  {
    api: 'Alchemy / Moralis',
    portal: 'dashboard.alchemy.com · moralis.io',
    need: 'LATER',
    status: 'WAIT',
    note: 'Eyes Boat live feeds · paper scan OK',
  },
  {
    api: 'VPS / DNS',
    portal: 'Host panel · DNS for f.reelstorm.uk',
    need: 'LATER',
    status: 'WAIT',
    note: 'nginx/PM2 ready · Cloudflare A for f.reelstorm.uk still missing',
  },
];

const OVERALL = Math.round(
  MODULES.reduce((a, m) => a + m.score, 0) / MODULES.length,
);

function statusColor(s: ModuleScore['state'] | PhaseRow['status']) {
  const key = String(s).toLowerCase();
  if (key === 'ready') return colors.ready;
  if (key === 'wait') return colors.waiting;
  return colors.danger;
}

export default function ScorecardPage() {
  const { width } = useWindowDimensions();
  const [shown, setShown] = useState(0);
  const colWidth: `${number}%` = width >= 720 ? '48%' : '100%';

  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      n += 3;
      if (n >= OVERALL) {
        setShown(OVERALL);
        clearInterval(id);
        return;
      }
      setShown(n);
    }, 24);
    return () => clearInterval(id);
  }, []);

  return (
    <MarketingShell>
      <Text style={styles.kicker}>ARTIFACT · WEB VIEW</Text>
      <Text style={styles.brand}>
        Trad<Text style={styles.brandGold}>Flow</Text> Score Card
      </Text>
      <Text style={styles.stamp}>BUILD READINESS · OCT 2026 · LOCAL</Text>

      <View style={styles.hero}>
        <View style={styles.ring}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.scoreNum}>{shown}</Text>
              <Text style={styles.scoreLabel}>OVERALL</Text>
            </View>
          </View>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>
            Assessment to Legacy — installed so far
          </Text>
          <Text style={styles.heroLead}>
            Weighted readiness across OS phases plus external APIs. First local
            test needs Supabase + Google only; Stripe is wired for pay test.
          </Text>
          <View style={styles.pills}>
            <Text style={[styles.pill, styles.pillReady]}>PHASE 0–7 LIVE</Text>
            <Text style={[styles.pill, styles.pillWait]}>DEPLOY OPEN</Text>
            <Text style={[styles.pill, styles.pillReady]}>2 APIs · FIRST TEST</Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        {MODULES.map((m) => (
          <View key={m.name} style={[styles.card, { width: colWidth }]}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>{m.name}</Text>
              <Text style={[styles.mark, { color: statusColor(m.state) }]}>
                {m.score}
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${m.score}%`,
                    backgroundColor:
                      m.state === 'ready' ? colors.ready : colors.gold,
                  },
                ]}
              />
            </View>
            <Text style={styles.meta}>{m.note}</Text>
          </View>
        ))}
      </View>

      <View style={styles.table}>
        <Text style={styles.tableHead}>PHASE BREAKDOWN</Text>
        {PHASES.map((p) => (
          <View key={p.phase} style={styles.row}>
            <Text style={styles.phase}>{p.phase}</Text>
            <Text style={[styles.status, { color: statusColor(p.status) }]}>
              {p.status}
            </Text>
            <Text style={styles.pts}>{p.pts}/100</Text>
            <Text style={styles.note}>{p.note}</Text>
          </View>
        ))}
      </View>

      <View style={styles.table}>
        <Text style={styles.tableHead}>
          EXTERNAL APIS · FIRST TEST NEEDS 2
        </Text>
        {EXTERNAL_APIS.map((a) => (
          <View key={a.api} style={styles.row}>
            <Text style={styles.phase}>{a.api}</Text>
            <Text style={[styles.status, { color: statusColor(a.status) }]}>
              {a.need}
            </Text>
            <Text style={[styles.pts, { color: statusColor(a.status) }]}>
              {a.status}
            </Text>
            <Text style={styles.note}>
              {a.portal}
              {'\n'}
              {a.note}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>
        Navy is the vault. Gold is the key. · Also:{' '}
        design/tradeflow-scorecard.html
      </Text>
    </MarketingShell>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  brand: {
    marginTop: 8,
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 36,
    color: colors.white,
    letterSpacing: -1,
  },
  brandGold: { color: colors.gold },
  stamp: {
    marginTop: 8,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
  },
  hero: {
    marginTop: 28,
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 22,
    alignItems: 'center',
  },
  ring: { alignItems: 'center', justifyContent: 'center' },
  ringOuter: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 10,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navyDeep,
  },
  ringInner: { alignItems: 'center' },
  scoreNum: {
    fontFamily: 'Montserrat_800ExtraBold',
    fontSize: 48,
    color: colors.white,
    lineHeight: 52,
  },
  scoreLabel: {
    marginTop: 4,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
  },
  heroCopy: { flex: 1, minWidth: 220 },
  heroTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 22,
    color: colors.white,
  },
  heroLead: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 23,
    color: colors.textMuted,
    maxWidth: 420,
  },
  pills: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.goldLight,
    overflow: 'hidden',
  },
  pillReady: { borderColor: 'rgba(61,220,151,0.45)', color: colors.ready },
  pillWait: { borderColor: 'rgba(212,175,55,0.45)', color: colors.waiting },
  grid: {
    marginTop: 22,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 4,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
  },
  cardTitle: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 15,
    color: colors.white,
  },
  mark: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 13,
    letterSpacing: 1,
  },
  barTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 6 },
  meta: {
    marginTop: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  table: {
    marginTop: 22,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.navyDeep,
    overflow: 'hidden',
  },
  tableHead: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gold,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 4,
  },
  phase: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: colors.white,
  },
  status: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    letterSpacing: 1,
  },
  pts: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: colors.goldLight,
  },
  note: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textMuted,
  },
  footer: {
    marginTop: 24,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textMuted,
  },
});
