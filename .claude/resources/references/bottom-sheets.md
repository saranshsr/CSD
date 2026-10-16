# Bottom sheets

A sheet asks one question without taking the user out of the page they were on: pick an option, confirm a consequence,
or finish a short task. Average sheets are full-screen modals in disguise: a close X, a grabber, a long title, three
buttons and a scroll. Great ones size to their content, keep the page visible under the scrim, phrase the title as the
decision, put the selection mark on the trailing edge of a fully tappable row, and pin exactly one primary whose label
says what will happen. In noon the frame is fixed: the Origin M-BottomSheet (grabber above the sheet, 12px floating
inset, r16 corners, max 680), and the screen only fills `SheetHeader` / `SheetBody` / `SheetFooter`.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Uber Eats · Dining options](https://mobbin.com/screens/19cdd03d-e7e4-4c7e-835a-243391a05d2b) | A short sheet over the dimmed feed: centred title, two rows (Delivery, Pickup) with leading glyphs, a green check on the selected row, one full-width "Confirm delivery" button | Smallest possible sheet for a two-way choice; the CTA label echoes the current selection, so the button itself confirms what you picked |
| [Revolut · Confirm transfer](https://mobbin.com/screens/e417be9d-5c9f-4028-9ec6-139d19373885) | Grabber, left-aligned question "Are the payee and transfer details correct?", one line "Once confirmed, the payment can't be unsent", white "Send" over grey "No, go back" | A confirmation in three lines: question, consequence, two verb buttons; the review screen stays visible behind it |
| [Revolut · Subscription added](https://mobbin.com/screens/ed20f8bf-d544-4092-8ece-78f7410be9ef) | The same sheet frame after the action: check mark, "Your subscription was added!", an explanation, "Go to my subscriptions" and "Go to inactive" | The result lands in the sheet that asked, and both buttons are next steps, not "OK" |
| [Instacart · Sort](https://mobbin.com/screens/912e8f27-ad0c-4da7-a49d-697474c923a9) | Grabber, left title "Sort", three radio options, split footer: grey "Reset" and green "Show results" | The canonical filter footer: neutral reset and outcome-named apply side by side, results visible above the sheet |
| [Airbnb · When? (dates)](https://mobbin.com/screens/32d05e81-2ee9-449b-82f5-fb9825f4b9f6) | A floating card in the search flow: the "Where" step collapsed into a summary row above, large "When?", a Dates / Months / Flexible segmented control, a calendar with past dates struck, flexibility chips (Exact dates, ± 1 day, ± 2 days), footer "Reset" text link and "Next" | Multi-step without stacking sheets: finished steps collapse into summary rows, the current step expands, the footer never moves |
| [Airbnb · Select a time](https://mobbin.com/screens/e4fff56f-b88d-4e5f-9d84-4b423ec7e108) | Tall sheet with X, large title, guest stepper, month row, selectable time cards (time, price per guest, "10 spots left"), footer "$25 for 1 guest" + "Next" | A task-length sheet earns the X and the height; the running price sits in the footer next to the CTA |

## What great looks like (the bar)

- Height follows content: a 2–3 option picker uses about a third of the screen; the page stays visible under the scrim
  so the user keeps context (Uber, Instacart, Revolut).
- The title is the decision, as a noun or question ("Dining options", "Sort", "Are the payee and transfer
  details correct?"); left-aligned when it is a question or longer than three words.
- Whole rows are the tap target; the selection mark (check or radio) is on the trailing edge in one column; action
  rows (add new, see all) have no selector.
- One pinned primary, full width; the secondary is quieter (grey fill or a text link "Reset") and never the same weight.
- Button labels name the outcome ("Confirm delivery", "Show results", "Send" / "No, go back", "Keep account open" /
  "Close account"), never "OK" / "Cancel" pairs; the danger colour only when the action destroys something.
- Confirmations are three lines: question, one-sentence consequence, buttons. No illustration needed.
- Multi-step and result states swap content inside the same sheet (collapsed summary rows above, success state after the
  action); a second sheet never stacks on the first.
- A grabber sheet has no X; the X appears only on tall, task-length or blocking sheets (Airbnb Select a time).
- Price or count for the choice sits in the footer's leading slot beside the CTA.

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Sheet frame (scrim, grabber, 12 inset, r16, max 680) | `presentation: 'sheet'` or `nav.sheet(route, params)` | Navigator draws it; the screen renders only the slots, no `<Screen>` |
| Title / question | `SheetHeader title subtitle align` | 48 high; no close X while there is a grabber |
| Blocking confirm or form with unsaved input | `sheet: { grabber: false }` (+ `dismissible: false`) | Grabber goes, `SheetHeader` shows the 44×44 X |
| Single-choice rows | `Pressable` row + `Radio` (trailing, no `onChange`), or `ListRow variant="field"` with `trailing` | Whole row taps; close with `nav.back()` after a short beat when there is no CTA |
| Multi-choice rows | `Pressable` row + `Checkbox variant="field"` | Count goes in the primary label ("Show 128 results") |
| Edge-to-edge list | `SheetBody inset={false}` | `ListRow` brings its own padding |
| One primary (+ quieter secondary) | `SheetFooter primary={{ label, onPress }} secondary={…}` | Stacked M-StackedActionBar; primary is `bright` H52 r12 |
| Reset + Apply | `SheetFooter layout="split" tone="neutral"` | Same as `ActionBar layout="split"` |
| Price beside the CTA | `SheetFooter layout="leadingTrailing" leading={<Money value={…} bold />}` | Dirham sign from `Money` |
| Destructive confirm | `SheetFooter` with a `Button variant="danger"` primary as `children` | Only for sign out / delete / remove |
| Mode switch inside a sheet | `Segmented variant="field"` | Dates / Months style |
| Quick-pick chips | `Pill variant="fieldChip"` in `PillRow` | Flexibility chips, slot chips |
| Quantity in a sheet | `QuantityStepper` | Guests-style row |
| Success after the action | swap `SheetBody` content in place; `Lottie name="atcCheck"` / `orderConfirmedCheck` played once | One sheet at a time; PDP `AddedSheet` is the model |
| Dismiss from code | `useSheet().dismiss` | Returns `null` outside a sheet |

## Avoid

- A grabber and a close X on the same sheet.
- Sheets that fill the screen for a two-option choice, or that hide the page they act on.
- "OK" / "Cancel" button pairs, two primaries, or a secondary as loud as the primary.
- Radios on the leading edge of some rows and trailing on others; tiny tap targets on just the radio.
- Stacking a second sheet on a sheet; close the first or swap content.
- A success "dialog" after a sheet closes when the sheet itself could show the result.
- Restyling an existing `sheet: 'classic'` bappzaar port to this pattern without being asked.

Last researched: 2026-10-14
