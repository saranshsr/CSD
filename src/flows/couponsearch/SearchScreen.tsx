import { animate, motion, useMotionValue, type AnimationPlaybackControls, type Variants } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Screen } from '../../components';
import { preloadRoutes } from '../../kit/lazyScreen';
import { useIsTop, useNav, useParams } from '../../kit/Navigator';
import { handoff } from '../../motion/presets';
import { useReduceMotion } from '../../motion/reducedMotion';
import { BlurSwap } from '../../motion/recipes';
// the kit's search choreography values (src/flows/search); the rows and the presearch are the team file's
import { searchTokens as st } from '../search/tokens';
import { CsSearchBar } from './components/CsSearchBar';
import { CsSuggestionRow } from './components/CsSuggestionRow';
import { Presearch } from './components/Presearch';
import { KEYBOARD_HEIGHT, Keyboard } from './components/Keyboard';
import { clamp, project } from './gesture';
import { BandHeader, type BandHeaderHandle } from './components/BandHeader';
import { EligibleRow } from './components/EligibleRow';
import { ScopedRow } from './components/ScopedRow';
import { MAX_ROWS, copy, suggest, suggestMixed, type Scope, type Suggestion } from './data';
import { CouponContext, csCoupons, useCoupon } from './couponContext';
import { csStore, useCs, type CsVariant } from './store';
import { csTokens } from './tokens';
import styles from './search.module.css';

type Phase = 'idle' | 'showing' | 'hiding' | 'leaving';
interface Rows {
  list: Suggestion[];
  /** per slot: entry delay for a row falling in / crossfade delay for a row whose suggestion changed */
  delay: number[];
  /** bumps when a slot appears again, so it shows its new content without a crossfade */
  epoch: number[];
  /** a scope change (the eligible toggle): rows cross-dissolve in place, no direction */
  dissolve: boolean;
}
type SlotCustom = { d: number; dissolve: boolean };

const empty: Rows = { list: [], delay: [], epoch: Array(MAX_ROWS).fill(0), dissolve: false };
const searchFor = (s: string): Suggestion => ({ text: `Search for "${s}"` });
const isSearchFor = (s: Suggestion) => s.text.startsWith('Search for "');
/** what the suggestions come from: a scope, or h2's BEAUTY10-first list with an all-of-noon section */
type ListScope = Scope | 'mixed';
const listFor = (q: string, scope: ListScope): Suggestion[] => {
  const s = q.trim();
  if (!s) return [];
  const hit = scope === 'mixed' ? suggestMixed(q) : suggest(q, scope);
  return hit.length ? hit : [searchFor(s)];
};
const keyOf = (l: Suggestion[]) => l.map((s) => `${s.section ? '§' : ''}${s.text}`).join('|');
const dissolveT = { duration: csTokens.toggle.dissolve, ease: handoff.easeInOut };

/** One suggestion slot (the kit's): in (falls 20px on the handoff spring), out (lifts 20px), gone (spare row), fast (exit into results); a scope change only dissolves. */
const slot: Variants = {
  in: ({ d, dissolve }: SlotCustom) =>
    dissolve
      ? { opacity: 1, y: 0, transition: { y: { duration: 0 }, opacity: dissolveT } }
      : { opacity: 1, y: 0, transition: { y: { ...handoff.spring, delay: d }, opacity: { duration: handoff.fade.out, ease: handoff.easeOut, delay: d } } },
  out: ({ d }: SlotCustom) => ({
    opacity: 0,
    y: -handoff.travel,
    transition: { y: { ...handoff.spring, delay: d }, opacity: { duration: handoff.fade.io, ease: handoff.easeInOut, delay: d } },
    transitionEnd: { y: -handoff.travel },
  }),
  gone: ({ d, dissolve }: SlotCustom) =>
    dissolve
      ? { opacity: 0, transition: dissolveT, transitionEnd: { y: -handoff.travel } }
      : { opacity: 0, y: -st.goneTravel, transition: { duration: st.goneFade, ease: handoff.easeInOut, delay: d }, transitionEnd: { y: -handoff.travel } },
  fast: ({ d }: SlotCustom) => ({
    opacity: 0,
    y: -st.fastExit.travel,
    transition: { y: { duration: st.fastExit.move, ease: handoff.easeInOut, delay: d }, opacity: { duration: st.fastExit.fade, ease: handoff.easeInOut, delay: d } },
    transitionEnd: { y: -handoff.travel },
  }),
};

