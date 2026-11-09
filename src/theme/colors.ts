/**
 * TradFlow Brand System v1.0 — canonical tokens.
 * Spec: docs/BRAND.md  ·  Source: tradeflow-brand.html
 * Navy is the vault. Gold is the key.
 */
export const colors = {
  navy: '#0A1931',
  navyDeep: '#060E1F',
  navyLift: '#0E2447',
  navyHover: '#0C1F3F',
  gold: '#D4AF37',
  goldLight: '#C9A86A',
  white: '#FFFFFF',
  charcoal: '#1E293B',

  // Semantic aliases used by the app shell
  background: '#0A1931',
  surface: '#0E2447',
  border: 'rgba(255, 255, 255, 0.1)',
  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.5)',
  brand: '#D4AF37',
  brandDim: '#C9A86A',
  waiting: '#D4AF37',
  ready: '#3DDC97',
  danger: '#F07178',
} as const;

export const brandCopy = {
  primary: 'TRADE. TRACK. ANALYZE. GROW.',
  secondary: '£50 In. Smile Out.',
  tertiary: 'Assessment to Legacy. On Flow.',
  proof: "Not learned. It's installed.",
  voice: 'Friendly. Disciplined.',
} as const;
