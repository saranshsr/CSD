import type { TokenOverrides } from '../../foundations/tokens';
import { palette } from '../../foundations/palette';
import { appleSpring } from '../../motion/presets';

/**
 * Coupon-scoped search (BEAUTY10) values with no central token: the three designs layered on the kit's search and
 * listing (Context band · Eligible row · Auto-suggestion, team file Iteration 1 / 2). Geometry in px, times in seconds.
 * Springs are Apple (response, dampingFraction) through `appleSpring`, critically damped unless they are a thrown object.
 */
export const csTokens = {
  band: {
    /** the white sheet's top radius while the band is up; it flattens before the closing green would meet it */
    sheetRadius: 20,
    /** the sheet's top padding: constant, so the search bar never shifts inside it */
    sheetPad: 16,
    /** the band slot starts this far above the status bar's bottom edge, so the closed sheet puts the bar at the kit's spot */
    tuck: 12,
    /** the green's bottom edge stays this far under the rising sheet (its corners always sit on green) */
    lip: 24,
    /** below this progress the green wipes up behind the status bar */
    wipeAt: 0.5,
    /** progress where the green is fully gone */
    goneAt: 0.1,
    /** corners flatten between these progress values */
    cornersFrom: 0.36,
    /** the copy drifts up this far as the sheet covers it (parallax, never clipped) */
    drift: 10,
    /** status-bar ink flips when the green behind it is taller than this */
    inkAt: 40,
    /** ✕: critically damped, unhurried, so the rise and the wipe read as one move */
    close: appleSpring(0.85, 1),
    /** a release after a drag: the dock settle, velocity handed over */
    release: appleSpring(0.47, 0.94),
    /** the band making way for results (and coming back): quick, no bounce */
    makeWay: appleSpring(0.38, 1),
    /** back from results: the band returns this long after the results layer has faded */
    returnDelay: 0.18,
  },
  toggle: {
    track: { w: 34, h: 20 },
    knob: 16,
    inset: 2,
    /** the knob stretches toward its travel direction while pressed */
    stretch: 6,
    /* springs: the kit's roles (EligibleRow): knob `fieldMotion.spring.springLight`, stretch `spring.press` in /
       `supermall.springs.return` out */
    /** the surface the row sits on: 343 wide, min 56 high */
    rowWidth: 343,
    /** scope change: suggestions cross-dissolve, no direction */
    dissolve: 0.2,
  },
  /** Eligible row v2 (Figma Typing · on/off): the DS switch one step up, 42×24 (knob 20, inset 2), on a 64-high row */
  toggleV2: {
    track: { w: 42, h: 24 },
    knob: 20,
    inset: 2,
    stretch: 6,
    rowWidth: 343,
    /**
     * Shared by the five choreographies (`&tg=1..5`, EligibleRow; 5 is the default): the knob is UISwitch, critically damped at the
     * Field `springLight` response (ω = √300 → 0.363s), so a tap lands with no settle; the 6px press stretch stays on
     * `spring.press` in / `supermall.springs.return` out. Every value below is a spring or tween on a MotionValue, so a
     * tap mid-flight reverses from what is on screen, with its velocity.
     */
    knobSpring: appleSpring(0.363, 1),
    /** while the knob is dragged, the row's surface chases it */
    chase: appleSpring(0.16, 1),
    /** reduced motion: the knob snaps and the row cross-fades uniformly, this long; nothing moves */
    fade: 0.15,
    /**
     * `tg=1` Track becomes the row. One material, Dynamic Island style: the green leaves the switch track as the
     * track's own paint and grows into the row's on-surface. Its two axes are independent springs (Apple: decompose 2D
     * motion): it swells around the switch first, where the walls are close, then reaches across the row; its ends stay
     * round (a capsule) while they travel and square off into the row's r12 corners only as they meet the walls. The
     * paint thins as it spreads (tint ∝ (track area ÷ its area)^dilute), so it is switch-green at the switch and the
     * row's mint by the time it lands. Off: the leading end retracts first, then the swell sinks back into the track; no tint.
     */
    morph: {
      /** it leaves the track ≈4 frames after the knob starts, once the track is mostly green (only from rest; a
          reversal turns at once) */
      lead: 0.07,
      /** on: the swell (top, bottom, switch end: walls ≤ 20px away). Both on-springs are lightly under-damped and the
          shape is clamped at the walls, so the material lands against them with its momentum instead of creeping in */
      swell: appleSpring(0.3, 0.86),
      /** on: the leading end, across the row (≈290px) */
      reach: appleSpring(0.5, 0.84),
      /** off: the leading end comes back first … */
      retract: appleSpring(0.3, 1),
      /** … and the swell sinks into the track a beat later */
      sink: appleSpring(0.3, 1),
      sinkDelay: 0.05,
      /** the switch-green thins as (track area ÷ area)^dilute: 0.55 ≈ with its length, so the capsule is still green
          as it clears the switch and mint by the time it lands */
      dilute: 0.55,
      /** it reaches full body at this many times the track's area (thin while it leaves the track) */
      body: 2.2,
      /** last share of each axis' travel over which its round end squares off into the row's corners */
      conform: 0.22,
      /** the tint follows direction: on while it grows, gone while it recedes */
      tint: { on: appleSpring(0.16, 1), off: appleSpring(0.12, 1) },
      /** the subtitle turns as the leading end crosses this many px of it; the badge as it crosses the badge */
      subSpan: 180,
      /** …and their inks follow on this spring, so a quick retract never pops a colour */
      inkFollow: appleSpring(0.1, 1),
    },
    /**
     * `tg=2` Light sweep (Apple Pay "Done", the Wallet card sheen). The switch and the row light up together, uniformly,
     * on the knob's beat; then one soft band of light, leaning like a reflection on a tilted card, crosses the row once
     * left → right. It is the light that delivers the value: the seal and then the subtitle, letter by letter, turn
     * green as it passes (a one-time "slide to unlock" shimmer through the text), and it glints off the switch on its
     * way out. Off: everything fades back together, calmer; no light.
     */
    sheen: {
      /** the surface, with the track */
      surface: appleSpring(0.28, 1),
      /** off */
      off: appleSpring(0.26, 1),
      /** the light sets off as the surface is ≈60% in */
      delay: 0.1,
      /** one pass across the row, on the Field ease-in-out (`fieldMotion.ease.easeInOut`) */
      sweep: 0.64,
      /** the band: px wide, leaning (deg) */
      width: 96,
      skew: -20,
      /** the copy turns across this many px around the light's centre */
      soft: 56,
      /** at the light's centre the subtitle's green lifts this many % toward white (the one-time shimmer) */
      glint: 45,
      /** off mid-pass: the light fades out this fast */
      fadeOut: 0.14,
    },
    /**
     * `tg=3` Stamp. The coupon seal leads: touch-down presses it in, the commit stamps it (a kick on a lightly
     * under-damped press spring) and turns it two lobes (90°; it has 8, so it lands on the same silhouette, the % stays
     * upright) on Apple's rotation spring, overshooting ≈1.5° and clicking home like a bezel detent. Ink lands at the
     * bottom of the press: the seal inks green and the ink floods out of it across the badge, one soft ring leaves from
     * behind the badge, and the surface washes left → right from the badge side to the switch. Off: the seal un-turns,
     * critically damped, and greys with the badge; the wash recedes back into the badge.
     */
    stamp: {
      /** the turn: Apple rotation (damping 0.8) */
      turn: appleSpring(0.5, 0.8),
      /** off: un-turns, no overshoot */
      unturn: appleSpring(0.34, 1),
      /** touch-down preload (scale) */
      preload: 0.94,
      /** the stamp: kicked from wherever the press is, it dips to ≈0.86 and springs back with ≈1.5% overshoot */
      press: appleSpring(0.42, 0.55),
      kick: 4,
      /** ink lands at the bottom of the press */
      impact: 0.07,
      /** the seal's ink, and the badge fill when there is no flood */
      ink: appleSpring(0.16, 1),
      inkOff: appleSpring(0.22, 1),
      /** off: the seal un-turns at once and greys a beat later, as the wash drains back into it */
      inkOffDelay: 0.06,
      /** the ink floods out of the seal across the badge: a disc from under the seal (px radius) past the badge's
          corners, with a slightly deeper crest; once past, it simply is the badge's fill */
      flood: { spring: appleSpring(0.3, 1), from: 7, to: 27, crest: 5 },
      /** one soft ring leaves from behind the badge: r px, scaled across `scale` on the strong ease-out (animate
          skill: cubic-bezier(0.23, 1, 0.32, 1)) while it flashes in and fades out to nothing as it slows */
      ring: { r: 24, scale: [0.9, 1.3] as [number, number], alpha: 0.8, duration: 0.42, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] },
      /** the wash: front feather in px */
      spread: { on: appleSpring(0.5, 1), off: appleSpring(0.3, 1), feather: 150 },
    },
    /**
     * `tg=4` Depth. The row is a physical card: it gives a little under the finger on touch-down; on, the colour fills
     * radially from the touch point while the card pops up toward you (1.5px lift, 1% grow, a soft green shadow it
     * casts) and settles back flat as the fill lands. Off: the fill drains back into the touch point and the card stays
     * flat. The pop is a kicked, critically damped spring, so it can be grabbed mid-air and never wobbles.
     */
    depth: {
      /** touch-down: scale −1.2% on `spring.press` */
      sink: 0.012,
      /** the pop: a kick on a critically damped spring, so it peaks 1/ω ≈ 0.1s after the commit and is flat again by
          ≈0.5s, as the fill lands; 1.5px up, 1% bigger, the shadow at full at the peak */
      lift: { spring: appleSpring(0.62, 1), px: 1.5, grow: 0.01 },
      /** off: anything still up settles flat, quick */
      settle: appleSpring(0.28, 1),
      /** the fill: a feathered radial front from the touch point (keyboard: the switch) */
      fill: { on: appleSpring(0.52, 1), off: appleSpring(0.3, 1), feather: 80 },
      /** the badge and subtitle inks follow the front on this spring, so a quick drain never pops a colour */
      inkFollow: appleSpring(0.1, 1),
    },
    /**
     * `tg=5` Spread + stamp (the default). The fill does the work, the stamp is its quiet full stop. The knob moves;
     * a beat later the row's green washes in from the icon side, left → right, through a wide soft front (≈95% of
     * the row, so it reads as a wash arriving, not a moving band), on an eased-in-out tween (no burst at the start, no
     * snap at the end), with the off hairline masked as its exact inverse. The subtitle
     * turns green as the front crosses it. The seal is geared to the knob: it turns 90° (8 lobes: same outline) on the
     * knob's own progress, with the barest dip at mid-travel, and inks green with the track as the knob passes
     * halfway. There is no badge container (the final row): the 28 seal sits bare in the row and the
     * row's green front passes behind it (no ripple, 30 Oct). Off: the seal un-turns with the knob and greys first, then the green
     * recedes right → left on the same eased shape and is gone at the left edge, quicker (0.3s). Nothing on the row moves or casts a shadow.
     */
    mix: {
      spread: {
        /** no lead: the eased start is the soft beat after the knob (a 0.05 lead on top of the ease-in left ≈7 frames of
            nothing); a reversal turns at once */
        lead: 0,
        /** on: a full fill takes `duration` s on a smooth ease-in-out (soft start, long gentle landing); from
            mid-flight (a reversal) it takes its share of that for the distance left, from where it is, so it never jumps */
        on: { duration: 0.5, ease: [0.45, 0, 0.2, 1] as [number, number, number, number] },
        /** off: recedes right → left, back to the left edge, on the same shape, quicker; a beat after the seal starts to
            grey (only from rest) */
        off: { duration: 0.3, ease: [0.45, 0, 0.2, 1] as [number, number, number, number] },
        /** a reversal never takes less than this */
        minDuration: 0.12,
        offDelay: 0.02,
        /** the front's soft edge, as a share of the row's width: wide, so the green reads as a wash (the far end is
            still fully green at rest: the masks drop there) */
        feather: 0.95,
        /** where the subtitle sits along the fill, measured from the left (0 = left edge, the icon side; 1 = switch
            edge): ≈ the middle of "Extra 10% off at checkout" (x ≈ 48–200 of 343 → 124); it turns green with the
            fill's own opacity there, so across the wide feather (≈ q 0.18 → 0.67: about 0.2s), never a pop */
        at: { value: 0.36 },
      },
      stamp: {
        /** the seal inks as the knob passes this share of its travel (≈0.1s), so it turns green with the track */
        inkAt: 0.5,
        /* the turn and the dip have no springs of their own: the seal is geared to the knob (EligibleRow), 90° across
           its travel, so it starts, moves and lands on the knob's frames, drags and reversals included */
        /** the barest dip, at mid-travel: scale 1 − dip·sin(π·knob) (0.96 halfway, 1 at both ends) */
        dip: 0.04,
        /** a glyph that can't turn (`&coupon=` wallet / bank: only the 8-lobed seal lands on its own outline at 90°)
            keeps the dip and the ink at `inkAt`, and instead of the turn settles `settle` px down at
            mid-travel, sin(π·knob), home at both ends: the stamp pressed in, nothing more */
        glyph: { settle: 0.5 },
        ink: appleSpring(0.16, 1),
        inkOff: appleSpring(0.2, 1),
      },
    },
    /**
     * `&offer=0`: a coupon with no value line ("Extra 10% off at checkout"). The row is one line, 56 high (12 padding
     * around a 32 badge; the 20 title line and the 24 switch sit centred), the badge 32 r8 with a 20 seal: the same 6px
     * seal inset as the 36 / 24 badge, so it reads as the same part one step down. Figma: Section 5 · Eligible row · no
     * offer line. Only what the geometry changes is here; every spring and colour is the two-line row's.
     */
    noOffer: {
      /** the flood, scaled with the badge (32 ÷ 36): from under the 20 seal to past the badge's corners (r 22.6) */
      flood: { from: 6, to: 24, crest: 5 },
    },
  },
  gesture: {
    /** px of travel before a press turns into a drag */
    slop: 10,
    /** UIScrollView normal deceleration (Apple `project()`) */
    decel: 0.998,
    /** UIKit rubber-band constant */
    rubber: 0.55,
  },
  /** the on-screen keyboard (team file M-Keyboard: iOS 26 light, 295.7 high on a 375 frame) */
  keyboard: {
    /** docks a beat after the screen arrives, on the dock spring (a touch of settle, no bounce) */
    dock: appleSpring(0.47, 0.94),
    dockDelay: 0.06,
    /** drops on the recede spring (never overshoots) */
    drop: appleSpring(0.37, 1),
    /** key popup grows out of the key, critically damped */
    popup: appleSpring(0.29, 1),
    /** the QuickType bar: off, as the frames draw the keyboard without it */
    quickType: false,
    /** wheel / trackpad travel that dismisses (keyboardDismissMode .onDrag) */
    wheelDismiss: 12,
  },
  scoped: {
    /** the scoped row leaves with the suggestion rows on a pick */
    exitTravel: 12,
  },
  /**
   * `&ne=1|2|3` (entrance.tsx): how the nudge appears, on the search page (Eligible row v2) and on results (the scope
   * chip), one system per value. No `ne`: today's behaviour, untouched. Each plays once per mount, after the screen's own
   * transition has settled; reduced motion: the resting look at once.
   */
  entrance: {
    /** search page: the presearch's own rise (handoff spring, ζ 0.81 ω 16.75, 20px) is within 0.5px after
        ln(20 ÷ 0.5) ÷ (ζω) ≈ 0.27s; the nudge starts then, after `presearchDelay` (via the bar = the layer's 0.189s
        cross-fade) */
    searchLanded: 0.27,
    /** results: the page under the bar fades in over `handoff.fade.reveal` (0.3s, CouponListing `belowBar`) */
    resultsAt: 0.3,
    /** ne=1 · seal leads: the seal fades in over the first part of its turn (the turn is `toggleV2.mix.spread.on`,
        0.5s); the words and the fill fade up `lag` behind it, `rise` px */
    seal: { fade: 0.18, lag: 0.08, rise: 3, bodyFade: 0.3, bodyMove: 0.42 },
    /** ne=2 · fill wipe: the toggle's feathered front from the seal side, on its 0.5s tween; the feather is a share of
        the nudge's width (the toggle's wash is 0.95: an entrance needs a front that reads as a wipe) */
    wipe: { feather: 0.45 },
    /** ne=3 · settle after content: the space opens on the toggle's tween (`mix.spread.on` curve; a critically damped
        spring left a 1–3px creep for 0.3s after it looked done); the nudge fades in over the last `reveal` px of the
        opening (≥ its 8 / 10px bottom padding, so the edge never cuts the row or the chip; a time-based fade did) */
    settle: { open: 0.5, reveal: 12 },
  },
  /**
   * `&na=1|2` (ScopeChip): one attention beat on the results scope chip, row v2, when no `ne` is set (an `ne` entrance
   * wins). Every time is in s from the seal's turn start, which keeps today's 0.2s delay after mount (ScopeChip
   * `TURN_DELAY`, ≈80% into the page's 0.3s fade). Plays once per results load; reduced motion: nothing moves.
   * `&nt=<ms>` (debug) freezes it that many ms after mount.
   */
  attention: {
    /** na=1 · code stamp (match): as the turn lands (≈98% turned at 0.41s), the code takes one press: a kick on a
        critically damped spring, 1 + amp·(τ/peak)·e^(1 − τ/peak), so it tops out `peak` s in and settles with no
        overshoot; exactly 1 from `settle` s on (by then < 0.1%). 4%, not 5: at 1.05 the 13pt code closed the word
        spaces either side of it at the peak */
    stamp: { at: 0.38, peak: 0.08, amp: 0.04, settle: 0.56 },
    /** na=2 · light pass (match): one band of the chip's own white end (`width` px, leaning `skew`°, at `opacity`)
        crosses the fill left → right with the turn, under the copy. Linear on purpose: it starts and ends off the chip,
        so what is seen is an even glide over the green (over the seal ≈0.1s in, past the green half as the turn lands)
        that melts into the white end; an eased curve rushed it through the green in ≈0.2s */
    light: { at: 0, duration: 0.85, ease: [0, 0, 1, 1] as [number, number, number, number], width: 36, skew: -12, opacity: 0.6 },
    /** na=1|2 · no match: the seal turns `angle`° and eases home, a quiet "no": out on a sine to
        `peakAt` of `duration`, back on a longer sine, both ends and the turn-back at rest velocity; no dip, no shake */
    no: { at: 0, angle: 45, duration: 0.6, peakAt: 0.4 },
  },
  /**
   * `&cn=1|2` (discover.tsx): a discovery nudge for the search's "Search within BEAUTY10 items only" toggle, on the
   * coupon page (BEAUTY10 eligible items, row / row v2). No `cn`: today's page, untouched. Every time is s after the
   * page mounts; each plays once per page visit (mount). Tapping the nudge opens the search with the toggle on.
   * Reduced motion: the end state at once. `&nt=<ms>` (debug) freezes the clock that many ms after mount.
   */
  discover: {
    /** the page has settled: the listing under the bar has faded in (`handoff.fade.reveal`, 0.3s) and the first cards
        have risen out of their skeletons */
    settle: 0.5,
    /**
     * cn=1 · Seal peek (Figma Iteration 4 "Seal button · beside search", 464:5013 peek / 467:5563 gone). A tab anchored
     * to the right screen edge on the bar's row (`visible` px wide, the bar's height and top), left corners r16, right
     * side running off the edge; the Eligible row v2 on-surface (success-subtle → green/50 at 97deg + its soft 1px
     * stroke) with the 28 seal in success. It slides in as the bar's right edge draws back to leave `gap`: ONE
     * critically damped spring (x = 1 − (1 + ωτ)e^(−ωτ), ω = 2π ÷ response) drives both, so they move as one; within
     * 0.7px of rest at `response` s. The seal takes the toggle's quarter-turn (`toggleV2.mix.spread.on`, 0.5s, with the
     * dip, clockwise like the toggle and the results chip) from `turnLag` s into the slide (the tab ≈50% in). It holds
     * `hold` s, then the same spring takes it back out and the bar grows back. Reduced motion: the tab rests in place
     * from the start (no slide, no turn, no exit), tappable.
     *
     * Height: Figma draws the tab 48 tall because its M-SearchBar is 48; the kit's bar (SearchInput, `searchBar.height`)
     * is 52, so the tab takes the bar's height (52, `.discTabClip` top 0 / bottom 0 on the bar's own box). The 48 visible
     * width and the 8 gap are Figma's.
     */
    peek: {
      visible: 48,
      gap: 8,
      /** the tab's left corners (Figma 481:11497, was 16): the search bar's own r12, smoothed (`corner-shape:
          superellipse(1.5)` ≈ Figma's 60% smoothing; browsers without it draw plain r12) */
      radius: 12,
      /** the slide in and out: response (s), critically damped */
      response: 0.45,
      turnLag: 0.12,
      turn: 90,
      /** from the slide's landing (settle + response) to the slide out */
      hold: 3.5,
      /** the clock runs this long past the slide out (the spring is < 0.05px from rest by then) */
      tail: 0.75,
      /** pointer-down feedback: the tab presses to `scale` over `duration` s and lets go the same way on up / cancel */
      press: { scale: 0.96, duration: 0.1 },
    },
    /**
     * cn=1 tap → coupon search: one horizontal gesture, out to the right and back in from it. The tab leaves to the
     * right, from wherever it is (a mid-peek tap starts there), on an ease-in-out weighted to leave (`ease`, `duration`:
     * it accelerates away instead of crawling off), and the bar grows back on the same curve and duration (one value).
     * The search opens on the tap itself: its bar reads the same value, so the kit's bar morph (transitions.ts, the 0.19s
     * layer cross-fade) crosses two identical bars while they finish together. Back: the kit's back onto a full-width
     * bar, no tab. Reduced motion: the tab stays put and the kit's plain cross-fade opens the search, no slide.
     */
    tap: { duration: 0.26, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] },
    /**
     * …and on the search, the Eligible row (on) slides in from just past the right screen edge (one device width, so
     * its left edge starts 16 beyond it) to its place on the iOS navigation curve (`ease`: a decisive start and a short,
     * soft landing, no crawl), `delay` s after the tap so it follows the tab's departure (the two overlap: one handover);
     * transform only, with its opacity easing out over the first `fadeShare` of the slide to soften the leading edge.
     * The seal rolls in on the same curve: anticlockwise in step with the distance left (a wheel rolling left), `roll`°
     * in all, a multiple of 45 so it lands on its own outline (8 lobes) at its exact resting rotation, the % upright
     * throughout (true distance ÷ radius would be ≈1,500°: too busy). Nothing else on the row moves.
     */
    slide: { duration: 0.65, ease: [0.32, 0.72, 0, 1] as [number, number, number, number], delay: 0.04, fadeShare: 0.25, roll: 180 },
    /**
     * cn=3 · Tooltip nudge (Figma Iteration 6 · Tooltip nudge, 506:4278): the cn=1 seal tab slides in on the same
     * spring and turn, and holds while the Origin M-Tooltip (Dark, tip Top · End) hangs under it, its pointer on the
     * seal's centre: "New: search only **CODE** items" over the coupon's value line. The tooltip enters once the seal
     * has landed (`at` s after the slide starts): opacity 0 → 1 and scale `fromScale` → 1 about its pointer tip, on a
     * spring with no bounce (`enter`). It stays `hold` s, or until the list scrolls or a tap lands anywhere else, then
     * leaves the way it came (`exit`: fade and a slight scale back into the pointer, eased in), and `outLag` s later the
     * seal slides back out as in cn=1 and the bar grows back: the page is today's again. Seal or tooltip tapped: the
     * cn=1 scoped entry (the tab leaves, the search opens with the toggle on); the bar tapped: today's search.
     * Plays on the first `visits` coupon-page visits, one counter for all coupons, and never again once the coupon
     * search was used (tipNudge.ts). Reduced motion: the tab rests in place, the tooltip fades in and out, the tab stays.
     * cn=4 (Figma 507:6722): the same tooltip and clock with no seal, on the bar's left edge, its pointer on the centre
     * of the placeholder word (tip Top · Beginning); the tooltip and, while it shows, the bar open the search toggle-on.
     */
    tip: {
      at: 0.45,
      hold: 5,
      enter: { type: 'spring', bounce: 0, duration: 0.35 } as const,
      exit: { duration: 0.18, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
      fromScale: 0.96,
      outLag: 0.1,
      visits: 3,
      /** the pointer tip sits `gap` under the bar; the tooltip's right edge `edge` from the screen's; `maxWidth` wraps
          long coupon names (the code stays on one line with "items") */
      gap: 4,
      edge: 8,
      maxWidth: 264,
      /** M-Tooltip's pointer: 12 × 6, its centre `pointerInset` + 6 from the tooltip's right edge = the seal's centre */
      pointerInset: 10,
    },
    /**
     * cn=5 / 6 · Tooltip nudge over an overlay (Figma Iteration 4 row 538:12277: 5 = A 538:12278 / tooltip 538:12404,
     * 6 = B 538:12707 / tooltip 538:14006; cn=7 shows A). A black scrim at 70% (Figma's fill rgba(0,0,0,0.7)) covers
     * the page; the stock search bar stays lit through a hole cut to its own box (Figma's "M-SearchBar · spotlit": the
     * bar itself, nothing added and nothing moving); the Light M-Tooltip hangs at the bar's left edge, its pointer tip
     * `gap` under the bar and its centre `pointerAt` in from the tooltip's left.
     *
     * Entrance, once the page has settled (`at` s after mount, the listing faded in): the scrim fades 0 → `scrim.opacity`
     * on a plain ease-out (`scrim.enter`); `tip.lag` s later the tooltip comes in from its pointer tip, opacity on
     * `tip.fade` and scale `tip.fromScale` → 1 on a no-bounce spring (`tip.enter`). Exit, the reverse and quicker:
     * the tooltip first (`tip.exit`, eased in, back into its pointer), the scrim `scrim.exitLag` s later
     * (`scrim.exit`). It goes after `hold` s, on a scroll or a tap on the scrim (the page is today's again), or on a
     * tap on the tooltip or the lit bar (the search opens with the toggle on: cn=3's scoped entry). Same 3-visit
     * counter as cn=3 / 4 (tipNudge.ts). Reduced motion: opacity only, `reduce` s each way.
     */
    overlay: {
      at: 0.45,
      hold: 5,
      scrim: {
        opacity: 0.7,
        enter: { duration: 0.3, ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] },
        exit: { duration: 0.2, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
        exitLag: 0.06,
      },
      tip: {
        lag: 0.1,
        fromScale: 0.96,
        enter: { type: 'spring', bounce: 0, duration: 0.35 } as const,
        fade: { duration: 0.2, ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] },
        exit: { duration: 0.16, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
      },
      reduce: 0.2,
      /** the pointer tip under the bar's bottom edge (Figma: bar bottom y114, tooltip y122) */
      gap: 8,
      /** the pointer's centre from the tooltip's left edge (the M-Tooltip's 72-wide pointer slot, its 12 × 6 tip at 44–56) */
      pointerAt: 50,
      /** Figma's widths: A 286, B 328. A grows with a longer value line up to `maxWidth` (the bar's 343); neither wraps */
      width: { a: 286, b: 328 },
      maxWidth: 343,
    },
  },
} as const;

