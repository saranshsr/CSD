## What changed

<!-- one topic per PR -->

## Source of truth

<!-- bappzaar path @ master SHA, and/or Figma file + node id. Link the MAPPING.md section you added/updated. -->

## Screenshots

| Before | After | Source (app / Figma) |
|---|---|---|
|  |  |  |

## Checklist

- [ ] `npm run verify` (typecheck app + lib · token lint · lib build)
- [ ] `npm run assets:check`
- [ ] `npm run check:routes` (dev server running) — all clean
- [ ] `npm run visual:diff` shows only the intended changes
- [ ] No raw colours / font shorthands; new values added as tokens (flow `tokens.ts` or appended global)
- [ ] Prices use the dirham `currency` symbol
- [ ] New/changed screens have `source` + `notes` in the flow's `index.ts`; `MAPPING.md` updated
- [ ] CHANGELOG.md updated under **Unreleased** (if users would notice)
