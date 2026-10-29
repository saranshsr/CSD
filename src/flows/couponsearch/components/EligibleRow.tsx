import { animate, motion, useMotionValue, useTransform, type AnimationPlaybackControls } from 'motion/react';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { colors, field } from '../../../foundations/tokens';
import couponIcon from '@assets/icons/origin/coupon-discount-filled.svg';
import badgeIcon from '@assets/icons/origin/discount-filled.svg';
import { haptic } from '../../../motion/haptics';
import { fieldMotion, spring, supermall } from '../../../motion/presets';
import { useReduceMotion } from '../../../motion/reducedMotion';
import { copy } from '../data';
import { useCoupon } from '../couponContext';
import { project, rubber, velocityTracker } from '../gesture';
import { couponsearchFlowTokens, csTokens } from '../tokens';
import styles from '../search.module.css';

const T1 = csTokens.toggle;
const T2 = csTokens.toggleV2;
const S = T2.spread;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** how far the spread has reached a point `at` along the row (0 = switch edge, 1 = far edge), feathered */
const reach = (q: number, at: number) => clamp01((clamp01(q) * (1 + S.feather) - at) / S.feather);
/** the spread as a mask: opaque behind its feathered front, which travels from the switch (right) to the far edge */
const spreadMask = (q: number, invert: boolean) => {
  const f = clamp01(q) * (1 + S.feather);
  const a = `${((f - S.feather) * 100).toFixed(2)}%`;
  const b = `${(f * 100).toFixed(2)}%`;
  return invert ? `linear-gradient(to left, transparent ${a}, black ${b})` : `linear-gradient(to left, black ${a}, transparent ${b})`;
};
const { slop } = csTokens.gesture;
const flow = couponsearchFlowTokens.colors as Record<string, string>;

/**
 * Eligible row: "Search within BEAUTY10" just under the search bar, from the empty state on. The whole row is the
 * hit target (an iOS settings cell); an Origin M-Toggle H20 (34×20, 16 knob, 2 inset) is its state.
 *
 * UISwitch, translated: ONE progress value `p` (1 = on) drives knob travel, track green ⇄ grey, the row tint ⇄ white
 * and its hairline (off ring out, on ring in: two opacities, so no colour is ever mixed through black), the coupon icon
 * and the value colour, so a double tap reverses mid-flight from where it is, with its velocity. The kit's motion roles:
 * the knob travels on `fieldMotion.spring.springLight` (the Field M-Toggle's knob spring: ≈0.35s, no visible settle on
 * a tap), stretches 6px toward its travel on touch-down on `spring.press` and relaxes on `supermall.springs.return`
 * (critically damped) as it lands. Dragging along the row scrubs the knob 1:1 (rubber band past the ends); the release
 * projects momentum to pick the side. A haptic tick on commit. Reduced motion: everything snaps. Pointer-down never
 * takes focus from the search field.
 *
 * v2 (`?v=row2`) choreographs it: the switch leads, the row answers. `p` moves only the switch (knob + track); the
 * row's surface runs on its own spring value `q` that starts a beat later (`toggleV2.spread`) and spreads the green out
 * of the switch, right → left, through a feathered mask, with the off hairline masked as its exact complement. The
 * subtitle and the badge turn as the front reaches them, and as it reaches the badge on the way on, the coupon icon
 * takes a small settle (`toggleV2.settle`). Off recedes back into the switch on a quicker, critically damped spring.
 * Reduced motion: the knob snaps and the row cross-fades uniformly for 150ms.
 */
