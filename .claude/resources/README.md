# Skill resources

Shared material the noon skills load **on demand**. It describes what is on the branch now, so a skill can start from the real state of a flow instead of re-reading the whole folder. The skills themselves (`.claude/skills/*`) hold the rules and specs. These files hold the analysis.

| File | What it gives you | Kept current by |
|---|---|---|
| `brain/INDEX.md` → `brain/flows/<flow>.md` (+ `components.md`, `tokens.md`, `motion.md`, `journeys.md`, `findings.md`) | the **brain map**: entry point and one card per flow with each screen's module, components, tokens, motion, nav in / out, tests and doc line ranges; layer cards; consistency findings. Query it: `npm run brain -- context "<request>"`, `impact <entity>`, `deps <screen>`, `path <a> <b>` (`brain/README.md`) | **generated**: `npm run brain:build` (also run by `resources:build`; `skill:check` fails when stale) |
| `screens.md` | every route: URL, presentation, truth, verified date, source; each flow's docs, data/token files and local components | **generated**: `npm run resources:build` (`skill:check` fails when it's stale) |
| `inventory.md` (+ `inventory.json`) | per flow: screen count, routes, coverage level (`spec` / `brief` / `blueprint` / `none`), which docs exist (mapping docs, brief, screen skill + spec), verified dates; per screen: truth and provenance label (**reference-backed** / **kit-backed** / **inferred**, mapping in the file); loading / empty / error / success states detected heuristically; lists of unverified screens and screens whose truth is only inferred from `source` | **generated**: `npm run resources:build`; `node scripts/check-inventory.mjs` fails when a doc quotes a flow / screen / route count the registry disagrees with |
| `patterns.md` | the shopping hand-off graph, where state goes, area token files vs param variants, scroll/tab bar, motion reuse | hand-written |
| `tooling.md` | lazy screens, tab bar scroll, `screenTruth`, which check proves what, how to add a journey or visual reference | hand-written |
| `flows/<flow>.md` | per-flow brief: what the screen is now, pieces, state, recipes, gotchas, known drift | hand-written |
| `references/<pattern>.md` | the **world-class bar** per pattern (home feed, search, listing, PDP, cart, checkout, tracking, membership, account, sheets, navigation, toasts, states, sign-in, reviews): best-in-class screens via Mobbin links, what makes each great, how to build it with noon, what to avoid; used with `noon-ui/references/craft-rubric.md` | hand-written from Mobbin research (`references/README.md`; refresh with `Last researched` dates) |
| `flows/categories-views.md` | every view the Categories tab links to: 29 tiles, each sub banner's link, where the app opens it, page type and sections | **generated** from `data.live.ts` + `linkRouting.ts` (+ `cms-pages.json` after `npm run categories:fetch`) |

## Which skill reads what

| Skill | Read first | Then, as needed |
|---|---|---|
| every skill | `npm run brain -- context "<request>"`, then `brain/INDEX.md` → the flow card it names | the files the card names; `brain -- impact` before touching shared code |
| `/noon-ui` | `screens.md`, `inventory.md`, `patterns.md` | the brief of the closest flow; `tooling.md` before validating |
| `/home-page` | `flows/home.md` | `patterns.md` → tokens, data-driven screens |
| `/search` | `flows/search.md`, `flows/plp.md` | `patterns.md` → scroll |
| `/pdp` | `flows/pdp.md` | `patterns.md` → tokens, scroll |
| `/cart` | `flows/cart.md` | `flows/checkout.md` (hand-off), `patterns.md` → state |
| `/checkout` | `flows/checkout.md` | `flows/cart.md`, `flows/orders.md` (confirmation → orders) |
| categories / category landing pages via `/noon-ui` | `flows/categories.md`, `flows/categories-views.md` | `flows/home.md` (module renderers), `flows/plp.md` (catalog pages) |
| orders / reviews / account / other pages via `/noon-ui` | `flows/orders.md`, `flows/reviews.md`, `flows/account.md`, `flows/other-flows.md` | `patterns.md` |

## Rules

- **The code wins.** These files are a map, not the spec. When a brief disagrees with the code, trust the code and fix the brief in the same change.
- Never edit `screens.md`, `inventory.md`, `inventory.json`, `flows/categories-views.md` or the generated `brain/` cards by hand.
- **Don't hand-type counts.** Point to `inventory.md` instead of writing "N flows" or "N screens". Where a count must stay in prose, `node scripts/check-inventory.mjs` keeps it honest. A file count or subset that isn't a registry count ("+ 21 screens") is listed for review and doesn't fail; add `<!-- count-ok -->` to a line to skip it.
- **Provenance.** Label new work reference-backed, kit-backed or inferred (see `inventory.md`, and `../skills/noon-ui/references/portability.md` for what to do when a reference is unavailable). Set `verified` only after a real side-by-side check.
- After changing a flow, update its brief: screens, pieces, gotchas. Run `npm run resources:build` and `npm run skill:check`. Both check this folder: every path, `--nk-*` var and route mentioned must exist.
- A new flow gets a brief in `flows/` (or a section in `flows/other-flows.md` while it's small) and a row in the table above.
