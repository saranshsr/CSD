# UI research with Mobbin

Mobbin is a library of real app screens and flows. Through its MCP server Claude can search it during stage B of `design-workflow.md`. It is a **research reference only**: noon's tokens, components, icons and existing flows stay the source of truth.

## Start from the library

`.claude/resources/references/` already holds the researched bar for the common patterns (one file per pattern, Mobbin-linked). Read that file first; search Mobbin only for what it doesn't cover, and add what you find back to it (same template, `Last researched` date) so the next task starts there.

## Is Mobbin available?

1. Look for the tools `mcp__mobbin__search_screens` and `mcp__mobbin__search_flows` in the session (if tools load on demand, run a tool search for "mobbin").
2. Not listed → **unavailable**. A listed tool whose call fails (auth, network, quota) → **unavailable** for this task.
3. Say which it is in one line ("Mobbin isn't connected, so I'm using the repo's patterns" / "Researching on Mobbin…"). Never describe Mobbin results you didn't get.

The user connects it once in Claude Code (`claude mcp add` with the Mobbin server and their account); the repo can't do it for them.

## Unavailable: fall back, don't block

Work from the repo (closest noon flow, `.claude/resources/flows/`, the flow's MAPPING docs, earlier `DESIGN.md` research) and whatever the user shared. Ask for a reference only when the pattern is genuinely new to noon and the choice matters. Write `Mobbin: not available` in `DESIGN.md` → Research. Never stop the task because Mobbin is missing.

## When to search

- The pattern is new to noon (a loyalty tier ladder, a referral tracker, a subscription pause flow), or the user asks for research or alternatives.
- Skip it for 1:1 ports, small changes, and patterns noon already has (reuse the noon version).
- Reuse what's recorded: if `DESIGN.md` or a resource brief already answers it, don't search again.

## How to search

| Tool | Use for | Key arguments |
|---|---|---|
| `mcp__mobbin__search_screens` | one screen ("order tracking with delivery stepper and rider contact") | `query`, `platform: "ios"`, `limit` 5–10, `mode` (`standard` fast, `deep` scored) |
| `mcp__mobbin__search_flows` | a multi-step journey ("subscription checkout with plan selection") | `query`, `platform: "ios"`, `limit` 3–5 |

- `platform: "ios"`: noon is a mobile app.
- `output_destination: "code"` and the same short `task_intent` sentence on every call of one task (no user data in it).
- One intent per query; describe elements, not styles ("modern" doesn't help). Name an app to see its version ("talabat order tracking").
- Prefer regional and commerce peers when relevant (talabat, Careem, Amazon, Instacart, Shop); compare 3–6 references, not one.
- Look at the returned images; don't summarise from metadata.

## What to record

In `src/flows/<flow>/DESIGN.md` → Research (or the reply for medium requests):

```md
| Reference | Pattern seen | Use for noon | Avoid |
|---|---|---|---|
| [talabat · tracking](https://mobbin.com/screens/<id>) | stepper inside the ETA card, rider row with chat + call | ETA + stepper together; rider actions as one row | orange brand art, illustrated sheet |
```

- Cite each reference with its `mobbin_url`. Don't commit Mobbin images to the repo or hotlink `image_url` (it expires); links only.
- End with "Takeaways for noon": the 2–4 patterns that fit, mapped to noon components (`component-checklist.md`).

## Translating to noon

- Take **structure and interaction** (what's grouped, what's primary, how the user moves), never branding: no colours, fonts, icons, illustrations, copy or component styling from another product.
- Map every borrowed idea to an existing noon component, token and motion preset. If none fits, that's a gap: say so and follow the component checklist.
- When a reference conflicts with how noon already does something, noon wins unless the user asks to change noon's behaviour.
