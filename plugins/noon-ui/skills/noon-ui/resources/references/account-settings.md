# Account and settings

The account hub answers "who am I here, what do I have, and where do I change things" in one scroll; inner settings
pages let someone change one thing and know it took. Average apps dump 20 identical rows with chevrons under a grey
avatar. Great ones lead with identity and the two or three things worth money or attention (credits, membership,
orders), show the current value of every setting in the row itself, keep immediate toggles apart from drill-ins, put
destructive actions in their own quiet group, and confirm every change on the spot.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Airbnb · Profile hub](https://mobbin.com/screens/8f7c5b27-db62-48f9-a403-7b8bdba1253b) | Large "Profile" title, a centred identity card (avatar with a verified badge, name, city), two square tiles (Past trips, Connections, each with a NEW chip), a "Become a host" card, then the menu list; a dark "Switch to hosting" pill floats above the tab bar | Identity first, then the two most visited destinations as big tiles, then the long tail as a list: three tiers of weight, not one flat list |
| [Airbnb · Account settings](https://mobbin.com/screens/936fbfe8-4c12-4c69-95f0-6c56b7dede64) | Circle back button, large title, nine one-line rows (outline icon, label, chevron), a hairline, then the app version in small muted text | Ruthless restraint: no subtitles, no colours, no badges; every row is a noun you can scan in one pass |
| [Airbnb · Privacy](https://mobbin.com/screens/8844090e-5af0-4999-8bba-d2500ee1efa1) | Large title plus a one-sentence explanation; sections (Read receipts, Listings, Reviews) each with a heading, toggle rows whose second line states the consequence, inline "Learn more" links, dividers between sections | Every toggle tells you what flipping it does before you flip it; the explanation lives in the row, not behind an info icon |
| [Uber · Account hub](https://mobbin.com/screens/b5becf3a-7859-4932-a272-b5523dab5ddb) | Name with rating and Verified chips and avatar on the right; three equal tiles (Help, Wallet, Activity); an Uber Cash row with "$25.00" right-aligned; one "Try Uber One free" card with illustration; "Safety checkup" with a 3/7 progress ring | Values and progress are on the surface (balance, 3/7) so the hub is useful without tapping; exactly one membership upsell |
| [Uber · Account security](https://mobbin.com/screens/a559ef12-be3b-4b14-a4e0-a1daa2b954e6) | A recommended-actions list (2-step verification, Phone number, Email, Passkeys) with a green check per item and the state as the second line ("On", "You have 1 passkey"); a dark toast "2-step verification is on." confirms the change | Security reads as a status checklist, not a menu; the change is confirmed twice, by the toast now and by the row's state forever |
| [Revolut · Settings](https://mobbin.com/screens/8e0fc660-1ed3-44fb-abc8-55adc6ae5778) | X close and large title; headed groups (General, Stocks, Robo-Advisor) as rounded cards; rows with icon, title and a description; a toggle with an inline "Learn more"; "Close stocks account" alone in its own card in red text | Destructive actions are physically separated, text-only and red, so they can't be mis-tapped as a normal row |

## What great looks like (the bar)

- The hub opens with identity (avatar, name, one status chip such as verified or member), then 2–3 large shortcut tiles
  for the most used destinations, then grouped lists. Never a single undifferentiated list.
- Rows show their current value or progress on the surface: balances right-aligned (Uber Cash $25.00), progress as a
  ring or "3/7", state as the second line ("On", "You have 1 passkey", "SGD").
- A row is either a drill-in (chevron) or an immediate setting (toggle), never both; toggle rows carry a one-line
  consequence and, if needed, an inline "Learn more", not a separate info screen.
- Groups hold 2–6 rows under a short heading; inner settings pages open with a large left-aligned title and at most one
  sentence of explanation.
- Destructive actions (sign out, close account, delete) sit in their own group at the end, text-only in the danger
  colour, no icon, no chevron.
- Every change is confirmed in place: a short past-tense toast ("2-step verification is on.") and the row's new state.
- At most one upsell card in the hub (one membership, one referral), with an illustration on the trailing edge.
- The list ends quietly: version string or legal links in small muted text, nothing after it.

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Identity card with completion ring and noon One strip | account `ProfileCard` + `EditRing` (`src/flows/account/components/`) | Membership state from `useMembership()`; don't rebuild the card for a new account variant |
| Shortcut tiles (My Orders, My Wishlist) | account `ActionCards` | Keep to 2–3 tiles; the tile is the drill-in, no extra chevron |
| Credits / balance row | `ListRow` with `right={<Money value={…} bold />}` | Dirham sign via `Money`, never "AED" |
| Menu group on the account hub | account `MenuGroup` / `AccountSection` | Existing flow; new settings-style screens use `ListGroup` + `ListRow` (or `ListRow variant="field"`) |
| Toggle setting row | `ListRow` with `right={<Switch as="span" … />}` and `chevron={false}`, or `Switch variant="field"` on Origin-era screens | Row owns the tap; the subtitle is the consequence line |
| Inline "Learn more" | `Button variant="noonGhost"` or `HtmlText` link inside the subtitle | Keep it on the same line as the explanation |
| Status per security item | `ListRow` `subtitle="On"` + `StatusChip variant="field"` (success tone) or an `OriginIcon` check as `iconNode` | Mirrors the Uber checklist; state text, not just colour |
| Section heading | `Text variant="section"` (16/700) above the group | 24 above, 8 below |
| Inner settings page | `Screen` + `Header title align="left"`; pushed pages get the auto back, modal ones `back={false}` + `IconButton icon="close"` | Set `parent: 'account/account'` so Back works on direct open |
| Destructive row | `ListRow danger chevron={false}` in its own `ListGroup`; confirm with an Origin sheet (`SignOutSheet` pattern) whose primary is `Button variant="danger"` | Never inline with normal rows |
| Change confirmation | `nav.toast('Password changed', { type: 'success' })` | Past tense, one line; plus the row's updated value |
| Help entry | `NeedHelpButton` via `Screen overlay` | Folds into its icon on scroll |

## Avoid

- One flat list of 15+ rows with identical weight and no grouping.
- Rows that hide their value ("Language >") when the value fits ("Language · English").
- A chevron on a toggle row, or a toggle that opens another screen.
- Sign out or delete styled like every other row, or placed mid-list.
- Info icons that open a modal to explain a toggle; put the sentence in the row.
- Several promo banners competing in the hub (membership plus referral plus app rating plus survey).
- Silent saves: a setting changes and nothing on screen says so.

Last researched: 2026-10-14
