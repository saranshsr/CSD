import { motion, type MotionValue } from 'motion/react';
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import chevronLeft from '@assets/vip/chevron-left-rounded.svg';
import chevronUp from '@assets/vip/chevron-up-rounded.svg';
import applePay from '@assets/shared/payment/apple-pay.webp';
import visa from '@assets/shared/payment/brand-card-visa.webp';
import mastercard from '@assets/shared/payment/brand-card-mastercard.webp';
import amex from '@assets/shared/payment/brand-card-amex.webp';
import { useNav } from '../../../../kit/Navigator';
import type { NoononeState } from '../../store';
import { VIPButton } from '../VIPButton';
import s from './plans.module.css';

/** VIPDashedBorder: rects strokeWidth wide, every strokeSpacing px, strokeHeight tall, rx = h/2 */
export function DashedBorder({ strokeWidth = 10, strokeSpacing = 20, strokeHeight = 1, color, className, style }: { strokeWidth?: number; strokeSpacing?: number; strokeHeight?: number; color: string; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(1);
  useLayoutEffect(() => {
    if (ref.current) setW(ref.current.offsetWidth);
  }, []);
  const n = Math.floor(w / strokeWidth);
  return (
    <div ref={ref} className={[s.dashed, className].filter(Boolean).join(' ')} style={{ height: strokeHeight, ...style }}>
      <svg width="100%" height={strokeHeight}>
        {Array.from({ length: n }, (_, i) => (
          <rect key={i} x={strokeSpacing * i} y={0} width={strokeWidth} height={strokeHeight} rx={strokeHeight / 2} fill={color} />
        ))}
      </svg>
    </div>
  );
}

/** VIPThemeManager.icons.chevronLeftRounded (svg, stroke #404040) */
export function ChevronLeftRounded({ width = 9, height = 18, style }: { width?: number; height?: number; style?: CSSProperties }) {
  return <img src={chevronLeft} width={width} height={height} alt="" style={{ objectFit: 'contain', ...style }} />;
}

/** VIP scroll header: back button (39, r20, #E3E3E3) + title, white shadow2 background fading in over the first 20px of scroll */
export function ScrollHeader({ title, opacity, onBack }: { title: ReactNode; opacity: MotionValue<number>; onBack?: () => void }) {
  const nav = useNav();
  return (
    <div className={s.headerWrapper}>
      <motion.div className={s.headerBg} style={{ opacity }} />
      <div className={s.header}>
        {/* AnimatedTouchableOpacity (activeOpacity 0.2) */}
        <motion.button type="button" className={`nk-pressable ${s.backButton}`} onClick={onBack ?? nav.back} aria-label="Back" whileTap={{ opacity: 0.2 }}>
          <span className={s.backIcon}>
            <ChevronLeftRounded />
          </span>
        </motion.button>
        <motion.div style={{ opacity }}>{typeof title === 'string' ? <span className={s.headerTitle}>{title}</span> : title}</motion.div>
      </div>
    </div>
  );
}

const CARD_IMG = { visa, mastercard, amex } as const;

/** getPaymentMethodData / getMobilePaymentMethodData → image + masked number */
function paymentDisplay(pm: NoononeState['paymentMethod']) {
  if (!pm) return null;
  if (pm.type === 'applepay') return { image: applePay, text: 'Apple Pay' };
  if (pm.type === 'boku') return { image: undefined, text: `${'•'.repeat(4)}${pm.msisdn.slice(-4)}` };
  return { image: CARD_IMG[pm.card.ccType], text: `${'•'.repeat(4)}${pm.card.last4}` };
}

export interface SubscriptionButtonProps {
  /** server html title (VIPButton htmlTitle) */
  title: string;
  /** VIPSubscriptionButtonV2 showPayment && paymentDetails */
  showPayment?: boolean;
  paymentMethod?: NoononeState['paymentMethod'];
  onPress: () => void;
  /** "Pay with" row → showPaymentScreen */
  onPayWith?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  /** caller `style` (height / radius / background) */
  className?: string;
  /** caller `textStyle` */
  textClassName?: string;
}

/**
 * features/vip/components/VIPSubscriptionButtonV2: optional "Pay with ••••4242" row (card icon 44×40, label 13/500
 * #02060c73 + chevron, number 15/500 nightFall) left of a black 48h r12 button whose html title renders `<s>` struck
 * through 2px smaller. Disabled → noonGrey2.
 */
export function SubscriptionButton({ title, showPayment, paymentMethod, onPress, onPayWith, isLoading, disabled, className, textClassName }: SubscriptionButtonProps) {
  const pay = showPayment ? paymentDisplay(paymentMethod ?? null) : null;
  return (
    <div className={s.subContainer}>
      {pay && (
        <button type="button" className={`nk-pressable ${s.payRow}`} onClick={onPayWith}>
          {pay.image && <img className={s.cardType} src={pay.image} alt="" />}
          <span>
            <span className={s.payRowHeader}>
              <span className={s.payRowHeaderText}>Pay with</span>
              <span className={s.chevron}>
                <img src={chevronUp} width={14} height={14} alt="" />
              </span>
            </span>
            <span className={s.payText}>{pay.text}</span>
          </span>
        </button>
      )}
      <VIPButton
        className={[s.subButton, className].filter(Boolean).join(' ')}
        disabled={disabled || isLoading}
        isLoading={isLoading}
        onPress={onPress}
        htmlTitle={title}
        textClassName={[s.subText, textClassName].filter(Boolean).join(' ')}
      />
    </div>
  );
}

const MEMBER_COLORS = ['var(--nk-color-vip-member1)', 'var(--nk-color-vip-member2)', 'var(--nk-color-vip-member3)', 'var(--nk-color-vip-member4)', 'var(--nk-color-vip-member5)'];

/** features/vip/components/VIPPlanMembers: overlapping initials + empty "+" seats up to `max` */
export function PlanMembers({ members, size = 28, overlap = 10, max = 5, emptyBg, emptyBorder, className }: { members: { name: string }[]; size?: number; overlap?: number; max?: number; emptyBg?: string; emptyBorder?: string; className?: string }) {
  const stroke = 1.6;
  const inner = size - stroke;
  return (
    <div className={[s.members, className].filter(Boolean).join(' ')}>
      {Array.from({ length: max }, (_, i) => {
        const m = members[i];
        const ring: CSSProperties = {
          width: size + stroke - 2 * stroke,
          height: size + stroke - 2 * stroke,
          borderRadius: '50%',
          borderWidth: stroke,
          marginInlineStart: i === 0 ? 0 : -overlap,
          zIndex: max - i,
          ...(m ? null : emptyBorder ? { borderColor: emptyBorder } : null),
        };
        return (
          <span key={i} className={s.memberRing} style={ring}>
            {m ? (
              <span className={s.memberFill} style={{ width: inner, height: inner, background: MEMBER_COLORS[i % MEMBER_COLORS.length] }}>
                <span className={s.memberText} style={{ fontSize: size / 2 }}>
                  {m.name.trim()[0]?.toUpperCase() || ' '}
                </span>
              </span>
            ) : (
              <span className={`${s.memberFill} ${s.memberEmpty}`} style={{ width: inner, height: inner, ...(emptyBg ? { background: emptyBg } : null) }}>
                <span className={s.addMark} style={{ width: 10, height: 10 }}>
                  <span className={s.addBar} style={{ width: 10, height: 1.5 }} />
                  <span className={s.addBar} style={{ width: 1.5, height: 10 }} />
                </span>
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
