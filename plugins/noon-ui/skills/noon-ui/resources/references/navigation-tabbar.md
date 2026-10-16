# Navigation: tab bar and headers

Navigation should be felt, not read: the tab bar says where you are in the app, the header says where you are in the
stack and how to get out. Average apps give every screen the same opaque bar, a centred title and a row of icons.
Great ones (and iOS 26 itself) float a glass tab bar over the content, mark the selection with a shape rather than a
colour change, reserve large titles for roots, keep back as a single round control top-left (X only for things
presented modally), group trailing actions into one capsule, and let headers dissolve over media. noon's tab bar is
already the floating Liquid Glass platter; this file is about using it, and the headers above it, well.

## References

| App · screen | What it does | Why it's world-class |
|---|---|---|
| [Apple Music · Playlists](https://mobbin.com/screens/143196a8-2649-49db-8333-fffbdc9029a8) | Round back button top-left; the three trailing actions (+, filter, more) share one capsule; large "Playlists" title with a search field under it; a floating tab platter (Home, New, Radio, Library) with a lens behind Library, search as a separate circle, a mini-player capsule docked above | Every piece of chrome is a floating object with one job; the selection is a lens shape, and docked UI stacks above the bar instead of fighting it |
| [Apple Music · Show page](https://mobbin.com/screens/84d9d9e0-5e3a-4692-b43b-7ea8f2f5b2df) | Hero image runs to the top edge; back and share float as circles over it; the content list scrolls behind the floating tab bar | No header bar at all over media: controls float, the image owns the top |
| [App Store · Today](https://mobbin.com/screens/7c72906e-4907-4653-8404-7079d9340752) | Large "Today" title with the date in grey on the same baseline, avatar on the right, cards below; [scrolled](https://mobbin.com/screens/a7328568-299c-4961-b1c4-4a01485c6e99), the large title has gone and the content runs under a blurred status area | The large title is content that scrolls away, not a permanent bar; the account entry is the avatar, not a tab |
| [Linear · Inbox](https://mobbin.com/screens/3d9ccfd8-2425-49e9-a00b-27189140d3a3) | Left-aligned "Inbox" title with compose and more in one capsule; a floating four-icon tab platter with a blue unread dot on Inbox, search as its own circle; a toast docks above the bar | Icon-only tabs that work because the glyphs are distinct; status is a dot, not a number |
| [Airbnb · Explore](https://mobbin.com/screens/4f347fd4-5793-41df-a0d9-b29fe02131cc) | Five labelled tabs with the active one in the accent colour and a red dot on Profile; at the top a search pill and Homes / Experiences / Services as illustrated tabs with an underline and NEW badges | Two levels of navigation kept apart: the bar switches sections of the app, the top tabs switch the catalogue |
| [Uber · Settings](https://mobbin.com/screens/39b5270b-994a-4e31-a711-f16f0de5f5e1) | A modally presented page: X top-left, large "Settings" title, profile row, list | X means "this was presented over you", back means "this was pushed"; Uber never mixes them |

## What great looks like (the bar)

- 4–5 tab destinations; the selected tab is marked by a shape (lens, filled glyph), not only by colour, and icon-only
  bars only work with unmistakable glyphs.
- The bar floats: content scrolls behind it, and docked UI (mini-player, toast, sticky CTA) sits above it with a
  visible gap, never overlapping.
- Status on a tab is a dot or a small count badge; it never changes the tab's label or icon.
- Large titles (about 28–34 bold, left-aligned) only on tab roots and settings-style pages; they scroll away, and pushed
  detail screens use a compact header.
- Back is a single round control top-left on pushed screens; X top-left only for modally presented pages and tall
  sheets. Never both.
- Trailing actions: at most three, grouped in one capsule (Apple Music, Linear); more goes behind "more".
- Over media, there is no header bar: back / share float as round glass buttons on the image.

## Build it with noon

| Element | noon component / token | Note |
|---|---|---|
| Floating glass tab bar | `TabBar` (default Liquid Glass), configured by `defineFlow({ tabBar: { tab, screens } })` | Never render it yourself on a tab root; pass `withTabBar` to `Screen` |
| Hide on scroll | `tabBar.scrollHide` (default true) / `--nk-tab-hide` | Docked footers follow it via `ActionBar aboveTabBar` |
| Content under the bar | `GlassFade` (the bar brings one) | A glass footer that brings its own fade sets `data-glass-footer` |
| Sticky CTA above the bar | `ActionBar surface="glass" aboveTabBar` inside `<Screen floatingFooter>` | Sits `--nk-tab-bar-floating-gap` (10) above the platter |
| Cart badge | automatic from `useDemoStore().cartCount` | Don't add a second badge |
| Pushed screen header | `Header title` (auto back when `nav.canGoBack`) | Set `parent` on the screen so Back works on direct open |
| Modal page close | `Header back={false} right={<IconButton icon="close" variant="plain" onPress={nav.back} label="Close" />} align="left"` | `account/DeletionScreen.tsx` pattern |
| Origin-era page header | `Header variant="field"` | Title / title-centre only; search, location headers stay bespoke |
| Large title on a root | `Text variant="titleLarge"` as the first content block, `Header` title shown once `Screen onScroll` passes it | The kit `Header` has no built-in large title |
| Controls over a hero | `Screen overlayHeader safeTop={false}` + `IconButton variant="glass"` | PDP gallery pattern |
| Trailing actions | `Header right` with up to two `IconButton`s | Badge counts via `IconButton badge` |
| Second-level tabs (catalogue) | `Segmented variant="field"` or `Pill` / `PillRow` in `Header children` | Keep them out of the tab bar |
| Tab switch / push motion | registered transitions in `src/motion/custom/index.ts`, presets from `src/motion/presets.ts` | The tab lens slide is built in |

## Avoid

- An opaque full-width bar with labels on new screens (that is `variant="classic"`, for 1:1 ports only).
- Selection shown only by tint, or a tab whose label changes with state.
- Large titles on every pushed screen; a large title and a compact title visible at once.
- Back and X on the same header; X on a pushed screen.
- Four or more loose trailing icons; a cart icon in the header of a tab root that already has the cart tab.
- A header bar painted over hero media.
- Docked CTAs or toasts overlapping the floating bar.

Last researched: 2026-10-14
