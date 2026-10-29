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

  const glide = (to: number, velocity = 0) => {
    run.current?.stop();
    if (reduce) {
      p.jump(to);
      return;
    }
    run.current = animate(p, to, { ...fieldMotion.spring.springLight, velocity });
  };
  useEffect(() => {
    if (!drag.current?.active) glide(on ? 1 : 0, p.getVelocity());
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
  // v2: the 36×36 badge fill (muted ⇄ success-subtle) follows p too
  const badgeBg = useTransform(p, [0, 1], [colors.bgMuted, colors.successSurface]);
  const subInk = useTransform(p, [0, 1], [field.textTertiary, colors.success]);
  const valueInk = useTransform(p, [0, 1], [colors.textSecondary, colors.success]);

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
      }}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          commit(!on);
        }
      }}
    >
      <motion.span className={v2 ? `${styles.erOnBg} ${styles.erOnBg2}` : styles.erOnBg} style={{ opacity: onBg }} aria-hidden />
      <motion.span className={styles.erOffRing} style={{ opacity: offRing }} aria-hidden />
      {v2 ? (
        <motion.span className={styles.erBadge} style={{ backgroundColor: badgeBg }} aria-hidden>
          <motion.span className={styles.erBadgeIcon} style={{ backgroundColor: ink, WebkitMaskImage: `url("${badgeIcon}")`, maskImage: `url("${badgeIcon}")` }} />
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
        <motion.span className={styles.erValue} style={{ color: v2 ? subInk : valueInk }}>
          {coupon.value}
        </motion.span>
      </span>
      <motion.span className={styles.erTrack} style={{ backgroundColor: track }} aria-hidden>
        <motion.span className={styles.erKnob} style={{ x: knobX, width: knobW, background: field.surfacePrimary, boxShadow: field.shadowSm }} />
      </motion.span>
    </motion.div>
  );
}