/**
 * Flow overrides. Everything here is a value copied from the team Figma file that no Field DS / kit token carries
 * (checked against `palette.ts` / `tokens.ts` by exact value and by meaning); values the kit does carry are used
 * straight from the kit in the CSS / TSX and are not repeated here.
 */
export const couponsearchFlowTokens: TokenOverrides = {
  colors: {
    // this flow's page is white (kit default is the grey #F2F3F7); same value as the kit's `bgSurface`
    bgPage: palette.white,
    /** Figma value, no kit token: base/colour/green/50, end of the Eligible row "on" gradient */
    csGreen50: '#F6FEFB',
    /** Figma value, no kit token: start of the Eligible row "on" gradient (Typing · on) */
    csGreenOnStart: '#E7FAF2',
    /** Figma value, no DS token: Eligible row v2 "on" stroke, a vertical #CBF6E5 gradient (10% top → 40% bottom) */
    csBorderOnTop: 'rgba(203, 246, 229, 0.1)',
    csBorderOnBottom: 'rgba(203, 246, 229, 0.4)',
    /** Figma value, no DS token: eligible row coupon icon, off */
    csIconOff: '#9AA0B4',
    /** Figma value, no DS token: white over the band green, ✕ circle 18% (the 90% value copy is `palette.whiteAlpha90`) */
    csOnGreen18: 'rgba(255, 255, 255, 0.18)',
    /** Figma value, no DS token (currently unused): chip border */
    csChipBorder: '#EBEAEA',
    /** Figma value, no DS token (currently unused): card image placeholder */
    csCardImageBg: 'rgba(0, 40, 136, 0.03)',
    /** Figma value, no DS token (currently unused): ETA strip */
    csEta: '#1F20B7',
    csEtaShade: '#0E0E60',
    /** Figma value, no DS token: "viewed" chip on the presearch */
    csViewedBg: '#EBF2FF',
    csViewedInk: '#2959EB',
    /** Figma value, no DS token: category circle border */
    csCircleBorder: '#EDF0F2',
    /* M-Keyboard (iOS 26 light): iOS system colours, not noon DS, so no kit token applies (white keys use `palette.white`) */
    csKbBg: '#E6E9ED',
    csKbKeyDown: '#ABB0BC',
    csKbGlyph: '#595959',
    csKbReturn: '#0088FF',
    csKbReturnDown: '#0067D1',
    csKbReturnOff: '#A4A8B0',
    csKbBarGlyph: '#5E6B85',
    csKbSep: 'rgba(60, 60, 67, 0.22)',
    /** iOS: QuickType slot while pressed; key popup hairline edge and soft shadow */
    csKbQtDown: 'rgba(255, 255, 255, 0.72)',
    csKbPopEdge: 'rgba(0, 0, 0, 0.35)',
    csKbPopShadow: 'rgba(0, 0, 0, 0.14)',
  },
  type: {
    /** Figma value, no DS token: band / hero code tag */
    csText11BoldLh15: { size: 11, line: 15, weight: 700 },
    /** Figma value, no DS token (currently unused): card selling price */
    csText15BoldLh16: { size: 15, line: 16, weight: 700 },
    /** Figma value, no DS token (currently unused): Figtree chips (14 / 19.6 medium) */
    csText14MediumLh20: { size: 14, line: 20, weight: 500 },
  },
};
