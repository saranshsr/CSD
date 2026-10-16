# Onboarding and sign-in

Sign-in should feel like a two-step formality: type your number, type the code, then you're back where you were. The
best apps ask for one thing per screen and pre-fill the country. The numeric keypad comes up with the field already
focused, the code autofills from Messages, and resend is on a visible timer. Permissions and first-run questions are
framed as a benefit, with an obvious alternative. An average flow opens with a wall of fields, buries the phone option
under social logins, makes you tap Submit after typing the code, and fires the system location prompt cold.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Airbnb · log in or sign up](https://mobbin.com/screens/80b459e6-da95-4a46-a7c3-fd67f311ac2a) | A sheet titled "Log in or sign up" (one entry point for both). A grouped field: Country/Region ("United States (+1)") stacked on Phone number, a one-line note ("We'll call or text to confirm your number…"), one full-width Continue, an "or" divider, then four outlined "Continue with email / Apple / Google / Facebook" rows | Login and sign-up are one door, so nobody has to know if they have an account. One filled primary, all alternatives outlined and the same width. The country is a pre-filled row, not a separate step |
| [Revolut · 6-digit code](https://mobbin.com/screens/35b44a81-5e79-42a9-9aca-22f79773d90e) | Title "6-digit code", "Enter the code sent to +65 ···· 2332", six boxes split 3 – 3 with the first focused, "Choose another method" link. The keypad shows "From Messages 864-522" above it | The masked number confirms where the code went without showing all of it. Grouping 3 + 3 makes the code easy to read. iOS one-time-code autofill offers the code, and there's no Submit button |
| [Careem · enter phone number](https://mobbin.com/screens/9e152a9d-d027-4a1e-9bf5-938b6f627c74) | "Enter phone number" / "Enter your number to create an account or log in", flag + code with an underlined input, an "I am a tourist" switch, then two channel buttons: filled "Send code via WhatsApp" and outlined "Send code via SMS". The numeric keypad is open | Regional fit: WhatsApp is the primary channel and SMS is the fallback. The CTAs stay disabled until the number is valid ([empty state](https://mobbin.com/screens/d155b604-6266-4de6-9f29-86d38afca9fc)), so you can't submit a bad number |
| [Careem · verify your mobile number](https://mobbin.com/screens/62e485a1-a3a7-4d61-af16-2419f1d1302d) | "Verify your mobile number", "You will receive a WhatsApp message with a verification pin on … **Edit number**", four large underlined digits, and a disabled "Resend code 01:44" pill | The countdown says exactly when resend comes back. "Edit number" sits right in the sentence, so fixing a typo is one tap and not a back-navigation |
| [Uber Eats · find stores near you](https://mobbin.com/screens/0acc307e-d01e-499b-9936-d1fcf6988991) | Before the system prompt: a single map-pin illustration, "Find stores near you", "Browse local food, groceries, and more.", primary "Share location", secondary "Enter address" | A permission ask framed as the benefit, with an equal manual path. The OS dialog only appears after the user has chosen to share |
| [Duolingo · first-run question](https://mobbin.com/screens/1a2c3854-ea7a-41fa-ab1b-95466c2c0228) | Progress bar at the top, the question in a speech bubble, seven full-width selectable rows (emoji + label + checkbox, selected rows tinted with a blue border), and Continue pinned at the bottom | One question per screen, with a progress bar that shows how long it is. It started with "Just 7 quick questions" ([intro](https://mobbin.com/screens/74201708-1b1b-4b6d-b804-92f9eb2d65c9)). Rows are big tap targets and the selected state is clear |

## What great looks like (the bar)

- One field or one question per screen. The title says the task ("Enter phone number", "6-digit code"), with one line
  of secondary copy under it.
- Phone first, with the country code pre-filled from locale (flag + "+971"), and the numeric keypad open with the field
  focused on arrival.
- The primary CTA stays disabled until the input is valid. It sits above the keyboard or pinned at the bottom, never
  under the fold.
- OTP: segmented boxes (4–6), masked destination ("+971 ···· 4567") with an inline Edit, `autocomplete="one-time-code"`,
  and it submits itself on the last digit. No Submit button.
- Resend shows a live countdown ("Resend code 01:44") and offers another channel (WhatsApp / SMS / call) when it
  unlocks.
- Social or email options are outlined, the same width, and below an "or" divider. The phone path is the only filled
  button.
- Permission priming: benefit title + one line + "Allow" primary + a real alternative ("Enter address"). The OS prompt
  comes only after the tap.
- Sign-in mid-journey (cart, wishlist, checkout) is a sheet that returns the user to the same place, with the benefit in
  the title ([Careem · "Just one step to go!"](https://mobbin.com/screens/10f6f9ce-f485-4ef1-a550-a293708a37a6)).

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Sign-in sheet (mid-journey) | `presentation: 'sheet'` + `SheetHeader` / `SheetBody` / `SheetFooter` | Grabber, so no X. When it closes, `nav.back()` returns the user to the screen that asked |
| Full-screen step | `<Screen header={<Header variant="field" />} footer={…}>` | Title `Text variant="title"`, helper `Text variant="body" color="textSecondary"` |
| Phone field | `TextField label="Mobile number" inputMode="tel" autoComplete="tel" leftSlot={flag + code}` | `error` string for invalid numbers. The country is a `ListRow variant="field"` that opens a sheet with `SearchInput variant="field"` |
| Continue / send code | `ActionBar layout="single"` (or `stacked` for WhatsApp + SMS) | `primary.disabled` until valid, `loading` while sending |
| Social / email options | `Button variant="fieldSecondaryNeutral" fieldSize="H48" block` + `Divider` with "or" | Same width, all outlined. Never filled |
| OTP boxes | follow `src/flows/checkout/ProviderBurnOtpScreen.tsx` (6 segmented boxes + resend timer) | Hidden `<input autoComplete="one-time-code" inputMode="numeric">` drives the boxes. Submit runs on the last digit |
| Resend timer | `Button variant="fieldText"` disabled with a countdown label | "Resend code 0:42" → enabled "Resend code" / "Get code via SMS" |
| Wrong code | `TextField`-style error state on the boxes + `nav.toast(…, { type: 'error' })` only for network failures | Shake + clear, and keep focus |
| Permission priming | `Screen` with illustration (`src/assets/<flow>/`), `Text variant="title"`, `ActionBar layout="stacked" tone="neutral"` | "Allow location" primary, "Enter address" secondary → `address` flow |
| First-run question rows | `ListRow variant="field"` with `Checkbox variant="field"` or `Radio` | Selected row tint + border from `field` tokens. Progress with a thin bar on `--nk-field-*` |
| Signed-out entry | `src/flows/account/SignedOutScreen.tsx` | The existing hero + Login/Sign up CTA. Link new sign-in steps from it |

## Avoid

- Separate "Log in" and "Sign up" doors that make people guess whether they have an account.
- Email + password + confirm password on the first screen.
- A Submit button after the code that the user has to tap, or a code field that ignores OS autofill.
- Resend that's either hidden or tappable straight away (spam), with no timer.
- Three filled brand buttons (Apple, Google, Facebook) competing with the primary path.
- Firing the system location or notification prompt on launch, before the user has seen why.
- Dropping the user on home after a sign-in that started from the cart or checkout.
- Onboarding carousels of feature marketing before the user can do anything. Ask only what changes the next screen.

Last researched: 2026-10-14
