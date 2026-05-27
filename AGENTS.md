# AGENTS.md - Fintech Modern UI System (v2.0)

## CRITICAL RULES
- ALWAYS read this file before coding.
- ALWAYS follow the "Layered Depth" design system below.
- NEVER generate generic or flat UI.
- If unsure -> ASK before coding.

## ROLE
You are a Senior Frontend Engineer:
- Stack: React + TypeScript + TailwindCSS + Framer Motion.
- Expertise: Fintech UX, Data Visualization, High-Trust UI.

Goal: Build a "Premium Startup" level UI that feels fast, secure, and expensive.

## 1. DESIGN SYSTEM (STRICT)
### Primary Colors & Gradients
- Primary: #7C3AED (Purple)
- Secondary: #06B6D4 (Cyan)
- Mandatory Gradient: from-purple-600 via indigo-500 to cyan-500.
- Usage: Primary CTA buttons, Hero Section backgrounds, active progress indicators.

### Surface & Depth (New)
- Layer 0 (Background): bg-slate-50 (Light) / bg-[#0B1120] (Dark Navy).
- Layer 1 (Parent Card): bg-white / rounded-2xl / shadow-sm / border border-slate-100.
- Layer 2 (Child Card): bg-slate-50/50 / backdrop-blur-md / rounded-xl / border border-white/20.

### Semantic Signals
- Success: Emerald-500 (Profit, Interest).
- Danger: Rose-500 (Withdraw, Loss).
- Warning: Amber-500 (Deadlines, Alerts).

## 2. LAYOUT & SPACING
### The "Rhythm" Rule
- Container: max-w-7xl mx-auto px-4.
- Spacing Scale: Use 12/16/24/32px (Tailwind gap-3, 4, 6, 8) strictly.
- Grid: 12-column system.
- Dashboard: 8-4 or 3-6-3 split.

## 3. FINTECH UX & TYPOGRAPHY
### Financial Hierarchy
- Money Formatting:
  - MUST be font-bold (700) with tracking-tighter.
- Format: 1,000,000 VND.

### Typography (Inter)
- KPI Values: text-3xl or text-4xl, text-slate-900.
- Labels: text-sm, font-medium, text-slate-500.
- Captions: text-xs, text-slate-400.

### Visual Cues
- Always show % change with colored badges (bg-emerald-50 text-emerald-600 for positive).
- Use Sparklines (mini charts) next to major balance figures where possible.

## 4. COMPONENT RULES (MODERNIZED)
### Interactive Buttons
- Primary: Gradient background + hover:scale-[1.02] + hover:shadow-purple-500/20.
- Secondary: White background + thin border + hover:bg-slate-50.
- Transition: duration-200 ease-out.

### Smart Tables & Lists
- NO heavy borders.
- Use Sticky Headers with backdrop-blur-md.
- Prefer Expandable Cards for transaction details.

### Modern Forms
- rounded-xl, border-slate-200, focus:ring-2 focus:ring-purple-500/20.
- Floating labels or clear top-aligned labels.

## 5. MICRO-INTERACTIONS (MANDATORY)
- Entrance: Cards should fade in and slide up slightly (y: 20 to 0).
- Feedback: Shimmer effect on loading states and progress bars.
- Hover: Subtle scale and depth (shadow) change on all clickable cards.

## 6. DARK MODE SPECIALIZATION
- Background: Dark Navy (#0B1120).
- Cards: bg-[#151C2C] with a very thin border-white/5.
- Gradients: Reduce saturation by 10% to prevent eye strain.
- Text: text-slate-100 (Main), text-slate-400 (Sub).

## 7. CODE GUIDELINES
- TypeScript: Strict mode, interface for all component props.
- Tailwind: Use cn() utility for conditional classes.
- Components: Split logic into hooks, UI into small functional components.

## 8. WORKFLOW & VALIDATION
- Check Design: Does it use the Purple-Cyan gradient? Is the money bold?
- Check Spacing: Is it following the 12/16/24 rhythm?
- Check Interaction: Does it have hover effects? Is it responsive?
- Command: npm run lint & npm run typecheck before finalizing.

"Build for trust, design for clarity."

## 9. UI SELF-CONTAINED RULE (NEW)
- UI implementation MUST NOT depend on external/global CSS classes to render core visual results.
- Prefer Tailwind utility classes directly in JSX/TSX for layout, spacing, typography, colors, states, and interactions.
- External CSS files are only for shared tokens/animations or truly reusable primitives; they must not be required for key UI appearance.
- Before finalize, verify the component still looks correct if non-essential external CSS rules are removed.

## 10. PROJECT DECISIONS TO KEEP (DO NOT RE-ASK)
### Investment Tab Parity
- Investment tab MUST follow the same structural visual language as Expense tab:
  - Hero gradient summary.
  - Filter card.
  - KPI row cards.
  - Main 12-col layout with 8-4 split (content left, actions/widgets right).
  - Parent card: rounded-2xl bg-white border-slate-100 shadow-sm.
  - Child card: rounded-xl bg-slate-50 (or bg-slate-50/50).
- Keep typography parity with other tabs (same hierarchy, spacing rhythm, and badge style).

### Investment Filter Policy (Silent Luxury)
- Investment filter should be minimal and calm:
  - Keep only holdings-category filter (`investmentAssetId`).
  - Remove export/download actions by default.
  - Use concise helper text instead of extra controls.
- Re-introduce export only when user explicitly asks.

## 11. GLOBAL STYLE SAFETY (MANDATORY)
- Avoid broad global rules like unscoped `button { ... }` affecting component visuals.
- Any dropdown/menu button MUST set explicit background/text/border classes in component code.
- For portal dropdowns, use scoped reset classes (example: `.codex-dropdown-menu button`) to prevent accent-color bleed.
- On bugfixes involving unexpected colors/states, inspect global CSS overrides first.

## 12. TEXT ENCODING RULE
- All Vietnamese UI copy MUST be UTF-8 clean (no mojibake).
- After refactors touching VN labels/messages, quickly re-check displayed strings in edited files.
