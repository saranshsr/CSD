# Skill resources

Shared material the noon skills load **on demand**. It describes what is on the branch now, so a skill can start from the real state of a flow instead of re-reading the whole folder. The skills themselves (`.claude/skills/*`) hold the rules and specs. These files hold the analysis.

| File | What it gives you | Kept current by |
|---|---|---|
| `resources/brain/INDEX.md` → `brain/flows/<flow>.md` (+ `components.md`, `tokens.md`, `motion.md`, `journeys.md`, `findings.md`) | the **brain map**: entry point and one card per flow with each screen's module, components, tokens, motion, nav in / out, tests and doc line ranges; layer cards; consistency findings. Query it: `npm run brain -- context "<request>"`, `impact <entity>`, `deps <screen>`, `path <a> <b>` (`resources/brain/README.md`) | **generated**: `npm run brain:build` (also run by `resources:build`; `skill:check` fails when stale) |
| `resources/screens.md` | every route: URL, presentation, truth, verified date, source; each flow's docs, data/token files and local components | **generated**: `npm run resources:build` (`skill:check` fails when it's stale) |
| `resources/inventory.md` (+ `inventory.json`) | per flow: screen count, routes, coverage level (`spec` / `brief` / `blueprint` / `none`), which docs exist (mapping docs, brief, screen skill + spec), verified dates; per screen: truth and provenance label (**reference-backed** / **kit-backed** / **inferred**, mapping in the file); loading / empty / error / success states detected heuristically; lists of unverified screens and screens whose truth is only inferred from `source` | **generated**: `npm run resources:build`; `node scripts/check-inventory.mjs` fails when a doc quotes a flow / screen / route count the registry disagrees with |
| `resources/patterns.md` | the shopping hand-off graph, where state goes, area token files vs param variants, scroll/tab bar, motion reuse | hand-written |
| `resources/tooling.md` | lazy screens, tab bar scroll, `screenTruth`, which check proves what, how to add a journey or visual reference | hand-written |
| `flows/<flow>.md` | per-flow brief: what the screen is now, pieces, state, recipes, gotchas, known drift | hand-written |
| `references/<pattern>.md` | the **world-class bar** per pattern (home feed, search, listing, PDP, cart, checkout, tracking, membership, account, sheets, navigation, toasts, states, sign-in, reviews): best-in-class screens via Mobbin links, what makes each great, how to build it with noon, what to avoid; used with `noon-ui/references/craft-rubric.md` | hand-written from Mobbin research (`resources/references/README.md`; refresh with `Last researched` dates) |
| `resources/flows/categories-views.md` | every view the Categories tab links to: 29 tiles, each sub banner's link, where the app opens it, page type and sections | **generated** from `data.live.ts` + `linkRouting.ts` (+ `cms-pages.json` after `npm run categories:fetch`) |

## Which skill reads what

| Skill | Read first | Then, as needed |
|---|---|---|
| every skill | `npm run brain -- context "<request>"`, then `resources/brain/INDEX.md` → the flow card it names | the files the card names; `brain -- impact` before touching shared code |
| `/noon-ui` | `resources/screens.md`, `resources/inventory.md`, `resources/patterns.md` | the brief of the closest flow; `resources/tooling.md` before validating |
| `/home-page` | `resources/flows/home.md` | `resources/patterns.md` → tokens, data-driven screens |
| `/search` | `resources/flows/search.md`, `resources/flows/plp.md` | `resources/patterns.md` → scroll |
| `/pdp` | `resources/flows/pdp.md` | `resources/patterns.md` → tokens, scroll |
| `/cart` | `resources/flows/cart.md` | `resources/flows/checkout.md` (hand-off), `resources/patterns.md` → state |
| `/checkout` | `resources/flows/checkout.md` | `resources/flows/cart.md`, `resources/flows/orders.md` (confirmation → orders) |
| categories / category landing pages via `/noon-ui` | `resources/flows/categories.md`, `resources/flows/categories-views.md` | `resources/flows/home.md` (module renderers), `resources/flows/plp.md` (catalog pages) |
| orders / reviews / account / other pages via `/noon-ui` | `resources/flows/orders.md`, `resources/flows/reviews.md`, `resources/flows/account.md`, `resources/flows/other-flows.md` | `resources/patterns.md` |

## Rules

- **The code wins.** These files are a map, not the spec. When a brief disagrees with the code, trust the code and fix the brief in the same change.
- Never edit `resources/screens.md`, `resources/inventory.md`, `inventory.json`, `resources/flows/categories-views.md` or the generated `brain/` cards by hand.
- **Don't hand-type counts.** Point to `resources/inventory.md` instead of writing "N flows" or "N screens". Where a count must stay in prose, `node scripts/check-inventory.mjs` keeps it honest. A file count or subset that isn't a registry count ("+ 21 screens") is listed for review and doesn't fail; add `<!-- count-ok -->` to a line to skip it.
- **Provenance.** Label new work reference-backed, kit-backed or inferred (see `resources/inventory.md`, and `references/portability.md` for what to do when a reference is unavailable). Set `verified` only after a real side-by-side check.
- After changing a flow, update its brief: screens, pieces, gotchas. Run `npm run resources:build` and `npm run skill:check`. Both check this folder: every path, `--nk-*` var and route mentioned must exist.
- A new flow gets a brief in `flows/` (or a section in `resources/flows/other-flows.md` while it's small) and a row in the table above.
