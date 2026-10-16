---
name: reviews
description: Build or restyle noon ratings and reviews (R&R 2.0) with the noon flow kit — the star tap on a delivered order, the rate screen with Write with AI and checkbox picks, the AI writing loader, review drafts (polaroid card or in-place edit), the single-scroll Write a review page with chips, inline AI draft, photos and its three editor patterns, the review submitted thanks screen, and rating past orders as a swipe deck, a slider or a multi-product page. Use when someone asks for a review or rating page, write a review, AI-written review, review draft or edit, add photos to a review, a thank-you after review, rate past orders, or to change how a star tap on the orders list opens a review. Builds on noon-ui.
---

# Ratings & reviews

Builds the R&R 2.0 review flow and any change to it. Load `../noon-ui/SKILL.md` first if it isn't loaded: its workflow, house rules and design-system references apply here unchanged. This skill adds the reviews specification and the checks specific to it.

For a new screen, a redesign or an open-ended idea, run the research-first design workflow before building: `../noon-ui/references/design-workflow.md` (size the request, research the repo and Mobbin per `../noon-ui/references/research.md`, clarify only blocking gaps, write the design direction, build with `../noon-ui/references/component-checklist.md`, validate). Its rules apply here unchanged; this skill's `spec.md` is the starting point for the design direction, and a port from bappzaar or Figma stays analyse → map → implement.

## Sources

| Source | Where |
|---|---|
| Brain card (read first) | `.claude/resources/brain/flows/reviews.md` — generated: every screen with its module, components, tokens, motion, nav in / out, tests and the spec / brief line ranges that describe it; `npm run brain -- context "<request>"` for the reading list, `npm run brain -- impact <entity>` before changing shared code |
| Branch brief | `.claude/resources/flows/reviews.md` — the two entries, submit graph, store, shared components, mapping gotchas |
| Flow specification | `spec.md` (screens, anatomy, navigation graph, state, states, data, motion, acceptance) |
| Design source | Figma `KzR8dy12uT8CtgBRHHY6Qx` "R&R 2.0" (one node per screen in `src/flows/reviews/index.ts`) + prototype repo `vbirla789/R-R-2.0-with-checkbox` @ `ab185b3` (`src/screens/*`). Truth is inferred `mixed` on every screen; no screen has `verified` yet |
| Value mapping | `src/flows/reviews/MAPPING.md` — §1 colours, §2 type, §3 motion, §4 components, §5 assets, §6 documented exceptions |
| Flow graph and helpers | `src/flows/reviews/README.md`, `src/flows/reviews/store.ts` (`openReview`, `reviewsNav`, `reviewsActions`, `useReviewParams`) |
| Current implementation | `src/flows/reviews/` — `index.ts`, nine `*Screen.tsx`, `components/` (exported from `components/index.ts`), `data.ts`, `tokens.ts` + `tokens.motion.ts`, `tokens.ai.ts`, `tokens.keyboard.ts`, `tokens.draft.ts`, `assets.ts` |
| Entry point | `src/flows/orders/components/StarRating.tsx` (the only caller of `openReview`) |
| World-class bar | `.claude/resources/references/reviews-ratings.md` + `.claude/resources/references/feedback-toasts.md` — the strongest screens from the reference set (Mobbin-linked), what makes them great, how to build it with noon; read before designing, then pass `../noon-ui/references/craft-rubric.md` against them before done |
| Design system | `../noon-ui/references/tokens.md`, `components.md`, `motion.md`, `screen-recipes.md`, `flows.md` (reviews catalogue entry) |

## Steps

1. **Pick the target** (say it in one line):
   - *New review variant or state*: a new ScreenDef in `src/flows/reviews/index.ts` reusing an existing screen component with `defaultParams` (`rating`, `variant`, `product`), or a new screen next to the nine. Default.
   - *Change an existing screen*: only when asked; the nine screens are a 1:1 port of the repo + Figma. Keep routes, screen ids and `path`s stable.
   - *Change where a star tap goes*: edit `orderReviewEntries` / `orderKindEntries` in `src/flows/reviews/data.ts` or the arrow in `reviewsNav`, never the orders screen.
