# Component selection and token checklist

Run this in stage E (`references/design-workflow.md`) for every section of the design, and again before stage G. The rules behind it are in `references/components.md` and `references/tokens.md`; this is the short version you tick off.

## 1. Find before you build

- [ ] `node scripts/design-context.mjs <words…>` for each part (e.g. `rating stars`, `bottom sheet`, `stepper`): shared components with props, flow-local components, tokens, icons, assets, motion, closest screens.
- [ ] Shared component fits → use it with its real props (`references/component-api.generated.md`).
- [ ] Shared component almost fits → use it; if a prop is missing, report the gap rather than wrapping or copying it.
- [ ] Another flow's local component fits → don't copy it; reuse it if the import is clean, otherwise note it as a promotion candidate (`references/components.md` → "Duplicates and promotion").
- [ ] Nothing fits → build it flow-local in `src/flows/<flow>/components/`, composed from shared parts, tokens only. Promote to `src/components` only after the reuse and API review.

## 2. Map every value to a token

Pick by role first ([`references/design-rules.md`](references/design-rules.md): colour per role, gutter 12 / 15 / 16 by job, card r16 padding 12, gap 8 / 4 / 12), then look the token up.

- [ ] Colours: `var(--nk-color-*)` / `--nk-palette-*`, `ref.color()`; no new hex in components or flow CSS/TSX (`scripts/token-map.json` maps a literal to its token).
- [ ] Type: `var(--nk-type-*)` or `<Text variant>`; no raw `font:` / `font-size`.
- [ ] Space, radius, shadow, layout: `--nk-space-*`, `--nk-radius-*`, `--nk-shadow-*`, `--nk-layout-*`.
- [ ] Motion: presets and recipes from `src/motion` (`references/motion.md`), not ad-hoc springs or keyframes.
- [ ] A value with no token goes in the flow's `tokens.ts` with a comment naming its source. Geometry that must stay literal gets `// token-lint-ignore — <reason>`.

## 3. Icons and assets

- [ ] System icons: `<OriginIcon name>` from `references/icons.md` (outline default, `filled` for selected). No lucide, heroicons, Material or other icon sets, and no hand-drawn SVG when an Origin icon exists.
- [ ] Images, logos, Lotties: from `references/assets.md`; new ones in `src/assets/<flow>/` at ~3×, never hotlinked.

## 4. Don't invent a second design system

- [ ] No shadcn / Radix / MUI / Chakra / Tailwind components or classes, no generic "AI" card styles, no styling copied from a Mobbin reference.
- [ ] Prices use the dirham sign `currency`, never "AED".
- [ ] Every screen in `<Screen>`; navigation only through `useNav()`.
- [ ] A new sheet uses the Origin M-BottomSheet (no `sheet` field; `<SheetHeader>` / `<SheetBody>` / `<SheetFooter>`). Existing sheets stay `sheet: 'classic'` and keep their UI (`scripts/sheet-baseline.json`).

## 5. Check before you hand over

- [ ] `npm run lint:tokens -- -v src/flows/<flow>`: no new findings in the files you touched.
- [ ] `node scripts/check-duplicates.mjs src/flows/<flow>`: no new duplicate you could have reused.
- [ ] `npm run skill:check`: component props, motion names, asset paths and routes in the docs you touched exist.
- [ ] The design guard hook didn't report anything you left unfixed.
