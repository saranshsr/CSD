---
name: noon-ui
description: Build noon app screens and whole clickable flows with the @noon/flow-kit UI kit — noon design tokens, central components, assets, motion and the ready-made flows ported from the real noon app. Use this whenever someone asks to build, design, prototype, mock or restyle any noon page, screen or flow ("build a loyalty page", "make a referral screen", "new checkout step", "update orders to match this screenshot"), or shares a reference (Figma, screenshot, competitor app, sketch) to rebuild in noon's design language, even if they never say "flow kit". It routes to a screen skill (/home-page, /search, /cart, /checkout, /pdp, /orders, /returns, /reviews, /account, /noon-one) when one exists. Works inside the flow-kit repo (one folder per flow in src/flows).
---

<!-- planned: pdp/oos, home/campaign -->

# noon UI

This skill turns "I want to build a <flow> page" into a finished, clickable noon flow in this repo: every screen wrapped in `Screen`, styled only with `--nk-*` tokens, built from the central components and real assets, moving with the kit's transitions and recipes, registered at a URL in the dev preview, and checked visually. When the user shares a reference, you take its **structure and intent** and rebuild it in noon's language; you never copy its colours, fonts or spacing.

The kit ships a catalogue of flows and screens ported 1:1 from bappzaar (the noon React Native app) and the noon Figma files. The exact counts, and which flows have a spec, a brief or only a blueprint, are in the generated `.claude/resources/inventory.md` (`npm run resources:build`); that file is authoritative, so quote it instead of typing numbers. The flows are the quality bar and your first source: open the closest flow before you write anything.

## How the skills fit together

```
USER REQUEST
     │
     ▼
noon-ui  (this skill: classify, route, house rules)
     │
     ├───────────────► DESIGN SYSTEM  references/tokens.md · components.md · icons.md · assets.md · motion.md
     │                       │
     ▼                       │
SCREEN SKILL  /home-page /search /cart /checkout /pdp /orders /returns /reviews /account /noon-one
             (or the blueprints in references/flows.md)
     │                       │
     ▼                       │
FLOW SPECIFICATION  <skill>/spec.md — screens, sections, data, routes, design source, acceptance
     │                       │
     └──────────┬────────────┘
                ▼
EXISTING CODEBASE  src/flows/<flow> · src/components · src/foundations · src/motion · src/assets
                ▼
GENERATED INTERFACE  new / changed screens, registered in src/flows/index.ts + src/kit/routes.ts
                ▼
VISUAL VALIDATION  references/verify.md · scripts/snap.mjs · read every PNG against the spec
```

### Screen skills

| Invoke | Builds | Flow in code | Spec |
|---|---|---|---|
| `/home-page` | The home feed and campaign landing pages (Homepage Revamp 2025) | `src/flows/home` | `../home-page/spec.md` |
| `/search` | Search entry, recent / trending, suggestions, hand-off to results | `src/flows/search` (+ `plp`) | `../search/spec.md` |
| `/cart` | Cart with shipment groups, carousels, coupon, payment offers, states | `src/flows/cart` | `../cart/spec.md` |
| `/checkout` | Checkout sections, payment methods, slide to pay, confirmation | `src/flows/checkout` | `../checkout/spec.md` |
| `/pdp` | Product detail page, its sheets and out-of-stock / newer-model states | `src/flows/pdp` | `../pdp/spec.md` |
| `/orders` | Orders list, order tracking (per-state content, V1–V4 hero), all-updates sheet, cancel items | `src/flows/orders` | `../orders/spec.md` |
| `/returns` | Returns history, returnable items, return submission, summary and return details | `src/flows/returns` | `../returns/spec.md` |
| `/reviews` | Ratings & reviews (R&R 2.0): rate, AI draft, write a review, submitted, rate past orders | `src/flows/reviews` | `../reviews/spec.md` |
| `/account` | Account hub, profile, settings and security sheets, sign in / out | `src/flows/account` | `../account/spec.md` |
| `/noon-one` | noon One acquisition: entry points, landing (member / non-member), plans, payment, success; hands management to `membership` | `src/flows/noonone` | `../noon-one/spec.md` |

Invoke one by typing it (`/home-page build a Ramadan campaign home`), or just describe the page: Claude loads the matching screen skill by its description. Each screen skill follows this skill's workflow and house rules and adds its own spec, sources and checks. For any other page (membership management, wishlist, deals, categories, address, cards, and composed pages such as loyalty or onboarding), use the catalogue and blueprints in `references/flows.md` plus the flow's brief in `.claude/resources/flows/`; when one of those grows a spec, give it a screen skill (see "Adding a screen skill"). Which flows have which is listed in `.claude/resources/inventory.md` → Flows → Coverage.

