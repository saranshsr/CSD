# Releasing the noon-ui plugin and skills package

The noon Flow Kit ships its design knowledge three ways, all built from one source:

| Output | Built by | For |
|---|---|---|
| `plugins/noon-ui/` + `.claude-plugin/marketplace.json` | `npm run release:build` | Claude Code (GitHub marketplace) and, via `plugins/noon-ui/skills/`, any agent that reads Agent Skills |
| `dist-plugin/noon-ui-<version>.zip` | `npm run release:zip` | uploading the whole plugin in the Claude app (Your plugins → Upload local plugin); manifest at the archive root |
| `dist-skills/<skill>.zip` | `npm run skills:package` | uploading single skills to the Claude app (Settings → Skills) |
| `@noon/flow-kit` npm package (`dist-lib/`) | `npm run build:lib` | the React kit itself |

**Source of truth:** `.claude/skills/` (skills) and `.claude/resources/` (brain map, briefs, indexes). Never edit `plugins/noon-ui/` or the marketplace file by hand: `npm run release:check` (in CI) fails when they don't match a fresh build. `npm run resources:build` rebuilds the brain map **and** the plugin, so the usual "edit a skill → `resources:build` → `skill:check`" loop keeps it current.

## Versioning

- One version for everything: `package.json` → `plugin.json` → the marketplace entry and its metadata (the build copies it; the check fails if they differ). Semver:
  - **patch**: copy, spec or reference fixes, regenerated cards
  - **minor**: a new skill, screen, component, token group or reference; anything additive
  - **major**: a renamed or removed skill, a changed skill name, or a breaking change to the kit's package exports
- Bump `version` for every release users should get: installs are recorded per version, so an unchanged version is not a new release.

## Release steps

```bash
git checkout main && git pull
# 1. move CHANGELOG.md "Unreleased" under "## [X.Y.Z] - YYYY-MM-DD"
npm version X.Y.Z --no-git-tag-version      # package.json (+ lockfile)
npm run resources:build                      # brain map + plugins/noon-ui + marketplace.json at X.Y.Z
npm run skill:check && npm run verify        # skills match the code; kit typecheck / lint / build
npm run release:check -- --release           # metadata, versions, paths, duplicates, claude plugin validate --strict, CHANGELOG section
git add -A && git commit -m "release: noon-ui X.Y.Z"
git push origin main
claude plugin tag plugins/noon-ui --push     # creates and pushes noon-ui--vX.Y.Z (checks plugin.json ↔ marketplace agree)
```

Users then get it with `claude plugin marketplace update noon-flow-kit` and `claude plugin update noon-ui@noon-flow-kit`, then a new session.

## What the checks cover

| Check | Command | Runs in |
|---|---|---|
| Plugin + marketplace current with the source | `npm run release:check` (step 1) | CI, locally |
| SKILL.md frontmatter (name = folder, lowercase-hyphen ≤ 64, description 1–1024, no angle brackets), unique names | `release:check` | CI, locally |
| Versions agree; semver | `release:check` | CI, locally |
| Marketplace entries point at real plugin folders with matching names; no duplicate entries | `release:check` | CI, locally |
| Every path in the package resolves inside it, or is a real repo path | `release:check` | CI, locally |
| No duplicate files in the package | `release:check` | CI, locally |
| Claude Code's own schema validation | `claude plugin validate --strict plugins/noon-ui` and `… .` (run by `release:check` when the CLI is installed) | locally (CI has no Claude Code CLI) |
| Skills match the kit (paths, tokens, routes, counts, brain map) | `npm run skill:check` | CI, locally |

## Local install test (before pushing)

```bash
claude plugin marketplace add ./              # this checkout as a marketplace
claude plugin install noon-ui@noon-flow-kit
claude plugin details noon-ui@noon-flow-kit   # expect 11 skills, 0 hooks / MCP servers / agents
# in a new session outside the repo: the skills appear as noon-ui:<skill>, e.g. /noon-ui:home-page
claude plugin uninstall noon-ui@noon-flow-kit && claude plugin marketplace remove noon-flow-kit
```