2. **Read** `spec.md`, the brief, `MAPPING.md` §3–§6, then `store.ts` and the screen you start from, plus the shared components you will reuse.
3. **Plan** with noon-ui's workflow step 3: for each screen, the route, presentation, which store fields it reads and writes, and which `reviewsNav` helper leaves it.
4. **Build** from the shared components in `src/flows/reviews/components/` (`StarRatingInput`, `AttributeChips`, `ReviewProductHeader`, `AiToggle`, `DraftCard`, `AddPhotos`, `ReviewTextField`, `MockKeyboard` / `KeyboardDock`, `ReviewHeader`, `ReviewFooter`, `ReviewSheet` / `RewriteSheet` / `EditReviewSheet`, `PastOrderCard`) and central `Button`, `Pressable`, `Checkbox`, `Switch`, `Lottie`, `OriginIcon`.
5. **Tokens**: repo / Figma values go through `MAPPING.md` first; a value with no kit equal is a `reviews*` flow token in `tokens.ts` (or `tokens.ai.ts` / `tokens.keyboard.ts`) with a `MAPPING.md` row. Every page uses `<Screen background="reviewsPage">`.
6. **Motion**: only `reviewsMotion` (`tokens.motion.ts`) and kit presets / recipes; see `spec.md` → Motion.
7. **Register**: `title`, `notes`, `path`, `defaultParams`, `source` built with the `src(node, file)` helper in `index.ts` (`Figma KzR8dy12uT8CtgBRHHY6Qx · <node>; repo … src/screens/<File>`).
8. **Validate**, below.

## Rules specific to reviews

- **Never hard-code a reviews route.** Every arrow is a helper in `store.ts`: `openReview` (the one entry, resets the session), `reviewsNav.openRate / openNew / craft / finishGenerating / stopGenerating / submit / submitPastOrders / afterSubmit / close / tellUsMore`, `draftRoute(variant)`. A new arrow is a new helper there.
- **Session state lives in `reviewsStore`** (`useReviews`, `reviewsActions`). Each screen calls `useReviewParams(params)` first so direct URLs (`/reviews/rate?rating=2&variant=B`) seed the store. Per-screen UI state (phase, editing, keyboard, deck index, per-product ratings on past-order screens) stays in the screen. No DemoStore use.
- **Sheets are in-screen overlays** (`ReviewSheet`, `RewriteSheet`, `EditReviewSheet`, DraftB's save dock), passed as `<Screen overlay>`: they hold the screen's live draft or pending pick. Don't turn them into `nav.sheet` routes (`MAPPING.md` §6).
- **Submit resets the stack** (`nav.reset('reviews/submitted')`): Submitted has no back and auto-advances. Past-order screens and close buttons leave with `nav.reset('orders/list')`.
- **Order ids are a contract** with `src/flows/orders/data.ts` (o3 bike, o4 iPhone, o8 exchanged with `reviewProduct: 'iphone16'`). Don't renumber; add an entry in `orderReviewEntries` for a new ratable order.
- **The mock keyboard** (`MockKeyboard` via `ReviewFooter keyboard`) types into the focused field with `applyKey`; text fields use `inputMode="none"` where the mock keyboard owns input. Keep it when you add a field.
- Extend shared components with props only (tag `@extended-by`), never fork them per screen.

## Validate

```bash
npm run typecheck && npm run lint:tokens -- -v src/flows/reviews
npm run check:routes
node .claude/skills/noon-ui/scripts/snap.mjs reviews                 # every review screen
node scripts/shot.mjs reviews/rate /tmp/rate-b1.png                   # then open /reviews/rate?rating=1&variant=B in the preview
node scripts/shot.mjs reviews/new /tmp/new-scrolled.png --scroll 400  # header docked into the nav
node scripts/shot.mjs reviews/submitted /tmp/submitted.png --wait 3000
```

Read every PNG against `spec.md` → Acceptance and the Figma node in the screen's `source`: gradient page, 12 gutter, dark CTA, star sizes, chip states, draft card look, deck peeks. Click through the graph once from `orders/list` (star on o3, o4, o8). Then run `npm run skill:check` if you changed components, tokens or screens.
