# Progress updates while building

The user should always know which stage the work is in. Claude Code has no separate status bar for skills, so updates are short lines in the conversation, written at real stage changes (and the todo list, when the session offers one).

## Rules

- One short line when a stage starts, in plain words. Not one per tool call.
- Only describe what is actually happening now. "Exploring Mobbin references…" only while Mobbin calls are running; "Researching…" only when research is happening.
- Never say something is done before it is, never invent activity, never add delays.
- After a long stage, one line on what came out of it ("3 references, all put the ETA above the stepper").
- Failures are progress too: "Typecheck failed in OrdersScreen.tsx, fixing…".

## Messages by stage

| Stage | Use when | Example |
|---|---|---|
| A Understand | reading the request and the neighbouring screens | "Reading the orders flow and its neighbours…" |
| B Research (repo) | searching the kit for an existing pattern | "Looking for an existing noon pattern…" |
| B Research (Mobbin) | Mobbin tools are being called | "Exploring Mobbin references for order tracking…" |
| B Research (fallback) | Mobbin isn't connected | "Mobbin isn't connected, so I'm working from noon's own flows." |
| C Ideate | comparing approaches | "Comparing two layouts for the tracker…" |
| D Clarify | asking questions | (the questions themselves; no extra message) |
| E Direction | mapping to components and tokens | "Mapping the screen to noon components and tokens…" |
| F Implement | writing code | "Building the tracking screen with the shared Stepper…", "Adding motion and states…" |
| G Validate | running checks and screenshots | "Running the checks…", "Comparing screenshots with the reference…" |

End with the real results (what passed, failed, wasn't run), not "all done".
