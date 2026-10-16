import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect } from 'react';
import { Pressable } from '../../../components';
import { duration, easing } from '../../../motion/presets';
import { AccountIconImg } from '../icons';
import { accountTokens } from '../tokens';
import { palette } from '../../../foundations/palette';

/** NoonAccountCircularProgressEdit constants (bappzaar master) — ms */
const PENCIL_OUT = 300;
const PROGRESS = 1200;
const HOLD = 800;
const RETURN = 400;
const SIZE = 36; // CIRCLE_SIZE
const STROKE = 2; // STROKE_WIDTH
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R; // CIRCUMFERENCE
/** Easing.in(Easing.back(2)) */
const backIn2 = (t: number) => t * t * (3 * t - 2);

const s = (ms: number) => ms / 1000;

/**
 * Edit-profile button with the profile-completion ring (NoonAccountCircularProgressEdit, animationDelay 1100 from
 * NoonAccountProfileHeader). At `delay` the pencil scales + fades out (300ms back-in) while the circle tints orange;
 * 300ms later the arc fills to `percent` with a "NN%" counter (1200ms out-cubic), holds 800ms, then the counter fades,
 * the tint reverts and the pencil springs back (400ms back-out). The arc keeps its fill (slate again).
 * ≥ 100% shows the plain pencil button. TouchableOpacity activeOpacity 0.7.
 */
export function EditRing({ percent, onPress, delay = 1100 }: { percent: number; onPress?: () => void; delay?: number }) {
  const { ring } = accountTokens;
  const state = useMotionValue(0);
  const pencil = useMotionValue(1);
  const arc = useMotionValue(0);
  const num = useMotionValue(0);
  const count = useMotionValue(0);
  const label = useTransform(count, (v) => `${Math.round(v)}%`);
  const bg = useTransform(state, [0, 1], [palette.secondaryBackgroundColor, ring.bg]);
  const border = useTransform(state, [0, 1], [palette.lightGreyColor, ring.border]);
  const stroke = useTransform(state, [0, 1], [ring.idle, ring.fill]);
  const dashOffset = useTransform(arc, (v) => C * (1 - v));
  const numScale = useTransform(num, (v) => 0.8 + v * 0.2);
  const full = percent >= 100;

  useEffect(() => {
    if (full) return;
    [state, arc, num, count].forEach((v) => v.set(0));
    pencil.set(1);
    const progressAt = delay + PENCIL_OUT;
    const backAt = progressAt + PROGRESS + HOLD;
    const runs = [
      animate(pencil, 0, { delay: s(delay), duration: s(PENCIL_OUT), ease: backIn2 }),
      animate(state, 1, { delay: s(delay), duration: s(PENCIL_OUT) }),
      animate(arc, percent / 100, { delay: s(progressAt), duration: s(PROGRESS), ease: easing.out }),
      animate(count, percent, { delay: s(progressAt), duration: s(PROGRESS), ease: easing.out }),
      animate(num, 1, { delay: s(progressAt), duration: s(150) }),
    ];
    const t = setTimeout(() => {
      runs.push(
        animate(pencil, 1, { duration: s(RETURN), ease: easing.backOut }),
        animate(state, 0, { duration: s(RETURN) }),
        animate(num, 0, { duration: s(200) }),
      );
    }, backAt);
    return () => {
      clearTimeout(t);
      runs.forEach((r) => r.stop());
    };
  }, [percent, delay, full, state, pencil, arc, num, count]);

  return (
    <Pressable
      onClick={(e) => {
        e.stopPropagation();
        onPress?.();
      }}
      aria-label="Edit profile"
      whileTap={{ opacity: 0.7 }}
      transition={{ duration: duration.fast }}
      style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}
    >
      {/* hitSlop 30 */}
      <span style={{ position: 'absolute', inset: -30 }} />
      <motion.span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '1px solid',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: full ? palette.secondaryBackgroundColor : bg,
          borderColor: full ? palette.lightGreyColor : border,
        }}
      >
        <motion.span style={{ display: 'flex', scale: full ? 1 : pencil, opacity: full ? 1 : pencil }}>
          <AccountIconImg name="editProfile" size={18} />
        </motion.span>
        {!full && (
          <motion.span style={{ position: 'absolute', direction: 'ltr', font: 'var(--nk-type-acct-text11-bold-lh1)', color: ring.counter, opacity: num, scale: numScale }}>
            {label}
          </motion.span>
        )}
      </motion.span>
      {!full && (
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)', pointerEvents: 'none' }}>
          <motion.circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" strokeWidth={STROKE} strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: dashOffset, stroke }} />
        </svg>
      )}
    </Pressable>
  );
}