## The one idea that matters

**Compose, don't invent.** A noon screen is the same few parts arranged for a purpose: `Screen` + a header + sections of cards, rows, rails and grids + a sticky footer `Button`, all on tokens. A screen looks off-brand for three reasons, all seen in practice:

- **New primitives.** A hand-rolled button, price, pill or row instead of `Button`, `Price`, `Pill`, `ListRow`, or a flow-local component another flow already has.
- **Raw values.** A hex colour, a `font:` shorthand or a 13px radius instead of `var(--nk-color-*)`, `var(--nk-type-*)`, `var(--nk-radius-*)`.
- **Ad-hoc motion.** A CSS keyframe or a one-off spring instead of a registered transition, a recipe or a motion preset.

The fix is the same each time: find the kit piece that already does it. UI elements (pills, chips, tabs, toggles, badges, buttons, cards, sheets) come only from the kit's design languages (Origin, the noon Figma revamps, the bappzaar ports; `references/design-rules.md` §0), matched to the host screen. Never invent a new one unless the user explicitly asks; if nothing fits, name the closest one and ask.

## Workflow

Work in this order. Write the plan before any code; most of the quality is decided there.

**Size the request first** (`references/design-workflow.md`). A small change (copy, a token, one component) goes straight to step 4. A new screen, a redesign or an open-ended idea runs the research-first stages: steps 1–3 become **A Understand → B Research** (repo first, then Mobbin per `references/research.md`; if Mobbin isn't connected, say so and continue from repo patterns) **→ C Ideate → D Clarify** (ask only what blocks the build) **→ E Design direction** (for a large request, `src/flows/<flow>/DESIGN.md` from `templates/DESIGN.md`); steps 4–8 are **F Implement** and step 9 is **G Validate**. Mobbin is a research reference, never the source of truth: take structure and interaction, never another product's branding, colours, icons or styling. Report progress at real stage changes only (`references/progress-messages.md`).

1. **Classify and route.** Tell the user in one line what you'll build:
   - **Screen**: one new or changed screen in an existing flow.
   - **Flow**: a new flow of 2–8 screens (e.g. loyalty: hub → tiers → rewards → reward sheet → history).
   - **Restyle from reference**: an existing flow updated to match a shared reference (`references/from-reference.md`).
   If a screen skill covers the page, load it and follow its spec. Build without asking unless the request is ambiguous about *which* flow or *what the user does* on it; make reasonable assumptions and list them at the end.
2. **Retrieve before you read.** Run `npm run brain -- context "<the request>"`: it names the product area, the closest screens, the minimum reading list (flow card, spec / brief line ranges, screen module, each with a size), what to reuse, the tests, and the request words nothing in the kit matches (the gaps to research or ask about). Read `.claude/resources/brain/INDEX.md` → the flow card in `.claude/resources/brain/flows/` → only the files it names; `npm run brain -- deps <flow/screen>` gives the component chain. The retrieval workflow is `.claude/resources/brain/README.md`. Then **read the existing code** it points to. `references/flows.md` has the catalogue and blueprints. Open the closest flow's `index.ts`, main `*Screen.tsx`, `data.ts`, `tokens.ts`, `components/` and any `MAPPING.md` / `FIGMA-MAPPING.md`. Reuse its sections, flow-local components and patterns.
3. **Write the flow specification.** For each screen: id, title, URL path, presentation (push / sheet / modal / tab), header, sections top to bottom with the component for each, footer, data, states (empty, loading, error), and how the user moves on (`nav.*` call + transition). Write the copy now: short, sentence case, verbs on buttons. A screen skill's `spec.md` is this, already written; adapt it to the request.
4. **Scaffold.** New flow: `npm run new-flow -- <id> "Title" "Group"` (creates `src/flows/<id>/` and registers it in `src/flows/index.ts`). Add a page URL alias in `src/kit/routes.ts` (or `ScreenDef.path`), e.g. `/loyalty`.
5. **Build from the design system.** Run `node scripts/design-context.mjs <words>` (shared and flow-local components with their props, tokens, Origin icons, motion, assets, closest screens) and walk `references/component-checklist.md`. Before creating any component, search for one: `rg` the name/role in `references/component-api.generated.md` (shared and flow-local index) and `src/components src/flows/*/components`, and run `node scripts/check-duplicates.mjs src/flows/<flow>`; follow the decision rule in `references/components.md` → "Search before you create" and state which option you chose in the plan. Never copy another flow's component; flag it as a promotion candidate instead. Skeletons from `references/screen-recipes.md`; components from `references/components.md` (real props); system icons from `references/icons.md` (`<OriginIcon name>`); images, logos and Lotties from `references/assets.md`. Copy and mock content in `data.ts` (products from `src/data`, prices with the dirham sign `currency`, never "AED"). Shared state: `useDemoStore()`, `useMembership()`; flow state with `createStore` in `store.ts`.
6. **Style with tokens only, by the design rules.** `references/design-rules.md` says which component, colour token (by role: text / surface / border), spacing, radius and type each job gets, from what the 18 flows actually use (`references/design-usage.generated.md`); `references/tokens.md` has every token. CSS modules with `var(--nk-*)`; in TS, `ref.color(...)` / `ref.type(...)`. A value with no token goes in the flow's `tokens.ts`. Never rename or remove an existing token.
7. **Add motion.** `references/motion-guidelines.md` (provisional: which motion each purpose uses today and what to pick for now, from `references/motion-usage.generated.md`); values and recipes in `references/motion.md`. Pushed screens get a transition, sheets present as sheets, lists stagger in once, presses give feedback through `Pressable` / `Button`, success moments use the existing Lotties.
8. **Register and document.** Every `ScreenDef` gets `title`, `notes` (what to try) and `source` (bappzaar path, `Figma <fileKey> · <node>`, or `reference: <what the user shared>`). For a Figma port or a reference restyle, write the flow's `FIGMA-MAPPING.md` / `MAPPING.md` table first; for a new design, fill in its `DESIGN.md` (`npm run new-flow` creates it; `npm run skill:check` fails while it has template placeholders, no research outcome, or names components that don't exist).
9. **Pass the craft gate.** For a new or restyled screen, read its pattern file in `.claude/resources/references/` before designing (step 5), and after validating score the screenshots with `references/craft-rubric.md` against 2–3 of its references; fix every failed check before reporting done. No "world-class" claim without that record.
10. **Validate visually.** Before changing a shared component, token, transition, store or data export, run `npm run brain -- impact <entity>` and re-run the journeys, visual refs and snaps it lists for every affected flow; after the change, `npm run brain:build`. `references/verify.md`. Typecheck, token lint at 0 for the folders you touched, `node scripts/design-usage.mjs --flow <flow>` at 0 for a new flow (`npm run lint:design` holds existing flows at their baseline), `check:routes` clean, then `node .claude/skills/noon-ui/scripts/snap.mjs <flow>` screenshots every screen of the flow; **read every PNG** next to the spec, the reference or the closest existing screen, and fix what differs. Iterate until a noon designer would not spot a foreign part.

