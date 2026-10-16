# Research-first design workflow

Every noon skill follows this workflow. Screen skills add their spec on top; they never fork it. The point: a new screen should feel like the next screen of the noon app, not a generic e-commerce page or a copy of another product.

```
A Understand → B Research → C Ideate → D Clarify → E Design direction → F Implement → G Validate
```

## Size the request first

| Size | Examples | Stages |
|---|---|---|
| **Small** | copy or spacing fix, swap an icon, restyle one section to a given reference, a bug | A (read the code) → F → G. Say the assumptions in one line. |
| **Medium** | a new section or sheet in an existing flow, a new state of a screen | A → B (repo first; Mobbin if the pattern is new to noon) → E (short, in the reply) → F → G |
| **Large** | a new screen, a new flow, a redesign, anything that adds a component or token | All stages. Write `src/flows/<flow>/DESIGN.md` (template: `../templates/DESIGN.md`) and present the design direction before writing code. |

When unsure, treat it as the bigger size. A 1:1 port from bappzaar or Figma is research done: the reference is the source (write `MAPPING.md` / `FIGMA-MAPPING.md`); skip B–D unless the reference leaves real decisions open.

## A — Understand

- The user problem, who it's for, the entry point (which screen or tab leads here), the outcome, the flow it belongs to.
- Read the neighbours: `.claude/resources/inventory.md` (which flow, coverage, provenance), the flow's brief in `.claude/resources/flows/`, its `MAPPING.md` / `FIGMA-MAPPING.md`, the closest existing screens.
- Run the reuse finder for the parts you'll need: `node scripts/design-context.mjs <words…>` (e.g. `stepper rating sheet loyalty`). It lists matching shared components with their real props, flow-local components, tokens, Origin icons, assets, motion presets and the closest screens.
- Don't ask what the repo already answers.

## B — Research

- **Repo first.** If an existing noon flow already solves the pattern, that's the answer; note it and move on.
- **The reference library.** Read the pattern file in `.claude/resources/references/` (`README.md` lists them: home feed, search, listing, PDP, cart, checkout, tracking, membership, account, sheets, navigation, toasts, states, sign-in, reviews). It is the bar: the strongest screens from Airbnb, Apple, Revolut, Uber, Amazon, Shop, Instacart, Zara, talabat, Careem, Linear, Arc, Things and Duolingo, what makes each great, and how to build it with noon. Take structure and interaction, never branding.
- **Prior research.** Check the flow's `DESIGN.md` → Research and `.claude/resources/` before searching again.
- **Mobbin, when connected.** For patterns new to noon, research them with Mobbin (how, when and the fallback: `research.md`). Mobbin is a reference, never the design system.
- Record each significant decision's source and why, in `DESIGN.md` → Research (or the reply for medium requests).

## C — Ideate

Only when there's real ambiguity. Two or three approaches that differ in structure or interaction (not colour), each judged on: the user's goal, consistency with noon, accessibility, implementation cost (reuse vs new pieces). Recommend one and say why in two or three lines.

## D — Clarify

Ask only what changes the design: intent or business rule, a missing state or navigation decision, an ambiguous reference, a trade-off with real consequences. Group the questions in one message and offer the recommended answer first. If nothing material is open, state the assumptions and continue.

## E — Design direction

Before code, settle and write down:

- screen structure and hierarchy, top to bottom, each section mapped to an existing component (`component-checklist.md`);
- tokens for every colour, type style, space, radius, shadow and motion value;
- genuinely new pieces: the gap, the closest existing pattern, the smallest consistent extension, and whether it's flow-local or shared;
- interactions and motion (presets from `motion.md`, the flow's row in `motion-matrix.md`);
- loading, empty, error, success and disabled states, and how the user leaves each;
- navigation (`nav.*` calls, presentation, transitions) and where state lives.

Large requests: this is `DESIGN.md`, shown to the user before implementation. `npm run skill:check` fails while a `DESIGN.md` still has template placeholders (`scripts/check-design-docs.mjs`).

## F — Implement

Follow `SKILL.md` → Workflow steps 4–8 and the house rules. Real interactions and state, not static pictures. No unrelated changes. The design guard hook (`scripts/hooks/design-guard.mjs`, wired in `.claude/settings.json`) rejects edits that add raw colours, foreign icon or UI libraries, or inline colour styles; fix the edit, don't work around the hook.

## G — Validate

Run, then read the results (`verify.md`): `npm run verify`, `npm run lint:tokens -- -v src/flows/<flow>`, `node scripts/check-duplicates.mjs src/flows/<flow>`, `npm run skill:check`, `PORT=<port> npm run check:routes`, the flow's journeys (`npm run test:journeys -- <area>`), and screenshots of every new screen and state with `node .claude/skills/noon-ui/scripts/snap.mjs <flow>`, compared with the reference or the closest noon screen (`npm run visual:ref` when a reference exists). Fix and re-run. Then run the **craft gate** (`craft-rubric.md`): score the screenshots against 2–3 references from the pattern file, fix every failed check, re-shoot. Record the results and the craft review in `DESIGN.md` → Validation. Report what failed or couldn't be run; never call a screen visually verified without a reference comparison.

## Progress updates

Tell the user what's happening at each stage change, briefly and truthfully: `progress-messages.md`.
