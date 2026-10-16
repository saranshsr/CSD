# Craft rubric: the quality gate for every new screen

"It renders and the tests pass" is not done. A new or restyled screen is done when it holds up next to the best app
that solves the same problem. This rubric is the gate. Run it after `verify.md` and before reporting a screen as
finished; the reference library it compares against is `.claude/resources/references/` (one file per pattern, built from
Airbnb, Apple, Revolut, Uber, Amazon, Shop, Instacart, Zara, talabat, Careem, Linear, Arc, Things and Duolingo).

Scope: new screens, new sections and restyles. 1:1 ports are judged against their source (`truth`), not this rubric,
unless the user asks to raise them.

## Procedure

1. **Pick the pattern file(s).** `references/<pattern>.md` for what you built (`README.md` lists them). Open 2–3 of its
   references (the `mobbin_url` links; with Mobbin connected, re-run its searches to see the screens).
2. **Screenshot every state** at phone size: `node .claude/skills/noon-ui/scripts/snap.mjs <flow>` (or
   `node scripts/shot.mjs <route>` for one), including loading, empty, error, a long-content case and RTL when the
   screen has text. Read each PNG; don't judge from code.
3. **Score each check below** pass / fail against the screenshot *and* the references. A check fails if a reference
   does it clearly better and noon's components could too.
4. **Fix every fail, re-shoot, re-score.** Repeat until all pass. A check that can't pass with existing components is a
   gap: name the closest component and ask (`design-rules.md` §0); don't invent a look to pass the rubric.
5. **Record it** in `DESIGN.md` → Validation (or the reply for small changes): the references compared, each failed
   check and its fix, and anything left open. Never write "world-class" or "polished" without this record.

## Checks

### 1. Purpose and hierarchy
- [ ] **One job, obvious in 2 seconds.** The screen's main task is the first thing the eye lands on (the references put
  the decisive element — price + CTA, ETA, the search field — in the strongest position).
- [ ] **One primary action.** Exactly one filled primary CTA in view; secondary actions are outline / ghost / text. No
  two buttons with equal weight competing.
- [ ] **Three levels, no more.** Title, body and meta are clearly different (size *or* weight *or* colour role); no fourth
  level invented with a one-off size. Type comes from tokens (`--nk-type-*`, `fieldB14Medium` …).

### 2. Layout and rhythm
- [ ] **One side margin.** Content aligns to a single gutter (12 or 16, `design-rules.md`); edge-to-edge media is the
  only exception. Nothing sits 1–3px off the grid.
- [ ] **Spacing tells the grouping.** Space inside a group < space between groups (e.g. 8 inside, 24 between sections);
  related items touch the same group, unrelated ones don't share a card.
- [ ] **No card inside a card, no border and shadow and fill all at once.** One container treatment per level.
- [ ] **Density matches the job.** Browse screens are generous (images lead); task screens (checkout, settings) are
  compact but never cramped; nothing truncates that the user needs (prices, ETAs, names) at 390 wide.

### 3. Content and copy
- [ ] **Real content.** Real product data from `src/data`, realistic lengths (a long title, a 7-digit price, Arabic),
  no lorem, no "Title".
- [ ] **Copy is short and specific.** Sentence case, verbs on buttons ("Add to cart", not "Submit"), numbers formatted,
  the dirham sign, no exclamation-mark marketing on task screens.
- [ ] **Every value explains itself.** Totals, fees, discounts and ETAs say what they are; nothing the user has to decode.

### 4. Interaction and motion
- [ ] **Every tappable looks tappable and gives feedback.** `Pressable` / `Button` press states; targets ≥ 44px.
- [ ] **Motion explains the change.** Things move from where they come from (a summary grows out of its card, a sheet
  rises from the bottom), one spring family per gesture, no overshoot on task UI, ≤ ~450ms. Nothing pops in that could
  have transitioned; nothing animates just to animate. Reduced motion respected.
- [ ] **Continuity.** Shared elements stay one element across states (no duplicate that cross-fades into a different
  shape); text never scales or stretches during a transition.

### 5. States and edges
- [ ] **Loading is shaped like the content** (`Skeleton` blocks in the real layout), not a lone spinner.
- [ ] **Empty and error states have a way forward:** what happened, in one line, and one action.
- [ ] **Edges hold:** long text wraps or truncates on purpose, RTL mirrors, safe areas respected, the tab bar / sticky
  footers never cover content the user must reach.

### 6. Consistency with noon
- [ ] **Only kit pieces.** Every element is an existing component / variant in the host screen's design language
  (`design-rules.md` §0); tokens only (`lint:tokens`, `lint:design` at baseline).
- [ ] **It looks like the screens around it.** Put the screenshot next to the closest noon screen: same header, same
  footer, same card treatment, same type scale.

## Common fails (and the fix)

| Fail | Fix |
|---|---|
| Two filled CTAs side by side | primary + `outline` / `secondary`, or `ActionBar layout="split" tone` |
| Section titles the same size as body | section `Text variant="section"` / `fieldH16Bold`; body 14–15 |
| Everything in its own white card | group related rows in one `SectionCard` / `ListGroup`; space between groups |
| Spinner while content loads | `Skeleton` in the content's shape |
| Content hidden behind the sticky footer / tab bar | `Screen floatingFooter` or padding for the footer + tab bar zone |
| A transition that swaps two different shapes | animate one element's geometry; cross-fade only the content inside |
| Centred long copy | start-aligned body; centre only short titles / empty states |
