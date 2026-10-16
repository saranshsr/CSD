# Field Design System — design record

## Request

- Problem: bring the components of the Field Design System (github.com/ayaneshu/field-design-system, noon's coded Origin DS) into the kit and reuse the kit's own components wherever one already does the job.
- Audience and entry point: designers and engineers building new Origin-era screens; sidebar → Design system → Field Design System.
- Outcome: every Field component is available as a kit component or an opt-in variant, with one page to see and try them all; existing screens render exactly as before.
- Size: large · Flow: `fieldds` · Neighbours read: `.claude/skills/noon-ui/references/field-ds.md`, `components.md`, `design-rules.md` §0

## Research

- Repo patterns: the Origin pieces already in the kit (navigator M-BottomSheet + `SheetHeader` / `SheetBody` / `SheetFooter`, `Snackbar` M-Toast, `EtaBadge` `_ETA`, `OriginIcon`), and the closest kit components per Field component (`field-ds.md` table).
- Mobbin: not needed: the source is noon's own design system code, not an external pattern.

## Approaches

Two choices were the user's: where to apply Field (kit + new screens vs migrating flows) and how (opt-in variants vs changing defaults). The user picked kit + new screens with opt-in variants, so the 1:1 ports are untouched.

## Decisions and assumptions

- Existing components get `variant="field*"` / `fieldSize` instead of a second copy — source: user, design-rules §0.
- New shared components only where the kit had none: `Radio`, `ActionBar`, `Accordion`, `TextField`, `TextArea` — source: field-ds.md (MISSING verdicts).
- Field colours are mapped by hex onto the existing palette (`field` token group); 8 missing values were added to `palette.ts` — source: @field-ds/tokens `semantic.ts`.
- The gallery is `truth: 'reference'` (Field source code) — source: repo convention.

## Design direction

| Section (top → bottom) | Component | Tokens / variant | Notes |
|---|---|---|---|
| header | `Header` | `variant="field"`, `align="left"`, `IconButton variant="fieldDefault"` | title + subtitle |
| buttons | `Button` | `fieldPrimary` … `fieldRound`, `fieldSize` | Continue shows the loading cross-fade |
| icon buttons | `IconButton` | `fieldDefault` / `fieldGhost` / `fieldAction`, size 36 | |
| selection | `Checkbox`, `Radio`, `Switch`, `Segmented` | `variant="field"` | |
| chips | `Pill` | `variant="fieldChip"` | add / clear |
| banners | `StatusChip` | `variant="field"`, 7 tones, sizes, shapes | |
| rating | `Stars` | `variant="field"` | |
| inputs | `SearchInput`, `TextField`, `TextArea` | `variant="field"` | email error state |
| lists | `ListRow`, `Accordion`, `Divider` | `variant="field"`, `emphasis` | |
| feedback | `Button` → `nav.toast` / `nav.sheet` / `nav.push` | `action: 'close'` | |
| footer | `ActionBar` | `layout="leadingTrailing"` | price + Add to cart |

New pieces (gap → closest existing → extension; flow-local or shared): none in the flow; the five new shared components above.

## States

| State | How it's shown | How the user leaves it |
|---|---|---|
| loading | Continue: label cross-fades to the spinner | finishes after 1.4s |
| empty | empty search / text fields show their placeholders | type |
| error | Email without "@": red border + message | fix the address |
| success | Add to cart → dark toast with ✕ | ✕ or auto-dismiss |
| disabled | disabled Button, IconButton, Checkbox, Switch, Pill, Stars, TextField | — |

## Navigation and state

- `gallery` is the entry; `nav.sheet('fieldds/sheet')`, `nav.push('fieldds/tabs')`, `nav.toast(…, { action: 'close' })`. State is local `useState`.

## Motion

- All from `fieldMotion` (`src/motion/presets.ts`): springLight thumbs and knobs, standard-ease accordion and borders, 0.98 press with snappy release.

## Validation

- Typecheck (app + lib), token lint, screenshots of every section, the sheet, the toast (✕ dismisses) and the bottom nav; visual snap of all 17 product flows before and after the change.
