# R&R 2.0 → noon flow kit mapping

Source of truth: repo **vbirla789/R-R-2.0-with-checkbox** @ `ab185b3` (CRA + framer-motion) — `src/tokens/{colours,motion,typography}.ts`,
`src/components/{Keyboard,motion}.tsx`, `src/assets/icons.ts`, `src/screens/*` — and Figma **`KzR8dy12uT8CtgBRHHY6Qx`** "R&R 2.0"
(nodes per screen in `index.ts`). Read the tables as *repo value → kit token*. `reviews*` = flow token in `tokens*.ts`.

## 1. Colours (`src/tokens/colours.ts`)

Watch the name shift: the repo's `secondary / tertiary / muted` text are the kit's `textMuted / textSecondary / textTertiary`.

| Repo token | Value | Kit token |
|---|---|---|
| `text-n-icon.primary` | `#1d2539` | `--nk-color-text-primary` |
| `text-n-icon.secondary` | `#475067` | `--nk-color-text-muted` |
| `text-n-icon.tertiary` | `#666d85` | `--nk-color-text-secondary` |
| `text-n-icon.muted` | `#989fb3` | `--nk-color-text-tertiary` |
| `text-n-icon.action` | `#0f61ff` | `--nk-color-primary` |
| `text-n-icon.error` | `#d92626` | `--nk-palette-danger-red` (kit `danger` is `#DE1C1C`) |
| `text-n-icon.warning` | `#e5641a` | `--nk-palette-sunset-orange` |
| `text-n-icon.success` | `#0f8857` | `--nk-color-success` (stars: `--nk-color-rating`) |
| `text-n-icon.on-surface-bold` | `#ffffff` | `--nk-color-text-inverse` |
| `surface.primary` | `#ffffff` | `--nk-color-bg-surface` |
| `surface.secondary` | `#f9f9fb` | `--nk-color-bg-subtle` (also this flow's `bgPage`) |
| `surface.tertiary` | `#f2f3f7` | `--nk-palette-anti-flash-white` (kit `bgPage` value) |
| `surface.muted` | `#eaecf0` | `--nk-color-border` (fill: kit disabled button bg) |
| `surface.action-subtle` | `#ebf4ff` | `--nk-color-bg-info` |
| `surface.action-bold` | `#0f7eff` | `--nk-color-primary-bright` |
| `surface.error-subtle` / `error-bold` | `#fff0f0` / `#d92626` | `--nk-color-danger-surface` / `--nk-palette-danger-red` |
| `surface.success-subtle` / `success-bold` | `#e3fcf2` / `#0f8857` | `--nk-color-success-surface` / `--nk-color-success` |
| `border.white` / `subtle` / `primary` / `medium` | `#fff` / `#f2f3f7` / `#eaecf0` / `#d0d4dd` | `bgSurface` / `--nk-color-border-subtle` / `--nk-color-border` / `--nk-color-border-strong` |
| `border.action` / `action-bold` / `success` | `#bddbff` / `#0f61ff` / `#adf0d5` | `--nk-color-border-info` / `--nk-color-primary` / `--nk-palette-pale-mint` |
| `screenBg` | `linear-gradient(to bottom, #eaecf0, #f9f9fb)` | `reviewsPage` (palette vars) → `<Screen background="reviewsPage">` |
| `screenBgSolid` | `#f9f9fb` | flow `bgPage` override |
| CTA fill (inline) | `#101628` | `--nk-color-text-strong`; kit `Button variant="dark"` re-pointed (`button.darkBg`) |
| chip selected border | `#101628` | `--nk-color-text-strong` |
| image hairline | `#ececec` | snapped → `--nk-color-border` |
| past-order "Next" border | `#d6e9ff` | `--nk-color-pill-selected-border` (`button.outlineBorder`) |
| ReviewDraft A link | `#0057ff` | `--nk-color-brand-blue` |
| scrims | `rgba(14,14,14,.45)` / `rgba(16,22,40,.45)` | `--nk-palette-primary-alpha45` / `reviewsScrim` |
| shadows `rgba(0,0,0,.04 / .12)` | — | `--nk-palette-black-alpha4` / `black-alpha12` inside `reviewsCard`, `reviewsDeckCard`, `reviewsPolaroid`, `reviewsSheet`, `reviewsFloat`, `reviewsTopSheet` |
| knob shadow `rgba(14,14,14,.07)` | — | `reviewsKnob` |
| white sweep `rgba(255,255,255,.8)` | — | `--nk-palette-white-alpha80` |
| AI track `#ff9a3d → #e34ba9 → #7b5cff` | — | `reviewsAiOrange/Pink/Violet`, `reviewsAiTrack` |
| sparkle / crafting `#8b3ff0`, `#e34ba9`, lines `#f7d6ec → #e7d6fb` | — | `reviewsAiPurple`, `reviewsAiLabel`, `reviewsCraftFrom/To`, `reviewsCraftLine`, `reviewsCraftSweep` |
| AI loader `#7c3aed`, bloom stops | — | `reviewsAiInk`, `reviewsBloom1..4`, `reviewsBloom` |
| warning badge `#f5a623` | — | `reviewsWarning` |
| ring track `#e2e5eb` | — | `reviewsRingTrack` |
| frosted scrim `rgba(249,249,251,.3)` · row press `rgba(29,37,57,.04)` · glass card `rgba(255,255,255,.88)` | — | `reviewsFrost` · `reviewsRowPress` · `reviewsGlass` |
| keyboard `#d4d8de` `#1c1c1e` `#3a3a3c` `#595959` `#0088ff` | iOS system | `reviewsKbBed`, `reviewsKbGlyph`, `reviewsKbIcon`, `reviewsKbAux`, `reviewsKbReturn` |
| 40px circle border (`border.subtle`) | `#f2f3f7` | `iconButton.outlineBorder` → `borderSubtle` (flow override) |

## 2. Typography (`src/tokens/typography.ts` = Noontree weights; sizes inline)

Letter-spacing (−0.1 … −0.26) is dropped (tokens.md). Family is always `var(--nk-font-family)`.

| Repo (weight size/line) | Used for | Kit type |
|---|---|---|
| 600 16/24 | header product name | `reviewsText16SemiboldLh24` |
| 700 16/24 | "Add photos", "Your review" | `reviewsText16BoldLh24` |
| 700 16/22 | chip group titles | `section` |
| 700 16/20 | checkbox card title, sheet title | `text16BoldLh20` |
| 600 16/22 | "Rate your past orders" | `text16SemiboldLh22` |
| 500 16/24 | manual / optional textarea | `reviewsText16MediumLh24` |
| 600 16/24, 700 16/18 | CTAs | kit `Button size="lg"` (`text16SemiboldLh20`) |
| 400 15/22 | generated draft | `reviewsText15RegularLh22` |
| 500 15/22 | note field | `reviewsText15MediumLh22` |
| 600 15/20 | "Crafting your draft", "Stop processing" | `text15SemiboldLh20` |
| 500 15/20 | loader label | `bodyMedium` |
| 700 15/20 | sheet buttons | `reviewsText15BoldLh20` |
| 600 14/20 | chips, "Write with AI", Tell us more | `text14SemiboldLh20` |
| 500 14/20 | checkbox labels, review A text, names | `reviewsText14MediumLh20` |
| 400 14/20 | subtitles, sheet body | `text14RegularLh20` |
| 600 13/16 | draft action buttons | `text13SemiboldLh16` |
| 500 13/18 | review A attribution | `text13MediumLh18` |
| 600 13/18 | small "Save changes" | `text13SemiboldLh18` |
| 600 12/16 | pills (Hide Name / Edit review) | `captionBold` |
| 400 12/18 / 500 12/18 | "Written by", counters, hint | `text12RegularLh18` / `text12MediumLh18` |
| 500 11/14 | product strip names | `micro` |
| 700 18/24 | "Thanks for sharing", "Rewrite your review?" | `titleSmall` |
| 800 20/24 | "Thanks, you star!" | `reviewsText20ExtraboldLh24` |
| 400 22 (system) | keyboard keys | `reviewsKbKey` (Noontree) |

## 3. Motion (`src/tokens/motion.ts` → `reviewsMotion` in `tokens.motion.ts`)

| Repo | Value | Kit |
|---|---|---|
| `ease.out` | `[0.23, 1, 0.32, 1]` | `supermall.ease.soft` `[0.22, 1, 0.36, 1]` (`reviewsMotion.ease.out`) |
| `ease.inOut` | `[0.77, 0, 0.175, 1]` | kept — `reviewsMotion.ease.inOut` (AI bloom sweep only) |
| `ease.drawer` | `[0.32, 0.72, 0, 1]` | `easing.ios` |
| `spring.screen` + ScreenShell (x 100%, under −28%, 12% dim) | duration .5 bounce .16 | Navigator `push` transition (0.42s `easing.ios`, under −28%, brightness .92). Screens never animate their own entry |
| `spring.snappy` | duration .32 bounce 0 | kept — toggles, chip border, Tell us more unfold |
| `spring.gentle` | duration .5 bounce .12 | kept — list items, deck / slider moves, layout |
| `spring.bouncy` | duration .55 bounce .42 | kept — star pops, check badge |
| in-screen sheet spring | duration .5 bounce .14 | kept — `reviewsMotion.spring.sheet` (ReviewSheet). Kit `spring.sheet` only for nav sheets |
| fold spring | duration .45 bounce 0 | kept — `reviewsMotion.spring.fold` |
| `duration.press / fast / base / slow` | .13 / .18 / .24 / .3 | kept / kept / kept / `duration.medium` |
| `tap` / `tapStrong` | .97 / .94 | `Pressable` default `pressScale` .96 / `pill.pressScale` .94 |
| star tap | .82 (.8 at 32px) | `reviewsMotion.press.star / starLarge` |
| AI switch tap | .92 | `reviewsMotion.press.toggle` |
| `STAGGER`, StaggerGroup | 40ms + 50ms, y 12 | `reviewsMotion.stagger` (kit `Stagger` recipe is 35ms / spring 380/39 — not the same) |
| `FadeRise` | y 10, .3s ease.out | `<FadeIn y={10}>` (kit recipe, `duration.medium`) |
| blur cross-fade (every in-place swap) | blur 4, y ±6, `duration.base` ease.out | `reviewsMotion.swap` |
| chip select | border spring.snappy + colour .18s | kit selection cross-fade: `supermall.ease.soft`, `supermall.swap.fill` .26s |
| keyboard rise | height, .34s drawer | `reviewsMotion.keyboard` (`easing.ios`) |
| skeleton sweep / crafting sweep | 1.1s / 1.2s linear, 120ms apart | `reviewsMotion.skeletonSweep` / `craftSweep` (loaders: loops allowed) |
| timings | recompute 600ms, generate 2200, loader 2400 + 1300, bloom 1.1s, label .32, submitted backstop 2600 + advance 1500 | `reviewsMotion.timing.*` |
| deck | y [0, −8, −15], scale [1, .9, .8], throw −440 / −8°, swipe 90px / 500px/s, elastic .7 | `reviewsMotion.deck` |
| slider | 286 + 16 | `reviewsMotion.slider` |
| haptics | none in repo | `tick` on star change, `tap` on chips / buttons / switch (motion.md table) |

Transitions per screen: `rate`, `aiLoader`, `draft`, `draftB`, `new` = `push`; `submitted`, `pastOrders`, `deck`, `slider` = `fade`
(reached by `nav.reset` / `nav.replace` after a submit). Loader → draft = `nav.replace(…, { transition: 'fade' })`.

## 4. Components

| Repo | Kit / flow |
|---|---|
| `PressButton`, `PressDiv` | `Pressable`, `Button` |
| StatusBar, home indicator | phone frame (`--nk-inset-top/bottom`) — never drawn |
| PageHeader (40px circle back) / X header | `ReviewHeader` (kit icon-button tokens + Origin `chevron-left` / `cross`), or kit `Header variant="transparent"` |
| star rows (img data-URIs) | `StarRatingInput` (Origin `star` / `star-filled`) |
| SpringToggle + WriteWithAICard | `AiToggle` (central `Switch` at 42×24 / 20) |
| Chip / Chip36 / ChipGroup | `AttributeChips` (flow-local: central `Pill` can't do the selected label colour or fixed heights) |
| FieldCheckbox + CheckboxRow (ManualReview) | central `Checkbox` inside a `Pressable` row — screen-local in `rate` |
| ProductHeader / ReviewCardB header / docked product | `ReviewProductHeader` (`rate` / `compact` / `docked`) |
| DraftCard / ReviewCard / ReviewCardB | `DraftCard` (`inline` / `review` / `field`) + `CraftingShimmer`, `DraftAction`, `NameToggle` |
| AddPhotosCard (×4) | `AddPhotos` + `PhotoThumbs` |
| OptionalTextArea / ManualTextArea / note | `ReviewTextField` (`optional` / `large` / `note`, `surface="subtle"`) |
| ProgressSheet | `RewriteSheet` |
| EditReviewSheet / EditSheet | `EditReviewSheet` (`docked` / `floating`) on `ReviewSheet` |
| OrderCard (deck + slider) | `PastOrderCard` |
| KeyboardMockup | `MockKeyboard`, `KeyboardDock`, `applyKey` |
| Footer (transparent CTA bar) | `ReviewFooter` + `Button variant="dark" size="lg" block` |
| eye / sparkle / exclamation SVGs | `components/icons.tsx` (no Origin equivalent; `currentColor` / token fills) |
| camera, gallery, info, pencil, close, back, check, mic | Origin `camera`, `gallery`, `info-circle`, `edit`, `cross`, `chevron-left`, `check-circle-filled`, `mic` |

## 5. Assets (`public/` → `src/assets/reviews/`, see `assets.ts`)

PNG → webp ≤ 900px long edge, then `node scripts/optimize-assets.mjs src/assets/reviews`. `stars-loading.lottie` and
`review-success.lottie` copied as is (they differ from the kit's `starLoading` / `reviewCheck`) and passed via `<Lottie src>`.
Not copied: `orders/active1.png`, `orders/active2.png` (= `pastorder-1.png`), `orders/airpods.png` (repo order list only), favicon / logos.

## 6. Documented exceptions

- `ReviewSheet` / `RewriteSheet` / `EditReviewSheet` are in-screen overlays (own scrim + spring), not `nav.sheet` routes: their
  content is the screen's live state (pending pick, the draft being edited) — same pattern as returns' `ReturnsOverlay`.
- `KeyboardDock` animates `height` (one element, must re-lay out so the CTA rises with it), as the repo does.
- `AttributeChip` animates border / label colour with motion using `palette` values (motion can't tween `var()` colours).
