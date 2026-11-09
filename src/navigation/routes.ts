/** TradFlow OS routes — under /app (marketing owns public root) */
export const OS_ROUTES = [
  { href: '/app', title: 'Dashboard', subtitle: 'UPRM Home' },
  { href: '/app/onboarding', title: 'Onboarding', subtitle: 'Risk + keys' },
  { href: '/app/assessment', title: 'Assessment', subtitle: '68% GO' },
  { href: '/app/finance', title: 'Finance', subtitle: '£50 dish' },
  { href: '/app/connect', title: 'Connect', subtitle: 'Binance / Bybit' },
  { href: '/app/journey', title: 'Journey', subtitle: 'Mon–Fri Heart' },
  { href: '/app/simulator', title: 'Simulator', subtitle: '£5 fake' },
  { href: '/app/commonwealth', title: 'Commonwealth', subtitle: 'EliteFlow' },
  { href: '/app/intelligence', title: 'Intelligence', subtitle: '100 wallets' },
  { href: '/app/execute', title: 'Execute', subtitle: '£7/day' },
  { href: '/app/discipline', title: 'Discipline', subtitle: 'Tilt lock' },
  { href: '/app/guardian', title: 'Guardian', subtitle: '8 / 15 / 25' },
  { href: '/app/legacy', title: 'Legacy', subtitle: '40/30/20/10' },
  { href: '/app/uprm', title: 'UPRM', subtitle: 'Journey memory' },
  { href: '/app/portfolio', title: 'Portfolio', subtitle: 'Positions' },
  { href: '/app/recoup', title: 'Recoup', subtitle: '18-day' },
  { href: '/app/history', title: 'History', subtitle: 'Trades' },
  { href: '/app/settings', title: 'Settings', subtitle: 'Prefs' },
  { href: '/app/profile', title: 'Profile', subtitle: 'Account' },
] as const;

export const ADMIN_ROUTES = [
  { href: '/app/admin', title: 'Admin', subtitle: 'Dashboard' },
  { href: '/app/admin/tribe', title: 'Tribe', subtitle: 'Community' },
  { href: '/app/admin/elites', title: 'Elites', subtitle: '100 wallets' },
  { href: '/app/admin/nudges', title: 'Nudges', subtitle: 'UPRM' },
  { href: '/app/admin/billing', title: 'Billing', subtitle: 'Stripe' },
  { href: '/app/admin/support', title: 'Support', subtitle: 'Tickets' },
] as const;

/** Primary chrome nav — secondary links live in footer. */
export const MARKETING_NAV = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/commonwealth', label: 'Commonwealth' },
  { href: '/about', label: 'About' },
  { href: '/manifesto', label: 'Manifesto' },
  { href: '/assessment-demo', label: 'GO Demo' },
  { href: '/scorecard', label: 'Score Card' },
  { href: '/readiness', label: 'Readiness' },
  { href: '/legal', label: 'Legal' },
] as const;
