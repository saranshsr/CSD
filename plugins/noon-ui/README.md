# noon-ui plugin (noon Flow Kit 0.1.0)

noon app design knowledge for Claude Code and other Agent Skills agents: design tokens, components, Origin Design System parts, motion, flow specs and the brain map, with a hub skill (`noon-ui`) and screen skills for home, search, PDP, cart, checkout, orders, returns, reviews, account and noon One.

**Generated.** This folder is built from the noon Flow Kit repo (`.claude/skills/`, `.claude/resources/`) by `npm run release:build`. Edit the source there, never here: `npm run release:check` fails when this folder is stale.

## Install in Claude Code

Prerequisites: Claude Code with plugin support (tested with 2.1.296), and read access to the GitHub repo `arnabdebnath07/noon-app-skill` (for a private repo, `git` must be able to clone it: `gh auth login` or an SSH key).

Inside Claude Code:

```
/plugin marketplace add arnabdebnath07/noon-app-skill
/plugin install noon-ui@noon-flow-kit
```

Or from a terminal:

```bash
claude plugin marketplace add arnabdebnath07/noon-app-skill
claude plugin install noon-ui@noon-flow-kit            # --scope project | local; default user
```

The marketplace lives in the kit repo, so adding it clones the repo. To fetch only what the plugin needs (skip the app's ~15 MB of assets): `claude plugin marketplace add arnabdebnath07/noon-app-skill --sparse .claude-plugin plugins`.

Start a new session (or run `/reload-plugins`). The skills are namespaced by the plugin: `/noon-ui:noon-ui`, `/noon-ui:home-page`, `/noon-ui:cart` …; Claude also loads them by description when you ask for a noon screen.

**Inside the kit repo itself you don't need the plugin**: the same skills load from `.claude/skills/` as `/noon-ui`, `/home-page` …. With both, each skill appears twice.

### Upload instead (Claude app → Your plugins → Upload local plugin)

In the kit repo run `npm run release:zip`; it writes `dist-plugin/noon-ui-<version>.zip` with `.claude-plugin/plugin.json` at the archive root, which is what the upload form needs. Upload that file. To update, upload the zip of the new version; an uploaded plugin does not update from the marketplace.

### Update, disable, remove

```bash
claude plugin marketplace update noon-flow-kit     # fetch the latest marketplace
claude plugin update noon-ui@noon-flow-kit         # install the new version (restart the session)
claude plugin disable noon-ui@noon-flow-kit        # keep it installed, stop loading it
claude plugin uninstall noon-ui@noon-flow-kit
claude plugin marketplace remove noon-flow-kit
```

### Troubleshooting

| Symptom | Fix |
|---|---|
| `marketplace add` fails to clone | check `git clone https://github.com/arnabdebnath07/noon-app-skill` works in the same shell (auth for a private repo) |
| `Plugin not found` on install | the id is `noon-ui@noon-flow-kit` (plugin @ marketplace); run `claude plugin marketplace list` |
| skills don't show up | new session or `/reload-plugins`; `claude plugin details noon-ui@noon-flow-kit` lists what loaded |
| two copies of each skill | inside the kit repo the project skills load too: disable the plugin there (`claude plugin disable noon-ui@noon-flow-kit`). Skills uploaded to the Claude app earlier (from `npm run skills:package`, listed as `anthropic-skills:noon-ui` …) also duplicate them: remove those in Settings → Skills |
| a skill mentions `src/…` or `npm run …` that doesn't exist | those refer to the kit repo; open a checkout of it, or treat them as reference |

## Other Agent Skills agents

`skills/` here is a standard Agent Skills package. Copy **all** its folders into the skills directory your agent reads (see its docs; for example a project-level or user-level `skills/` folder), keeping them side by side: the screen skills link to `../noon-ui/`. Then ask for a noon screen; the agent activates the skill by its description. What needs Claude Code or the kit repo is listed in `skills/noon-ui/resources/DISTRIBUTION.md`.

```bash
git clone https://github.com/arnabdebnath07/noon-app-skill
cp -R noon-app-skill/plugins/noon-ui/skills/* <your agent's skills directory>/
```

## Example: "build a Ramadan campaign home page"

1. The request matches the `home-page` description (home page, campaign landing), so the agent loads `home-page/SKILL.md`; its Sources table names the brain card first.
2. It reads `noon-ui/resources/brain/INDEX.md` (≈1k tokens): area Discovery → `flow:home`, entry `home/home`, URL `/homepage`, card `flows/home.md`.
3. It reads `noon-ui/resources/brain/flows/home.md`: the screen's module `src/flows/home/HomeScreen.tsx`, its flow components (`HomeHeader`, `HeroCarousel`, `ProductCarousel` …), shared components (`ProductCard`, `EtaBadge` …), token groups, motion (`Stagger`, `appleSpring`), nav out (`pdp/detail`, `plp/listing`, `search/search`), tests, and the exact `home-page/spec.md` line ranges.
4. It reads only those spec lines plus `home-page/references/figma-homepage-2025.md` for the campaign modules, and `noon-ui/references/tokens.md` / `components.md` for anything it adds.
5. Inside the kit repo it then runs `npm run brain -- context "ramadan campaign home"`, builds `home/campaign` from existing modules, and validates with `npm run check:routes` and `node .claude/skills/noon-ui/scripts/snap.mjs home`. Outside the repo it stops at a plan and the reference it can cite.
