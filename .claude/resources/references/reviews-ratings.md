# Reviews and ratings

Ratings have two sides. The writing side gets a rating out of someone who just got their order: the stars come first,
the rest unlocks only after that, chips do most of the typing, and photos and text are optional extras. The reading
side has to answer "is this good, and for people like me?" at a glance: big average, distribution bars, photos from
buyers, then filters and sort, then the reviews. An average flow opens with an empty text box and a required word
count. On the reading side it shows the average with no distribution, then a wall of unfiltered text.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Uber Eats · rate your order (stars filled)](https://mobbin.com/screens/3aa95f00-4d94-4440-8d23-ea566a5d0d13) | "Rate this store / How did you like Jack in the Box?", five large stars (all filled), "Select at least one option", grey chips (Diner fare, Creative options, Sustainable packaging…), a placeholder text area ("Write a review to help others find their new favorite place."), then "Rate item" rows with thumbs down/up per dish, "Add Photos" and a pinned black Submit | Stars first, then chips that match the store, so a review takes three taps. Text is optional. Each line item gets a cheap thumbs rating instead of a second star row |
| [Uber Eats · rate your order (courier)](https://mobbin.com/screens/a8a8f766-5cfa-444a-a21d-f871bb1301f5) | Large "Rate your order" title with order context (store, date) and item thumbnails top right. "Rate your courier" with two big thumbs buttons (up selected, filled black), then chips (Easy to retrieve order, Delivered with care, Friendly service…), a tip row, and unrated store stars below | Different things get different scales: thumbs for the person, stars for the store. Picking thumbs up shows positive chips |
| [Uber · add a tip and rate your trip](https://mobbin.com/screens/af273512-5746-402e-b78a-4c89235aaedf) | A sheet over the home screen (Skip top right): avatar, "Add a tip for …", "Your trip was $7.81", $1 / $3 / $5 pills + "Enter Custom Amount", divider, "Rate your trip", the trip date, five outlined stars, and a disabled Submit | It asks once, at the next app open, as a dismissible sheet. Submit stays disabled until a star is picked, and Skip is always visible |
| [Target · reviews](https://mobbin.com/screens/a325e04d-0a18-46e4-888d-ee77627fc9bc) | "Write a review" link in the header, "4.8 out of 5 based on 282 ratings", 5→1 star bars with percentages, ring scores for Would recommend / taste / quality / value, a "Review images" strip, "172 reviews" with Sort and Filter buttons, then the first review with title, stars, "Would recommend" and "Verified purchase" | The summary answers "is it good?" and "good at what?" before any text. Photos come before reviews. Every review shows trust signals (verified purchase) |
| [Urban Company · reviews sheet](https://mobbin.com/screens/1f5e14a9-5ac1-4f69-a6c9-d71f02626556) | "★4.92 / 86 reviews", 5→1 bars with raw counts (80, 6, 0, 0, 0), "Customer photos & videos" thumbnails, "All reviews" + Filter with chips (With media, Most detailed, In my area), and the reviewer row showing what they bought with a green score badge | The filter chips match what buyers actually look for (media, detail, local). Each review says which variant or service it was about |
| [Apple Podcasts · ratings & reviews](https://mobbin.com/screens/f1c60075-17b6-4953-80e3-8ffd7cf7c77a) | Huge "4.9 out of 5" next to a compact star histogram and "65 Ratings". Below it "Rating Added. Thank you!" over a tap-to-rate star row, a "Write a Review" link, then review cards (title, stars, date, author, body) | Rating is one tap right in the summary, with confirmation in place. Writing is a separate, optional link. The summary uses one big number and no extra chrome |

## What great looks like (the bar)

- The rating comes first and is one tap: 5 stars of at least 32px with ≥8px gaps, centred or left on a 16 margin.
  Everything else stays hidden or disabled until a star is picked.
- After the stars, chips that change with the score (positive picks for 4–5, problems for 1–2). "Select at least one
  option" is the only required step.
- Text and photos are optional and clearly labelled that way: a placeholder that says why ("help others find…"), and
  "Add Photos" as a secondary pill.
- One pinned Submit, disabled until the minimum is met. Skip or close is always visible when the prompt wasn't asked for.
- Order context sits at the top (store / product name, date, thumbnail), so the user knows what they're rating.
- Reading summary: a big average (32–48 bold) + total count, 5→1 distribution bars with % or counts, then buyer photos,
  then a sort and filter row, then reviews.
- Each review has stars, a short title or first line, date, variant bought, a "Verified purchase" type signal, and a
  Helpful action. The body stops at 4–5 lines with "More".
- Thanks shows up in place ("Rating Added. Thank you!") or as a short success moment, never a dead-end page.

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Rating input | `Stars variant="field" size={32} onChange clearable` (Origin RatingInput) | `reviews` flow uses flow-local `StarRatingInput` (`src/flows/reviews/components/`). Reuse it inside that flow |
| Read-only stars | `Stars value size={16}` | Not the PDP-local `Stars` (`rating` prop). The shared one takes `value` |
| Score pill on cards / PDP | `RatingPill rating count size="lg"` | Star colour comes from `starColor`. Use `compact(n)` for "1.2K ratings" |
| Quick-pick chips | `Pill variant="fieldChip" selected` in a wrap row, or flow-local `AttributeChips` | Chips change with the score. Selected state from Field tokens |
| Optional text | `TextArea placeholder maxLength showCounter` or flow-local `ReviewTextField` | Don't set a minimum length. Write with AI is `AiToggle` in `reviews` |
| Photos | flow-local `AddPhotos` (`src/flows/reviews/components/AddPhotos.tsx`) | Secondary pill with a camera icon (`OriginIcon`) |
| Per-item thumbs | `IconButton variant="fieldDefault" size={40}` pair | Selected = filled. Use for line items, not the main rating |
| Submit | `ActionBar layout="single"` (`primary.disabled` until rated) or flow-local `ReviewFooter` | `loading` while posting |
| Rating prompt after delivery | sheet with `SheetHeader` / `SheetBody` / `SheetFooter` | Grabber, so no X. Swipe away is the skip |
| Thanks | `Lottie name="reviewCheck"` (or `SubmittedScreen` in `reviews`) + `nav.toast` for in-place ratings | Short. Return the user to where they were |
| Review summary block | `SectionCard` with big `Text variant="hero"` average + distribution bars (`--nk-color-*` star tokens, r999 track) | PDP version already exists: `SfReviewsCard` (`src/flows/pdp/components/storefront/`) |
| Sort / filter row | `PillRow` of `Pill variant="fieldChip"` (With photos, 5★, Verified…) + sort sheet | Use the Origin sheet for sort options (`Radio`) |
| Review list item | `Text variant="bodyBold"` title, `Stars`, `Text variant="caption" color="textSecondary"` meta, `StatusChip variant="field" tone="success"` for verified, `Divider` between | Clamp the body to 4 lines with a "More" link (`Button variant="noonGhost"`) |

## Avoid

- An empty text box first, or a minimum character count before you can submit.
- Five separate star rows (quality, value, delivery…) on one screen. Use one rating plus chips.
- Showing the average without the distribution or the count. "4.5" from 3 ratings and from 3,000 aren't the same.
- Review photos buried after the text list, or no way to filter to reviews with photos.
- A rating prompt with no Skip, or one that shows every launch.
- Reviews that don't say which variant or size was bought, or that show no trust signal.
- A thank-you page that leaves the user stuck. Go back to the order or product.

Last researched: 2026-10-14
