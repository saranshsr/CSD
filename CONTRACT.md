# BEAUTY10 coupon-search prototype — build contract

Stack: Vite + React 18 (JSX, no TS) + `motion` (import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react').
Canvas: one iPhone screen, 375×812 CSS px, rendered inside <DeviceFrame>. Font: Noontree (see src/styles/base.css). Colours: CSS vars in base.css (semantic) and tokens.css (DS base palette). Currency: write the literal text "dhm" — Noontree renders it as the dirham glyph.
Motion: ONLY use presets from src/motion.js (springs). No linear/ease tweens except opacity fades ≤150ms. Everything interruptible. Press feedback via <Pressable>.
Figma source of truth: file V0pMgz05GY8WpmGAPFEEc3, section "BEAUTY10 — coupon search flow" (2321:96370). Frames:
  01 Cart 2333:98074 · 02 Coupons 2333:363127 · 03 Coupons scrolled/Shop more 2333:370512 · 04 Eligible items PLP 2321:96371
  05 Search "se" 2328:97194 · 06 Search "serum" 2328:97370 · 07 Results serum 2327:96495 · 08 Search "seiko watch" 2328:96704 · 09 Fallback noon.com 2328:96969
  Reference PLP card: 2323:154300 (in frame 2323:154274).

## Flow (App.jsx owns it — don't change the flow, only screens)
cart --tap "View all coupons & offers"--> coupons sheet opens over cart
coupons sheet --tap "Shop more" on BEAUTY10--> sheet closes, push plp
plp --tap search bar--> push search {query:'', script:'serum'} (transition 'morph': search bar shared element, layoutId "search-bar")
search --each keyboard key tap types next char of script; tap coupon card or a suggestion--> replace with results {query}
results --tap search bar--> push search {query, script:'seiko watch', replaceOnFirstKey:true} (morph)
results(scope 'noon') shows "Showing results for “q” in noon.com"; results(scope 'coupon') shows "… in BEAUTY10 items"
back chevrons / iOS edge swipe --> nav.pop()

## Props every screen receives
{ nav, params } where nav = { push(id, params, {transition:'push'|'morph'}), pop(), replace(id, params, opts), openSheet(), closeSheet(), sheetOpen }

## Shared components (src/components) — Shell agent owns these files
- <DeviceFrame>{children}</DeviceFrame> — 375×812 viewport scaled to fit window, rounded device, home indicator.
- <NavStack routes={[{key,id,params,transition}]} renderRoute={(route)=>node} onBack={fn}/> — iOS push/pop (spring.push, covered screen parallax PARALLAX + dim DIM), edge-swipe-back from left 20px, 'morph' transition = cross-fade + shared layout (LayoutGroup) for layoutId "search-bar".
- <Sheet open onClose top={96}>{children}</Sheet> — bottom sheet, spring.sheet, backdrop dim 0.4, drag handle, drag-to-dismiss with velocity, inner scroll area.
- <Keyboard visible onKey={(ch)=>} onBackspace onReturn/> — iOS light keyboard (QWERTY, 291px incl. bottom bar), slides with spring.keyboard, key-press popup bubble.
- <StatusBar tone="dark"|"light"/> (44px; time 9:41, signal, wifi, battery)
- <SearchBar layoutId="search-bar" value placeholder="Search" state="placeholder"|"typing"|"typed" onBack onTap onClear trailing="camera"|"clear"|"none"/> — 48px, radius 12, 1px border var(--border-primary), back chevron, caret blink when typing.
- <BottomNav active="home"|"categories"|"deals"|"profile"|"cart" cartCount={2}/> (85px incl. home indicator)
- <Pressable onTap className style ...rest>{children}</Pressable> — motion.button, whileTap scale PRESS_SCALE with spring.press.
- <Icon name size color/> — renders /assets/icons/{name}.svg as CSS mask (so color works). Names: chevron-left, chevron-right, camera, cross-circle, arrow-up-left, discount, sort, filter, share, heart, plus, star, bolt, arrow-down-circle, search, home, categories, deals, profile, cart, preferences, caret-down.

## Screen ownership (one agent each — edit ONLY your files)
- Screens A: src/screens/Cart.jsx, src/screens/Coupons.jsx (+ css), public/assets/screens/*
- Screens B: src/screens/PLP.jsx, src/screens/Results.jsx, src/components/ProductCard.jsx (+ css), public/assets/plp/*
- Screens C: src/screens/Search.jsx, src/components/CouponCard.jsx, src/components/SuggestionRow.jsx (+ css)
- Assets: public/assets/icons/*, public/assets/logos/*, public/assets/banner/*
- Integrator (main): App.jsx, main.jsx, data.js, motion.js, base.css, this file.
Data/copy lives in src/data.js — import from there; if you need new data, put it at the top of your own screen file.
