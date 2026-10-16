# From a reference to a noon flow

Users share references in four shapes: a screenshot of another app, a Figma frame, a sketch or a written description, and sometimes a noon screen they want changed. In every case the reference supplies **what the screen is for and how it is arranged**. noon supplies **how it looks and moves**. Take its finish, never its pixels.

## 1. Read the reference

Open every image the user shared and write down, before any code:

| Look for | Write down |
|---|---|
| Purpose | One sentence: what the user does on this screen and where they go next. |
| Structure | The sections top to bottom (header, hero, tabs/filters, cards, lists, carousel, footer CTA), and which are sticky. |
| Content | Every piece of copy and data, in order. Mark what is server-driven (prices, names, dates, counts). |
| Interaction | What is tappable, what opens a sheet, what switches a tab, what animates. |
| States | Empty, loading, error, success, selected, disabled, if shown or implied. |
| Hierarchy | What is primary (the one action), secondary and tertiary. |

Ignore the reference's colours, fonts, corner radii, icon set, shadows and exact spacing. Those come from the kit.

For a Figma URL, read the node with the Figma MCP tools (design context, variables, screenshot) when they are available. Figma values that match noon's design system map straight to tokens; anything else is snapped like a screenshot value.

## 2. Map each part to the kit

Write the mapping as a table, in the flow's `FIGMA-MAPPING.md` for Figma or `MAPPING.md` otherwise (the format the existing mapping files use):

| Section | Reference element | Kit piece | Token / variant | Status |
|---|---|---|---|---|
| Header | back + title + share | `Header` | `title`, right action | reuse |
| Hero | gradient card with points | flow-local `PointsHero` | `--nk-radius-*`, flow token `heroGradient` | new (flow) |
| Tiers | horizontal chips | `Pill` row in a scroll | selected = primary | reuse |
| Rewards | 2-col cards with image, title, cost | `SectionCard` + grid of a flow-local `RewardCard` built on `ProductImage`, `Text`, `Tag` | | new (flow) |
| Footer | full-width CTA | `Button size="lg" block` in sticky footer | | reuse |

Rules for the mapping:

- **Reuse first.** Check `components.md` for every element. A row with an icon, title, subtitle and chevron is a `ListRow`. A price is a `Price`. A coloured label is a `Tag` or `Pill`. A toggle is a `Switch`, a choice a `Segmented` or `Checkbox`.
- **Then reuse from a flow.** Many patterns already exist as flow-local components (order cards, tracking steppers, membership heroes, coupon rows). `flows.md` lists them. Import or copy them rather than writing new ones; if a second flow now needs one, move it to `src/components`.
- **Snap every value.** A colour goes to the nearest semantic token for its role (text, surface, border, brand, success, warning, error), not the nearest hex. A size goes to the type scale variant with the same role. Spacing and radius go to the nearest step. `tokens.md` has the tables and the snapping rules. Only a value that is clearly part of the new screen's identity (a loyalty tier colour, a hero gradient) becomes a flow token in `tokens.ts`.
- **Motion from the kit.** A reference's animation becomes the closest registered transition, recipe or preset (`motion.md`). A celebratory moment uses an existing Lottie.
- **Copy in noon's voice.** Keep the meaning, rewrite to noon's tone: short, sentence case, plain verbs ("Track order", "Need help?", "Verify"). Prices use the dirham sign.

## 3. Restyling an existing flow from a reference

When the user says "update the orders flow to look like this":

1. Screenshot the current screens first (`node scripts/shot.mjs orders/list /tmp/before-orders.png`) and keep them for comparison. For a wider change, `npm run visual:snap -- /tmp/base` before you start.
2. Diff the reference against the current screen section by section, in the mapping table: keep, change, add, remove.
3. Change the flow's own files (`*Screen.tsx`, `components/`, `*.module.css`, `data.ts`, `tokens.ts`). Do not change a central component's look for one flow; add a prop or variant only if the change is a real noon variant, and check every other flow that uses it.
4. Keep routes, screen ids and `nav.*` targets stable so links from other flows keep working. Update `notes` and `source` in `index.ts`.
5. Screenshot again, put before, after and the reference side by side, and read all three.

## 4. Building a brand-new flow from a reference

1. Classify the screens and pick a blueprint in `flows.md`.
2. Write the screen plan (SKILL.md, workflow step 3) and the mapping table.
3. `npm run new-flow -- <id> "Title" "Group"`, add the page URL in `src/kit/routes.ts`.
4. Build section by section from the mapping, tokens only, then add motion.
5. Verify (`verify.md`) and compare the screenshot with the reference: same structure and hierarchy, noon's look.

## 5. When the reference and noon disagree

- The reference wants something noon has no pattern for (a 3-D card, a dark theme, a custom chart): build the closest noon equivalent, tell the user what you changed and why, and offer the literal version as a flow-local component if they want it.
- The reference's layout breaks noon's rules (no safe-area footer, text on busy images, tiny tap targets): follow noon's rules and say so.
- The reference is ambiguous about behaviour: pick the behaviour the closest noon flow uses and list it as an assumption.
