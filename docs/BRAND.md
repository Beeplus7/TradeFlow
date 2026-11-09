# TradFlow — Brand System v1.0

Source: `docs/source-artifacts/tradeflow-brand.html`  
Applies to marketing, OS app, mobile, and admin.

---

## Position

**TradeFlow OS** — disciplined trading operating system.  
Not signals. Not hype. Process installed.

**Promise:** £50 In → Smile Out · Flow as One  
**Origin:** Oldham · Commonwealth · UPRM  
**Aesthetic line:** Goldman Sachs discipline + Apple restraint — nothing trendy.

---

## Taglines

| Tier | Line | Use | Tone |
|---|---|---|---|
| **Primary** | TRADE. TRACK. ANALYZE. GROW. | Hero, loading, onboarding | Disciplined / Institutional |
| **Secondary** | £50 In. Smile Out. | Social, merch, community | Friendly / Gritty / Memorable |
| **Tertiary** | Assessment to Legacy. On Flow. | Long-form, pitch, docs | Aspirational / Trustworthy |
| **OS** | YOUR TRADING JOURNEY. ALL IN ONE OS. | Product chrome | Institutional |
| **Proof** | Not learned. It's **installed.** | Closing / manifesto | Confident |

---

## Logo anatomy

| Element | Meaning |
|---|---|
| **TF monogram** | Compact lockup. Institutional. Reads from 16px app icon to billboard. **Sans only** — no serif. |
| **Upward arrow** | Three bars = disciplined ascent. Every trade earns the next. |
| **Bar chart** | Market truth. Unequal bars = realistic equity curve, not fantasy. |
| **Circle = Flow Chain** | OS enclosure. Enter Assessment → exit Legacy. Closed system, open future. |

---

## Color palette

> **Navy is the vault. Gold is the key.**

| Name | Hex | Role |
|---|---|---|
| **Trade Navy** | `#0A1931` | Primary background · authority |
| **Deep Navy** | `#060E1F` | Footer / deepest surface |
| **Navy Lift** | `#0C1F3F` / `#0E2447` | Hover / elevated panels |
| **Flow Gold** | `#D4AF37` | Primary accent · premium |
| **Gold Light** | `#C9A86A` | Secondary warmth · soft gold text |
| **Pure White** | `#FFFFFF` | Text · clarity |
| **Charcoal** | `#1E293B` | UI depth · borders / muted panels |

**Contrast:** WCAG AA ≈ 4.8:1 gold on navy.  
**Selection:** gold wash on navy.  
**Do not** introduce purple gradients, cream newspaper looks, or neon glow as brand defaults.

### CSS variables (canonical)

```css
:root {
  --navy: #0A1931;
  --navy-deep: #060E1F;
  --navy-lift: #0E2447;
  --gold: #D4AF37;
  --gold-light: #C9A86A;
  --paper: #FFFFFF;
  --charcoal: #1E293B;
  --line: rgba(255, 255, 255, 0.1);
  --muted: rgba(255, 255, 255, 0.5);
}
```

---

## Typography

| Role | Family | Weights | Use |
|---|---|---|---|
| **Display / UI bold** | **Montserrat** | 600 / 700 / 800 | Headlines, brand lockups, CTAs |
| **Body** | **Inter** | 300 / 400 / 500 / 600 | Body, UI labels, long copy |
| **Mono** | **JetBrains Mono** | 400 | Caps labels, meters, console, prices |

Tracking: display headlines tight (`-0.03em`–`-0.04em`); mono labels wide (`0.18em`–`0.3em`).

---

## Voice

**Friendly. Disciplined.** · UPRM heartbeat.

Speak like a funded trader from Oldham who made it — **no London fluff, no Vegas hype.** Direct, warm, accountable.

### Rules

- Process > prediction  
- Commonwealth > competition  
- Legacy > lifestyle  

### Do

- Short sentences. Concrete numbers (£7/day, 68% GO, 8/15/25).
- “Must-complete”, “locked red”, “Smile Out”.
- Risk honesty (FCA: software license, not fund manager).

### Don’t

- Signal-seller hype, rocket emojis, “guaranteed returns”.
- Generic fintech purple / glassmorphism glow as brand identity.

---

## 12 Engines (Core OS)

One Flow. Twelve engines.

| # | Engine | Essence |
|---|---|---|
| 01 | Mindset | Psychology |
| 02 | Risk | Preservation |
| 03 | Strategy | Edge |
| 04 | Backtest | Proof |
| 05 | Journal | Reflection |
| 06 | Analytics | Insight |
| 07 | Funding | Capital |
| 08 | Growth | Scale |
| 09 | Community | Commonwealth |
| 10 | Mentor | Guidance |
| 11 | Legacy | Wealth |
| 12 | Flow State | Mastery |

---

## Applications checklist

- [ ] App icon / monogram at 16–1024px  
- [ ] Marketing hero (70% design effort) uses navy vault + gold key + Motion  
- [ ] OS chrome: Montserrat headers, Inter body, JetBrains mono meters  
- [ ] Guardian / Legacy / GO meter visuals use gold accents on navy  
- [ ] Legal + risk copy matches voice (disciplined, not salesy)  
- [ ] Merch / social can use secondary tagline £50 In. Smile Out.