export function EligibleRow({ on, onChange, v2 = false }: { on: boolean; onChange: (on: boolean) => void; v2?: boolean }) {
  const T = v2 ? T2 : T1;
  const TRAVEL = T.track.w - T.inset * 2 - T.knob; // v1: 14, v2: 18
  const coupon = useCoupon();
  const reduce = useReduceMotion();
  const p = useMotionValue(on ? 1 : 0);
  const press = useMotionValue(0);
  const run = useRef<AnimationPlaybackControls | null>(null);
  const drag = useRef<{ id: number; x0: number; y0: number; s: number; p0: number; active: boolean; cancelled: boolean } | null>(null);
  const vt = useRef(velocityTracker());
  const [held, setHeld] = useState(false);
  // v2: the row's surface progress (1 = on), its own spring a beat behind the knob, and the badge icon's settle
  const q = useMotionValue(on ? 1 : 0);
  const qRun = useRef<AnimationPlaybackControls | null>(null);
  const qTarget = useRef<0 | 1 | null>(on ? 1 : 0); // null while the surface chases a drag
  const iconScale = useMotionValue(1);
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;

  const surface = (to: 0 | 1) => {
    if (!v2) return;
    const from = q.get();
    const atRest = Math.abs(q.getVelocity()) < 0.01 && (from <= 0.001 || from >= 0.999);
    qRun.current?.stop();
    qTarget.current = to;
    if (reduce) {
      qRun.current = animate(q, to, { duration: S.fade, ease: 'linear' });
      return;
    }
    qRun.current = animate(q, to, { ...(to ? S.on : S.off), velocity: q.getVelocity(), delay: atRest && from !== to ? S.lead : 0 });
    if (!to) animate(iconScale, 1, T2.settle.off); // turning off never bounces
  };
  const chase = (to: number) => {
    if (!v2) return;
    qRun.current?.stop();
    qTarget.current = null;
    qRun.current = animate(q, clamp01(to), { ...S.chase, velocity: q.getVelocity() });
  };
  // the badge confirms "on": a downward kick on a lightly under-damped spring as the green reaches it
  useEffect(() => {
    if (!v2) return;
    let prev = reach(q.get(), S.at.badge);
    return q.on('change', (v) => {
      const r = reach(v, S.at.badge);
      if (qTarget.current === 1 && !reduceRef.current && prev < T2.settle.at && r >= T2.settle.at) {
        animate(iconScale, 1, { ...T2.settle.spring, velocity: T2.settle.kick });
      }
      prev = r;
    });
  }, [v2, q, iconScale]);

  const glide = (to: number, velocity = 0) => {
    run.current?.stop();
    if (reduce) {
      p.jump(to);
      return;
    }
    run.current = animate(p, to, { ...fieldMotion.spring.springLight, velocity });
  };
  useEffect(() => {
    if (!drag.current?.active) {
      glide(on ? 1 : 0, p.getVelocity());
      surface(on ? 1 : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on]);

  const knobW = useTransform(press, (v) => T.knob + v * T.stretch);
  const knobX = useTransform(() => Math.min(1.08, Math.max(-0.08, p.get())) * (TRAVEL - press.get() * T.stretch));
  const track = useTransform(p, [0, 1], [colors.border, colors.success]);
  // on: the Figma gradient (base/colour/green/100 → green/50) fades in over white with the toggle
  const onBg = useTransform(p, [0, 1], [0, 1]);
  // off: the borderSubtle hairline, fading out as the on look (gradient + its success-surface hairline) fades in
  const offRing = useTransform(p, [0, 1], [1, 0]);
  const ink = useTransform(p, [0, 1], [flow.csIconOff, colors.success]);
  const valueInk = useTransform(p, [0, 1], [colors.textSecondary, colors.success]);
  // v2: the row follows `q`, not the knob; at rest both layers drop their masks, so the resting looks are the old ones
  const onBg2 = useTransform(q, (v) => (reduceRef.current ? clamp01(v) : v <= 0.0005 ? 0 : 1));
  const onMask2 = useTransform(q, (v) => (reduceRef.current || v >= 0.9995 ? 'none' : spreadMask(v, false)));
  const offRing2 = useTransform(q, (v) => (reduceRef.current ? 1 - clamp01(v) : v >= 0.9995 ? 0 : 1));
  const offMask2 = useTransform(q, (v) => (reduceRef.current || v <= 0.0005 ? 'none' : spreadMask(v, true)));
  const badgeReach = useTransform(q, (v) => (reduceRef.current ? clamp01(v) : reach(v, S.at.badge)));
  const valueReach = useTransform(q, (v) => (reduceRef.current ? clamp01(v) : reach(v, S.at.value)));
  const badgeBg2 = useTransform(badgeReach, [0, 1], [colors.bgMuted, colors.successSurface]);
  const ink2 = useTransform(badgeReach, [0, 1], [flow.csIconOff, colors.success]);
  // Field text-tertiary is #666D85 = kit `textSecondary`; the kit's literal is used because `field.*` resolves to a CSS
  // var, which motion can't interpolate (the subtitle would snap instead of turning green)
  const subInk2 = useTransform(valueReach, [0, 1], [colors.textSecondary, colors.success]);

  const stretch = (v: number) => {
    if (!reduce) animate(press, v, v ? spring.press : supermall.springs.return);
  };
  const commit = (next: boolean) => {
    haptic('tick');
    onChange(next);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button > 0) return;
    e.preventDefault(); // the row never takes focus from the search field
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, s: r.width / T.rowWidth || 1, p0: p.get(), active: false, cancelled: false };
    vt.current.reset();
    setHeld(true);
    stretch(1);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety */
    }
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || d.cancelled) return;
    const dx = (e.clientX - d.x0) / d.s;
    const dy = (e.clientY - d.y0) / d.s;
    if (!d.active) {
      if (Math.abs(dy) > slop && Math.abs(dy) > Math.abs(dx)) {
        // a scroll, not a switch
        d.cancelled = true;
        setHeld(false);
        stretch(0);
        return;
      }
      if (Math.abs(dx) < slop) return;
      d.active = true;
      run.current?.stop();
      d.p0 = p.get(); // x0 stays: the knob catches up with the finger, no dead slop
    }
    let px = d.p0 * TRAVEL + dx;
    if (px < 0) px = rubber(px, TRAVEL);
    else if (px > TRAVEL) px = TRAVEL + rubber(px - TRAVEL, TRAVEL);
    p.set(px / TRAVEL);
    chase(px / TRAVEL);
    vt.current.add(px, e.timeStamp);
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    setHeld(false);
    stretch(0);
    if (!d || d.id !== e.pointerId || d.cancelled) return;
    if (!d.active) {
      commit(!on);
      return;
    }
    const v = vt.current.get(e.timeStamp);
    const next = project(p.get() * TRAVEL, v) > TRAVEL / 2;
    glide(next ? 1 : 0, v / TRAVEL);
    surface(next ? 1 : 0);
    if (next !== on) commit(next);
  };

  return (
    <motion.div
      className={v2 ? `${styles.er} ${styles.er2}` : styles.er}
      data-held={held || undefined}
      role="switch"
      aria-checked={on}
      aria-label={`${coupon.rowLead ?? copy.row.lead} ${coupon.code} ${coupon.rowTail ?? copy.row.tail}`.trim()}
      tabIndex={0}
      style={{ backgroundColor: colors.bgSurface }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
        setHeld(false);
        stretch(0);
        glide(on ? 1 : 0);
        surface(on ? 1 : 0);
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          commit(!on);
        }
      }}
    >
      {v2 ? (
        <>
          <motion.span className={`${styles.erOnBg} ${styles.erOnBg2}`} style={{ opacity: onBg2, WebkitMaskImage: onMask2, maskImage: onMask2 }} aria-hidden />
          <motion.span className={styles.erOffRing} style={{ opacity: offRing2, WebkitMaskImage: offMask2, maskImage: offMask2 }} aria-hidden />
        </>
      ) : (
        <>
          <motion.span className={styles.erOnBg} style={{ opacity: onBg }} aria-hidden />
          <motion.span className={styles.erOffRing} style={{ opacity: offRing }} aria-hidden />
        </>
      )}
      {v2 ? (
        <motion.span className={styles.erBadge} style={{ backgroundColor: badgeBg2 }} aria-hidden>
          <motion.span className={styles.erBadgeIcon} style={{ backgroundColor: ink2, scale: iconScale, WebkitMaskImage: `url("${badgeIcon}")`, maskImage: `url("${badgeIcon}")` }} />
        </motion.span>
      ) : (
        <motion.span className={styles.erIcon} style={{ backgroundColor: ink, WebkitMaskImage: `url("${couponIcon}")`, maskImage: `url("${couponIcon}")` }} aria-hidden />
      )}
      <span className={styles.erCopy}>
        {v2 ? (
          <span className={styles.erText}>
            {coupon.rowTail === '' ? `${coupon.rowLead ?? copy.row.lead} ` : null}
            <b>{coupon.code}</b>
            {coupon.rowTail !== '' && ` ${coupon.rowTail ?? copy.row.tail}`}
          </span>
        ) : (
          <span className={styles.erText}>
            {coupon.rowLead ?? copy.row.lead} <b>{coupon.code}</b>
            {(coupon.rowTail ?? copy.row.tail) && <span className={styles.erTail}> {coupon.rowTail ?? copy.row.tail}</span>}
          </span>
        )}
        <motion.span className={styles.erValue} style={{ color: v2 ? subInk2 : valueInk }}>
          {coupon.value}
        </motion.span>
      </span>
      <motion.span className={styles.erTrack} style={{ backgroundColor: track }} aria-hidden>
        <motion.span className={styles.erKnob} style={{ x: knobX, width: knobW, background: field.surfacePrimary, boxShadow: field.shadowSm }} />
      </motion.span>
    </motion.div>
  );
}
