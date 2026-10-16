# Motion guidelines (provisional)

> **Status: draft, from current usage.** This file describes what moves in the 18 flows today, organised by purpose,
> and which choice to make *for now* on a new screen. It will be replaced section by section when the real motion
> guidelines land: each section ends with a **Pending** line naming what that guideline has to decide. Until then,
> follow "Use for now"; where a ported flow does something else, the port is the spec for that flow only.
>
> Evidence: [`references/motion-usage.generated.md`](references/motion-usage.generated.md) (counts, refreshed by `npm run resources:build`,
> one flow: `node scripts/motion-usage.mjs --flow <id>`). Per interaction with file:line and source:
> [`references/motion-matrix.md`](references/motion-matrix.md). Values, recipes, reduced motion: [`references/motion.md`](references/motion.md). Not enforced yet
> (report only), unlike [`references/design-rules.md`](references/design-rules.md).

---

## 1. Opening a screen (the Navigator's job)

| How it opens | Today | Use for now |
|---|---|---|
| **Push** (`x 100% → 0`, page under drifts `−28%` and dims, 0.42s `easing.ios`) | 58 of 156 screens, by default, in 16 of 18 flows | every full screen reached by a tap |
| **Sheet** (`spring.sheet`, scrim 0.25s, drag to dismiss) | 41 of 156 screens (8 of 18 flows), all by default for `presentation: 'sheet'` | any bottom sheet; Origin layout for new ones |
| **Modal** (rises from the bottom, full screen) | 4 of 156 screens by default; 42 `presentation: 'modal'` in total | a full-screen task the user finishes or closes (address create, placing) |
| **Overlay** (`mb-overlay`, `noonone-overlay`) | 30 of 156 screens, membership and noonone only | only inside those two flows (bappzaar overlay ports) |
| **Fade** | 8 of 156 screens + 4 nav calls (account, address, cards, reviews) | swapping a state of the same place (signed-out, country, success) |
| **Search hand-off** (`slide-left` with `handoff.spring`, `results-fade`) | search → PLP only | anything that should feel like search → results |
| **None / custom** (`none`, `checkout-alpha`, `address-*`) | 1–3 of 156 screens each | don't reuse; they belong to their port |

A screen never animates its own entry: set `ScreenDef.transition` / `presentation`, or `{ transition }` on the call.

**Pending:** one push curve vs the hand-off spring for all pushes; when a fade replaces a push; whether overlays merge into the Origin sheet.

---

## 2. Press feedback

| Scale | Today | Meaning |
|---|---|---|
| 0.96 (`pressScale`, `Pressable` default) | most `Pressable`s (188 in 15 of 18 flows) | buttons, icons, chips: the default |
| 0.98 | 39 + 6 `whileTap` (10 of 18 flows) | wide rows and cards |
| 1 (no scale) | 36 (10 of 18 flows) | banners and tiles where bappzaar has no feedback (TouchableOpacity 0.7 opacity or none) |
| 0.97 · 0.99 · 0.95 · 0.9 · 0.85 | 1–11 each, ports | one-off port values |

**Use for now:** `Pressable` with no `scale` (0.96) for controls, `scale={0.98}` for rows / cards, `scale={1}` only when the reference has no feedback. Never a raw `whileTap` on a new element; a CTA is a `Button`.

**Pending:** the press scale set (is 0.98 vs 0.96 a rule by size?), opacity vs scale feedback, press timing (`spring.press` 500/30/0.6 today).

---

## 3. Content entering and leaving a screen

| Mechanism | Today | Typical values |
|---|---|---|
| `initial → animate` on mount | 160 uses, 16 of 18 flows | `y 12–20 → 0` + fade, 0.25–0.3s `easing.out`, or `handoff.spring` |
| `AnimatePresence` (mount / unmount, swaps) | 96 uses, 15 of 18 flows | exits shorter than entrances; `initial={false}` for values that change after mount |
| Recipes `Stagger` / `FadeIn` / `BlurSwap` / `SkeletonReveal` | 4 / 4 / 1 / 1: rarely used, most flows hand-roll the same thing | `Stagger` 35ms, spring 380/39 |

**Use for now:**
- After a push, content arrives with `supermall.reveal` (y 12 → 0, `ease.soft`, 30ms stagger, from 0.4s), as in motion.md "Which motion for which moment".
- A list enters with the `Stagger` recipe (first 8 items only, 35–60ms gaps) instead of a hand-written loop.
- Exits are faster than entrances and run bottom → top.

**Pending:** one entrance (reveal vs `easing.out` tween vs hand-off spring), the stagger gap and cap, the exit rule.

---

## 4. State changes inside a screen

