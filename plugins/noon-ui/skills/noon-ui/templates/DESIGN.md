# <Flow or screen name> — design record

<!-- Copy to src/flows/<flow>/DESIGN.md for a new screen or flow (design-workflow.md → Large). Replace every
     `<…>` placeholder and delete the `TEMPLATE` marker below; `npm run skill:check` fails while either is left. -->
<!-- TEMPLATE -->

## Request

- Problem: <what the user is trying to do>
- Audience and entry point: <who, from which screen / tab>
- Outcome: <what success looks like>
- Size: <small | medium | large> · Flow: `<flow>` · Neighbours read: <screens / briefs / MAPPING docs>

## Research

- Repo patterns: <existing noon screens that already solve part of this, with paths>
- Mobbin: <"not available" | "not needed: <why>" | the table below>

| Reference | Pattern seen | Use for noon | Avoid |
|---|---|---|---|
| <[app · screen](https://mobbin.com/screens/…)> | <structure / interaction> | <what we take> | <what we don't> |

Takeaways for noon: <2–4 patterns mapped to noon components>

## Approaches

<Only when there was real ambiguity: 2–3 approaches, the criteria, and the recommendation with its reason. Otherwise "One clear approach: <why>".>

## Decisions and assumptions

- <decision or assumption> — <source: user / repo / reference>

## Design direction

| Section (top → bottom) | Component | Tokens / variant | Notes |
|---|---|---|---|
| <header> | <`Header`> | <…> | <…> |

New pieces (gap → closest existing → extension; flow-local or shared): <none | list>

## States

| State | How it's shown | How the user leaves it |
|---|---|---|
| loading | <…> | <…> |
| empty | <…> | <…> |
| error | <…> | <…> |
| success | <…> | <…> |
| disabled | <…> | <…> |

## Navigation and state

- <`nav.*` calls, presentation, transitions; where state lives (store / DemoStore / membership)>

## Motion

- <interaction → preset / recipe (motion.md), row in motion-matrix.md>

## Validation

| Check | Result |
|---|---|
| `npm run verify` | <pass / fail + note> |
| `npm run lint:tokens -- -v src/flows/<flow>` | <…> |
| `node scripts/check-duplicates.mjs src/flows/<flow>` | <…> |
| `npm run skill:check` | <…> |
| `check:routes` / journeys | <…> |
| Screenshots vs reference | <compared with … / no reference: rendered, not visually verified> |
| Craft gate (`craft-rubric.md`) | <pattern file + 2–3 references compared; failed checks → fixes; open items> |