/** Presearch (recent + trending): rises 20px on push / when the field is cleared, sinks 20px on the first keystroke. */
const presearch: Variants = {
  in: (d: number) => ({ opacity: 1, y: 0, transition: { y: { ...handoff.spring, delay: d }, opacity: { duration: handoff.fade.out, ease: handoff.easeOut, delay: d } } }),
  out: { opacity: 0, y: handoff.travel, transition: { y: handoff.spring, opacity: { duration: handoff.fade.io, ease: handoff.easeInOut } } },
};

/** Our pieces above the rows (eligible row, scoped row): rise with the presearch on push, leave with the rows into results. */
const chrome: Variants = {
  in: (d: number) => ({ opacity: 1, y: 0, transition: { y: { ...handoff.spring, delay: d }, opacity: { duration: handoff.fade.out, ease: handoff.easeOut, delay: d } } }),
  fast: (d: number) => ({
    opacity: 0,
    y: -st.fastExit.travel,
    transition: { y: { duration: st.fastExit.move, ease: handoff.easeInOut, delay: d }, opacity: { duration: st.fastExit.fade, ease: handoff.easeInOut, delay: d } },
  }),
};

/** The coupon search: one screen per version (remounted in place when the version switch changes). */
export function SearchScreen() {
  const variant = useCs((s) => s.variant);
  const { coupon } = useParams<{ coupon?: string }>();
  return (
    <CouponContext.Provider value={csCoupons[coupon ?? ''] ?? csCoupons.beauty10}>
      <CouponSearch key={variant} variant={variant} />
    </CouponContext.Provider>
  );
}

/**
 * The kit's search (src/flows/search/SearchScreen.tsx, NoonSearchScreen on the Brand Widget PLP handoff) started from
 * BEAUTY10's eligible items. Same choreography: presearch rises on push and sinks on the first keystroke, rows fall in
 * top → bottom, changed rows crossfade (BlurSwap), the field cleared sends them back bottom → top, a pick fills the
 * field, the rows leave fast and the results fade in under the same search bar (`results-fade`).
 * Presearch is always Recent Searches + Trending searches. On top:
 *  · h2  Context band over the search sheet; suggestions and results are BEAUTY10-eligible
 *  · row Eligible row under the bar; on = eligible, off = all of noon (remembered for the visit); a flip cross-dissolves
 *  · n5  Scoped row leads the typeahead (and the empty screen); suggestions and Enter search all of noon, the row
 *        searches the eligible items, and on the empty screen it goes back to them
 */