| Change | Today | Use for now |
|---|---|---|
| Counter / badge / price changes | `AnimatePresence` keyed by value, `spring.bouncy` (orders, pdp, reviews) | the same; `CountUp` for totals |
| Toggle, segmented, tab indicator | `Switch`, `Segmented`, `TabBar` (shared), `layoutId` underline | the shared components |
| Selection (pill, payment row) | colour / border cross-fade, no movement | fill + border cross-fade, `supermall.ease.soft`, 0.26s; press dip `supermall.press` |
| Expand / collapse, reorder | `layout` / `layoutId` (18 uses, 10 of 18 flows), `spring.gentle` | `layout` with `spring.gentle`; transform, not height, for long lists |
| Drag (sheets, sliders, slide-to-pay) | `drag` / `useDragControls` (12, 9 of 18 flows) | the Navigator sheet; `SlideButton` for slide-to-pay |

**Pending:** the spring per kind of change (bouncy vs gentle vs press); whether layout animations are allowed on lists.

---

## 5. Loading

| Mechanism | Today | Use for now |
|---|---|---|
| `Skeleton` blocks → content | 98 uses, 9 of 18 flows | page and section loading; the skeleton fades after its content starts (`reveal.skeletonLag`) |
| `Spinner` | 32 uses, 9 of 18 flows | inside a control or an overlay only |
| `Button loading` | 2 (checkout) | any CTA that waits; the button keeps its size |
| CSS keyframe loaders (`catLoaderSweep`, `pdpAiShimmer`) | 3 `@keyframes` | ports only |

**Pending:** skeleton shimmer (kit 1.2s band vs the supermall 1.867s spec), minimum display time, spinner vs skeleton threshold.

---

## 6. Success and celebration

`Lottie` (26 uses, 11 of 18 flows: ATC check, order confirmed, box) and `Confetti`. **Use for now:** an existing Lottie from
`references/assets.md`, once per success, with a haptic `success`; never a looping celebration.

**Pending:** which moments earn a celebration; Lottie vs native motion.

---

## 7. Scroll-linked motion

`useScroll` / `useTransform` / scroll state (113 uses, 12 of 18 flows): headers collapse (home switcher at 100px, pdp
gallery pin, noonone header), floating pills fold (`NeedHelpButton`), tab bar hides. **Use for now:** the screen recipe
"Header that reacts to scroll" (`references/screen-recipes.md` §5) and `NeedHelpButton`; scroll state lives at the screen level
with the feed memoised under it.

**Pending:** collapse thresholds and curves (home uses 0.3s `[0.5,1,0.89,1]`), tab bar hide rule.

---

## 8. Ambient and autoplay

`setInterval` autoplay (21, 9 of 18 flows): banner carousels every 3s (0.45s `easing.out`), hero 4s, tickers 2.2–2.4s;
marquees and rAF loops (7: home, checkout, plp, returns). **Use for now:** 3s for carousels, pause on touch, stop under
reduced motion (`useReduceMotion()`), only while in view.

**Pending:** autoplay intervals, whether tickers stay, what may loop forever.

---

## 9. Haptics

Only orders, plp, reviews and search fire haptics (35 calls), one per beat, alongside a visible change
(`src/motion/haptics.ts`). **Use for now:** `tap` on a primary press, `success` on a completed action, nothing ambient.

**Pending:** the haptic map per moment, and whether every flow gets them.

---

## 10. Where the timing comes from

Flow code has **244** preset references and **276** raw timing literals; **102** of the raw literals equal an existing
preset (0.3s = `duration.medium` ×40+, 0.25s = `duration.base`, 0.15s = `duration.fast`, `[0.215,0.61,0.355,1]` =
`easing.out`). Most raw values sit in address, checkout, membership and noonone; the recently built flows (reviews,
orders, plp, search) are almost all presets. Springs are spread wide (15 distinct stiffness / damping pairs), and
`'easeInOut'` / `'linear'` and `[0.42,0,0.58,1]` stand in for the kit's own curves.

**Use for now:** `duration.*`, `easing.*`, `spring.*`, `tween()`, `handoff.*`, `supermall.*` from `src/motion/presets.ts`;
a value from a reference goes in the flow's `tokens.ts` with a comment naming its source; never a literal that equals a
preset (`node scripts/motion-usage.mjs --flow <id>` lists the literals).

**Pending:** the final duration / easing / spring scale (fewer steps?), then a `--check` like `lint:design` once it is
settled.

---

## 11. Reduced motion

Unchanged and already kit-wide (motion.md §7): movement drops, fades stay, autoplay stops, loaders pulse, Lotties hold
a frame. Every new `setInterval`, `animate()`, rAF loop or looping opacity checks `useReduceMotion()`.

---

## Questions for the real guidelines

1. One movement spring for the whole app (the hand-off spring) or separate push / content / sheet curves?
2. The duration scale: keep 0.1 / 0.15 / 0.25 / 0.3 / 0.45 / 0.6, or fewer steps?
3. Press feedback: scale by element size, or one scale plus opacity?
4. Entrance choreography: reveal-after-push everywhere, or only on landing pages?
5. Stagger gap and cap; exit order.
6. Skeleton shimmer timing and the skeleton → content hand-over.
7. Autoplay and ambient motion: intervals, and what may loop.
8. Haptics per moment.