## House rules (short form)

- **Every screen** is `<Screen header footer>`; it owns the safe areas and the scroll (`.nk-scroll`). Pushed screens use `<Header>`; tab roots use the flow's own top bar. Sheets (`presentation: 'sheet'`) default to the Origin M-BottomSheet: render `<SheetHeader>` / `<SheetBody>` / `<SheetFooter>` and the navigator supplies the chrome (grabber above, floating 12px inset, r16). A sheet with a grabber has no close button. Use another layout only when explicitly asked (`references/screen-recipes.md` §6). The pre-Origin sheets listed in `scripts/sheet-baseline.json` stay `sheet: 'classic'` with their current UI (`scripts/sheet-baseline.json`, enforced by `skill:check`); Origin is for new designs only.
- **Navigation** only through `useNav()`: `push / sheet / back / replace / reset / popToRoot / switchTab / toast / preload`. Routes are `flow/screen`. Page URLs live in `src/kit/routes.ts`.
- **Fast transitions**: register screens with `lazyScreen` (the landing page excepted); `nav.preload(...)` the sheets / screens a page opens; use `useIsTop()` instead of computing it from `nav.stack`, and read `nav.stack` in handlers rather than in render (`references/flows.md` §2 → Re-renders); `memo` the card in long grids whose screen re-renders (`src/flows/plp/ListingScreen.tsx` `ProductBox`); scroll a nested list with `el.scrollTo`, never `scrollIntoView` (it also scrolls the navigator while a sheet is rising).
- **One folder per flow**: `index.ts` (defineFlow), `tokens.ts`, `data.ts`, `*Screen.tsx`, `*.module.css`, `components/` for flow-only parts, optional `store.ts`, `MAPPING.md`.
- **Reuse central components** from `src/components`. A component used by two flows moves there (one folder, tokens only, doc comment naming its source). Flow-specific compositions stay in the flow.
- **Design rules** (`references/design-rules.md`): tappables are `Pressable` / `Button` (never `<button>`), colour tokens stay in their role, spacing and radius on the scale as tokens; a new flow has 0 `design-usage` findings.
- **Tokens only** in components and flow CSS/TSX. `npm run lint:tokens` stays at 0 for `src/components` and the folders you touch; `scripts/token-map.json` maps literals to tokens. Geometry (SVG paths, aspect ratios, 1px hairlines) may stay literal with `// token-lint-ignore — <reason>`.
- **Assets** in `src/assets/<flow>/` (shared ones in `src/assets/shared/`) at about 3× display size, then `npm run assets:optimize`; never hotlink temporary Figma URLs.
- **Preserve 1:1 ports.** Flows ported from bappzaar are the reference implementation. Change one to a new design only when asked; otherwise add new screens (`pdp/oos`, `home/campaign`) next to it. Keep routes and screen ids stable.
- **Source of truth per screen.** Every `ScreenDef` has `source`, and `truth` says which reference wins: `bappzaar` (master is the spec), `figma` (the frame in `source`), `mixed` (Figma look, bappzaar behaviour; the flow's FIGMA-MAPPING.md says which area follows which) or `reference`. Omitted, it's inferred from `source` (`screenTruth` in `src/kit/registry.ts`). Before changing a screen, read its `truth`. When the request, Figma and bappzaar disagree (a footer that is bappzaar in the code but Figma in the frame you were given), **say so and ask** which wins — don't silently pick. After a side-by-side check, set `verified: 'YYYY-MM-DD'` and, if precedence changed, update `truth`, `source` and the mapping file. `npm run skill:check` enforces the fields.
- **The design guard enforces it.** `.claude/settings.json` runs `scripts/hooks/design-guard.mjs` before every Write / Edit in `src/`: lines that add a raw hex / rgb / hsl colour, a foreign UI or icon library (lucide, MUI, Radix, shadcn `@/components/ui`, styled-components …), a raw `font-family` or the text "AED" are blocked with the token to use. Fix the line; don't work around the hook. A real exception carries `token-lint-ignore — <reason>`.
- **Never touch the app shell** for a flow: `src/app/` is only the dev preview and is not part of the package.
- **Keep the package stable**: exports in `src/index.ts` stay backward compatible; add a CHANGELOG line under Unreleased for anything a package user would notice.

## Running it

```bash
npm install
npm run dev                                           # phone preview → http://localhost:5180/<page>, e.g. /homepage, /cart
node scripts/shot.mjs cart/cart /tmp/cart.png         # one screen (--scroll y, --click "<selector>", --type, --wait)
node .claude/skills/noon-ui/scripts/snap.mjs cart     # every screen of a flow → /tmp/noon-ui-snap/cart/*.png
npm run check:routes                                  # every registered screen renders, no console errors
npm run test:journeys                                 # core user journeys in a browser: routes, state, results, no console errors
npm run visual:ref                                    # fidelity vs external references (visual/refs: Figma exports, app screenshots)
npm run verify                                        # typecheck · token lint · assets · library build
npm run skill:check                                   # the skills still match the code (paths, tokens, routes, coverage)
```

If port 5180 is busy, Vite picks the next one; pass `PORT=<port>` to the scripts.

## References

Design workflow (new screens, redesigns, open-ended ideas):

- `references/design-workflow.md`: sizing (small / medium / large), stages A–G, what each produces, when to ask.
- `references/craft-rubric.md`: the quality gate — score every new screen's screenshots against 2–3 references from `.claude/resources/references/<pattern>.md` (hierarchy, rhythm, copy, motion, states, consistency), fix every fail before done.
- `references/research.md`: Mobbin MCP — availability check, fallback when it's missing, how to search, what to record, translating patterns to noon.
- `references/component-checklist.md`: find before you build (`scripts/design-context.mjs`), token mapping, icons and assets, no second design system, the checks.
- `references/progress-messages.md`: short, truthful updates at real stage changes.
- `templates/DESIGN.md`: the design record for a large request (checked by `scripts/check-design-docs.mjs`).

Design system (read as you need them):

- `references/design-rules.md`: **the rules for new screens**: component per job, colour token per role, page background per layout, spacing scale and gutters, radius per element, type per use, each with the evidence from the flows; enforced by `npm run lint:design`.
- `references/design-usage.generated.md` (+ `.json`): generated counts behind those rules (components, colour by role, spacing by kind, radius by element, type, findings per flow), by `node scripts/design-usage.mjs`.
- `references/tokens.md`: the token model, every semantic token with its CSS variable, type scale, spacing, radius, shadows, layout, component tokens, Figma variable mappings, and how to snap a reference value to a token.
- `references/component-api.generated.md`: the real exported props and variants of every shared component and the flow-local index, generated by `npm run components:api` (the API source of truth).
- `references/portability.md`: what the kit needs outside the repo (bappzaar, Figma keys, fonts, asset provenance, tools) and what to do and say when a reference is unavailable.
- `references/components.md`: every central component with real props, variants, usage and gotchas; which flow-local components exist for what; the checklist for a new component.
- `references/icons.md`: the Origin Design System icon library (399 system icons, outline / filled pairs) and how to use `OriginIcon`; pick icons here first.
- `references/assets.md`: asset folders, logos and badges, Lotties, fonts, and the workflow for adding an asset.
- `references/motion-guidelines.md`: **provisional motion guidelines** by purpose (opening a screen, press, entrances, state changes, loading, success, scroll, autoplay, haptics, timing source), each with today's usage, "use for now" and what the real guidelines must decide; backed by `references/motion-usage.generated.md` (`node scripts/motion-usage.mjs`).
- `references/motion.md`: presets, screen transitions, recipes, and motion patterns taken from real flows.

Flows and screens:

- `references/flows.md`: anatomy of a flow (`defineFlow`, `ScreenDef`, routes, stores, mocks), the navigation API, the catalogue of every flow with every screen, and blueprints for common requests (counts: `.claude/resources/inventory.md`).
- `references/screen-recipes.md`: canonical screen skeletons copied from real screens.
- `references/from-reference.md`: turning a screenshot, Figma frame or competitor app into a noon flow, or restyling an existing one.
- `references/verify.md`: the commands, the screenshot review checklist and the common faults.

Branch resources (`.claude/resources/`, shared by every skill; read before opening a flow's code):

- `.claude/resources/brain/INDEX.md` → `flows/<flow>.md`: the generated brain map (entry point, one card per flow, layer cards for components / tokens / motion / journeys, consistency findings); query it with `npm run brain -- context | impact | deps | path` (`.claude/resources/brain/README.md`).

- `.claude/resources/screens.md`: generated index of every route (URL, presentation, truth, verified, source) and each flow's docs, data / token files and local components.
- `.claude/resources/patterns.md`: the shopping hand-off graph, where state goes, area token files vs param variants, scroll and tab bar, motion reuse.
- `.claude/resources/tooling.md`: lazy screens, tab bar scroll, `screenTruth`, which check proves what, adding a journey or visual reference.
- `.claude/resources/flows/`: one brief per flow (what it is now, pieces, state, recipes, gotchas, known drift). `.claude/resources/README.md` says which skill reads which.

## Adding a screen skill

When a flow gets its own design spec (or is in demand enough that agents keep re-reading its code), give it a skill so it can be invoked by name. Pick the next flow from `.claude/resources/inventory.md` → Flows: rows with coverage `brief` or `blueprint` have no spec yet.

1. Create `.claude/skills/<name>/SKILL.md` with `name: <name>` (same as the folder) and a description that says when to use it (no angle brackets, under 1024 characters). Copy the structure of `../cart/SKILL.md` or `../orders/SKILL.md`: **Sources** (brief, spec, design sources, implementation, design system), **Steps** that point back to this skill's workflow and house rules by link (never restate or fork them), **Rules specific to** the page, **Validate** with the real commands.
2. Write `.claude/skills/<name>/spec.md` from the code, not from memory: screens with routes, URLs and presentation; anatomy top to bottom with the real component names; navigation (every `nav.*` call and transition); state and where it lives; loading / empty / error / success states, saying plainly which ones don't exist yet; data sources; design sources (bappzaar paths, Figma keys, verification dates from the flow's `MAPPING.md` / `FIGMA-MAPPING.md`); motion (presets used); acceptance checklist. Mark anything you inferred rather than read as an assumption.
3. Put Figma analyses in `.claude/skills/<name>/references/`. Routes, paths or vars the spec proposes go in a `<!-- planned: … -->` comment; files outside the repo in `<!-- external: … -->`.
4. Add it to the table above, point the flow's catalogue entry and blueprint in `references/flows.md` to it, add an eval prompt to `evals/evals.json`, then run `npm run resources:build` and `npm run skill:check`.

## Keeping the skills current

The kit changes; the skills must follow it. After adding or renaming a component, token, transition, recipe, flow or screen, run `npm run skill:check`. It validates every skill: frontmatter, that every file path, `--nk-*` variable and `flow/screen` route mentioned in the skill files exists, and that the references cover everything in the code. Fix what it lists, keep entries in the same format, and add a line to `CHANGELOG.md`.