function CouponSearch({ variant }: { variant: CsVariant }) {
  const nav = useNav();
  // `normal`: the team file's "Normal search" frames (no coupon context), for comparison
  const params = useParams<{ q?: string; normal?: string }>();
  const normal = !!params.normal;
  const eligibleOnly = useCs((s) => s.eligibleOnly);
  // h2: the band lives with this search: ✕ lasts until the search is opened again (results and back keep it)
  const [bandOn, setBandOn] = useState(true);
  const banded = variant === 'h2' && !normal && bandOn;
  // h2 with the band: BEAUTY10 suggestions first, then all of noon; after ✕ a normal all-of-noon search
  const scope: ListScope = normal ? 'all' : variant === 'h2' ? (bandOn ? 'mixed' : 'all') : variant === 'row' && eligibleOnly ? 'eligible' : 'all';
  const scopeRef = useRef(scope);
  scopeRef.current = scope;
  const [q, setQ] = useState(params.q ?? '');
  const [fill, setFill] = useState<{ from: number; key: number }>();
  const [phase, setPhaseState] = useState<Phase>('idle');
  const [rows, setRows] = useState<Rows>(empty);
  const [presearchDelay, setPresearchDelay] = useState(params.q ? 0 : st.presearchPushDelay);
  const phaseRef = useRef<Phase>('idle');
  const rowsRef = useRef(rows);
  const hideEnd = useRef(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const band = useRef<BandHeaderHandle>(null);
  const lastShown = useRef<(Suggestion | undefined)[]>([]);
  rowsRef.current = rows;
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  /** put `list` in the slots: new rows fall in after the ones already up, changed rows crossfade */
  const commit = useCallback((list: Suggestion[], fromHidden: boolean, dissolve = false) => {
    const prev = rowsRef.current;
    const up = fromHidden ? 0 : prev.list.length;
    let fresh = 0;
    let changed = 0;
    setRows({
      list,
      delay: dissolve ? list.map(() => 0) : list.map((s, i) => (i >= up ? fresh++ * st.rowStagger : prev.list[i]?.text !== s.text ? changed++ * st.crossfadeStep : 0)),
      epoch: prev.epoch.map((e, i) => (i >= up && i < list.length ? e + 1 : e)),
      dissolve,
    });
  }, []);

  // the kit's suggestion state machine, run on every keystroke
  const update = useCallback(
    (value: string) => {
      if (phaseRef.current === 'leaving') return () => undefined;
      const list = listFor(value, scopeRef.current);
      let t: ReturnType<typeof setTimeout> | undefined;
      if (list.length) {
        if (phaseRef.current === 'showing') {
          if (keyOf(list) !== keyOf(rowsRef.current.list)) t = setTimeout(() => commit(list, false), st.settleMs);
        } else {
          t = setTimeout(() => {
            commit(list, true);
            setPhase('showing');
          }, st.rowEnterDelay * 1000);
        }
      } else if (phaseRef.current === 'showing') {
        const n = rowsRef.current.list.length;
        hideEnd.current = performance.now() + ((n - 1) * st.rowOutStagger + handoff.fade.io) * 1000;
        setPhase('hiding');
      }
      if (!value.trim()) setPresearchDelay(Math.max(0, hideEnd.current - performance.now()) / 1000 + st.presearchGap);
      return () => clearTimeout(t);
    },
    [commit],
  );
  useEffect(() => update(q), [q, update]);

  // the eligible toggle flipped: the suggestions cross-dissolve to the other scope in place (no direction)
  const lastScope = useRef(scope);
  useEffect(() => {
    if (lastScope.current === scope) return;
    lastScope.current = scope;
    if (phaseRef.current !== 'showing') return;
    const list = listFor(q, scope);
    if (keyOf(list) !== keyOf(rowsRef.current.list)) commit(list, false, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  // the results page and the PDP are lazy chunks: fetch them now so the in-place hand-off never shows an empty frame
  useEffect(
    () =>
      preloadRoutes(
        () => import('./ResultsScreen'),
        () => import('../pdp/DetailScreen'),
      ),
    [],
  );

  // ---- the on-screen keyboard: one motion value (0 = docked, KBH = gone), driven by springs and the finger --------
  // It docks a beat after the screen arrives and stays up while typing (the frames); it drops when the search leaves
  // for results or goes back. The real field keeps focus and the caret; physical typing goes straight into it.
  const reduce = useReduceMotion();
  const KBH = KEYBOARD_HEIGHT;
  const K = csTokens.keyboard;
  const kbY = useMotionValue(reduce ? 0 : KBH);
  const kbO = useMotionValue(reduce ? 0 : 1);
  const [kbShown, setKbShown] = useState(false);
  const kbShownRef = useRef(false);
  const kbAnim = useRef<AnimationPlaybackControls | null>(null);
  const moveKb = useCallback(
    (show: boolean, velocity = 0, delay = 0) => {
      kbAnim.current?.stop();
      kbShownRef.current = show;
      setKbShown(show);
      if (reduce) {
        kbY.set(0);
        kbAnim.current = animate(kbO, show ? 1 : 0, { duration: 0.15, ease: 'linear' });
      } else {
        kbO.set(1);
        kbAnim.current = animate(kbY, show ? 0 : KBH, { ...(show ? K.dock : K.drop), velocity, delay });
      }
    },
    [reduce, kbY, kbO, KBH, K],
  );
  useEffect(() => {
    const id = requestAnimationFrame(() => moveKb(true, 0, K.dockDelay));
    return () => cancelAnimationFrame(id);
  }, [moveKb, K.dockDelay]);
  const qRef = useRef(q);
  qRef.current = q;
  const onKey = (ch: string) => {
    if (phaseRef.current === 'leaving') return;
    if (!kbShownRef.current) moveKb(true);
    const field = headerRef.current?.querySelector('input');
    const all = !!field && field.value.length > 0 && field.selectionStart === 0 && field.selectionEnd === field.value.length;
    setQ((v) => (all ? ch : v + ch)); // a selected query is replaced, as on iOS
  };
  const onBackspace = (kind: 'char' | 'word') => {
    if (phaseRef.current === 'leaving') return;
    setQ((v) => (kind === 'word' ? v.replace(/\S*\s*$/, '') : v.slice(0, -1)));
  };
  const back = () => {
    moveKb(false);
    nav.back();
  };
  // a tap in the field brings the keyboard back up after a scroll dismissed it
  const onHeaderPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' && !kbShownRef.current && phaseRef.current !== 'leaving') moveKb(true);
  };
  // scrolling the content dismisses it (.onDrag on wheel / trackpad; a finger carries it down, .interactive)
  const wheelAcc = useRef(0);
  const onWheel = (e: React.WheelEvent) => {
    if (!kbShownRef.current) return void (wheelAcc.current = 0);
    wheelAcc.current += Math.abs(e.deltaY) + Math.abs(e.deltaX) * 0.5;
    if (wheelAcc.current > K.wheelDismiss) {
      wheelAcc.current = 0;
      moveKb(false);
    }
  };
  const touch = useRef<{ bottom: number; s: number; moved: boolean } | null>(null);
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!kbShownRef.current) return;
    const scroller = e.currentTarget.parentElement as HTMLElement;
    const r = scroller.getBoundingClientRect();
    touch.current = { bottom: r.bottom, s: r.width / 390 || 1, moved: false };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const t = touch.current;
    if (!t || reduce) return;
    // the finger reaching the keyboard carries its top edge 1:1 (and lets it rise again)
    const off = clamp((e.touches[0].clientY - (t.bottom - KBH * t.s)) / t.s, 0, KBH);
    if (off > 0 || kbY.get() > 0) {
      kbAnim.current?.stop();
      kbY.set(off);
      t.moved = t.moved || off > 0;
    }
  };
  const onTouchEnd = () => {
    const t = touch.current;
    touch.current = null;
    if (!t?.moved) return;
    const v = kbY.getVelocity();
    const hide = project(kbY.get(), v) > KBH / 2;
    kbShownRef.current = !hide;
    setKbShown(!hide);
    kbAnim.current = animate(kbY, hide ? KBH : 0, { ...K.dock, velocity: v });
  };

  // back from results: the rows spring back in, the band returns (h2) and the field is editable again
  const isTop = useIsTop();
  useEffect(() => {
    if (!isTop || phaseRef.current !== 'leaving') return;
    setPhase('idle');
    band.current?.comeBack();
    moveKb(true, 0, K.dockDelay);
    const field = headerRef.current?.querySelector('input');
    field?.focus({ preventScroll: true });
    if (variant === 'h2') field?.select(); // F · Back from results: the query comes back selected
    return update(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTop]);

  const fillFrom = (text: string) => (text.toLowerCase().startsWith(q.toLowerCase()) ? q.length : 0);
  /** every query goes through here; `want` = the scope the results page searches */
  const go = (text: string, want: Scope = scopeRef.current === 'mixed' ? 'eligible' : scopeRef.current) => {
    const query = text.trim();
    if (!query || phaseRef.current === 'leaving') return;
    setFill({ from: fillFrom(query), key: Date.now() });
    setQ(query);
    const up = phaseRef.current === 'showing' ? rowsRef.current.list.length : 0;
    setPhase('leaving');
    moveKb(false); // the keyboard drops as the rows leave
    (document.activeElement as HTMLElement | null)?.blur();
    // the rows (and the band, making way) finish leaving first, then the results layer fades in
    const rowsS = up ? (up - 1) * st.fastExit.stagger + st.fastExit.move : !q.trim() ? handoff.fade.io : 0;
    const bandS = band.current?.makeWay() ?? 0;
    const chromeS = variant !== 'h2' ? up * st.fastExit.stagger + st.fastExit.move : 0;
    setTimeout(() => nav.push('couponsearch/results', { query, scope: want }, { transition: 'results-fade' }), Math.max(rowsS, bandS, chromeS) * 1000 + 10);
  };

  const n = rows.list.length;
  const custom = (i: number): SlotCustom => {
    const dissolve = rows.dissolve && phase === 'showing';
    if (phase === 'showing') return { d: i < n ? rows.delay[i] : (i - n) * st.crossfadeStep, dissolve };
    if (phase === 'hiding') return { d: Math.max(0, n - 1 - i) * st.rowOutStagger, dissolve };
    if (phase === 'leaving') return { d: Math.max(0, n - 1 - i) * st.fastExit.stagger, dissolve };
    return { d: 0, dissolve };
  };
  const stateOf = (i: number) => (phase === 'showing' ? (i < n ? 'in' : 'gone') : phase === 'leaving' ? 'fast' : 'out');
  const showPresearch = !q.trim() && phase !== 'leaving';
  const leaving = phase === 'leaving';
  // our chrome above the rows leaves last (the rows go bottom → top)
  const chromeState = leaving ? 'fast' : 'in';
  const chromeDelay = leaving ? n * st.fastExit.stagger : presearchDelay;

  const coupon = useCoupon();
  const input = <CsSearchBar value={q} onChange={setQ} onBack={back} autoFocus onSubmit={(v) => go(v)} fill={fill} placeholder={banded ? `${copy.search.scoped} ${coupon.code}` : undefined} />;
  const header =
    variant === 'h2' && !normal ? (
      <div ref={headerRef} onPointerDownCapture={onHeaderPointerDown}>
        <BandHeader ref={band} band={bandOn} onBand={setBandOn}>
          {input}
        </BandHeader>
      </div>
    ) : (
      <div ref={headerRef} onPointerDownCapture={onHeaderPointerDown}>
        <div className={styles.header}>{input}</div>
        {variant === 'row' && !normal && (
          <motion.div className={styles.erWrap} initial={{ opacity: 0, y: handoff.travel }} animate={chromeState} custom={chromeDelay} variants={chrome}>
            <EligibleRow on={eligibleOnly} onChange={csStore.setEligibleOnly} />
          </motion.div>
        )}
      </div>
    );

  return (
    <Screen
      header={header}
      background="bgSurface"
      contentStyle={{ paddingBottom: KBH + 16 }}
      overlay={
        <Keyboard
          visible={kbShown}
          y={kbY}
          opacity={kbO}
          hardware={leaving ? false : 'type'}
          onKey={onKey}
          onBackspace={onBackspace}
          onReturn={() => go(qRef.current)}
          onEscape={back}
        />
      }
    >
      <div onWheel={onWheel} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
      {variant === 'n5' && !normal && (
        <motion.div
          initial={{ opacity: 0, y: handoff.travel }}
          animate={chromeState}
          custom={chromeDelay}
          variants={chrome}
          style={{ pointerEvents: leaving ? 'none' : 'auto' }}
        >
          {/* typed: search the BEAUTY10 items; pre-state: the field takes the caret (and the keyboard comes up) */}
          <ScopedRow
            query={q}
            onPress={() => {
              if (q.trim()) return go(q, 'eligible');
              headerRef.current?.querySelector('input')?.focus({ preventScroll: true });
              if (!kbShownRef.current) moveKb(true);
            }}
          />
        </motion.div>
      )}
      <div style={{ position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: handoff.travel }}
          animate={showPresearch ? 'in' : 'out'}
          custom={presearchDelay}
          variants={presearch}
          style={{ pointerEvents: showPresearch ? 'auto' : 'none' }}
        >
          <Presearch onSearch={(t) => go(t)} onBanner={() => nav.push('noonone/landing', { source: '/search' })} onCategory={(t) => go(t)} />
        </motion.div>

        <div role="listbox" aria-label="Suggestions" style={{ position: 'absolute', inset: '0 0 auto', pointerEvents: phase === 'showing' ? 'auto' : 'none' }}>
          {Array.from({ length: MAX_ROWS }, (_, i) => {
            if (rows.list[i]) lastShown.current[i] = rows.list[i];
            const s = rows.list[i] ?? lastShown.current[i];
            const plain = rows.dissolve ? { shift: 0, blur: 0 } : {};
            return (
              <motion.div
                key={i}
                role="option"
                initial={{ opacity: 0, y: -handoff.travel }}
                animate={stateOf(i)}
                custom={custom(i)}
                variants={slot}
                style={{ visibility: s ? 'visible' : 'hidden' }}
              >
                {s && (
                  <BlurSwap key={rows.epoch[i]} swapKey={`${s.section ? '§' : ''}${s.text}`} delay={rows.delay[i] ?? 0} {...plain}>
                    {s.section && (
                      <div aria-hidden>
                        <div className={styles.sqDivider} />
                        <div className={styles.sgLabel}>{copy.allOfNoon}</div>
                      </div>
                    )}
                    <CsSuggestionRow
                      text={s.text}
                      query={isSearchFor(s) ? '' : q}
                      product={s.product}
                      onPress={() => go(isSearchFor(s) ? q : s.text, s.want)}
                      onFill={() => {
                        setFill({ from: fillFrom(s.text), key: Date.now() });
                        setQ(s.text + ' ');
                      }}
                    />
                  </BlurSwap>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      </div>
    </Screen>
  );
}
