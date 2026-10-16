import { motion } from 'motion/react';
import { MaskIcon, OriginIcon } from '../../../components';
import { art } from '../assets';
import { ref } from '../../../foundations/tokens';
import { duration, spring, supermall } from '../../../motion/presets';
import { trackingSteps, type returnSteps, type exchangeSteps } from '../data';
import styles from '../orders.module.css';
import { ordersTokens } from '../tokens';

/** where each step's disc centre sits on the track (PDS reference, 301px track: 5 · 100 · 201 · 296), and the
 *  "on the way" point between Dispatched and Delivered (275px fill) */
const AT = [5 / 301, 100 / 301, 201 / 301, 1];
const EN_ROUTE = 275 / 301;
const FILL_S = duration.slower + duration.medium;

/**
 * 4-step horizontal stepper (PDS reference tracker card): 36 discs (done `#F6FEFB` + 1px `#ADF0D5`, pending white +
 * 1px `#EAECF0`), first step start-aligned / last end-aligned, labels 12/600/18 + 11/400/14 dates. The 2px fill grows
 * from the left on `supermall.ease.soft`; each done disc pops (`spring.bouncy`) as the fill reaches it, (no haptic: browsers block
 * vibration before the first tap, and this plays on load).
 */
type Steps = typeof trackingSteps | typeof returnSteps | typeof exchangeSteps;

/** `steps`: the server timeline for the card type (delivery by default; return / exchange cards send their own) */
export function Stepper({ step, dates, enRoute, gray, steps = trackingSteps }: { step: number; dates: string[]; enRoute?: boolean; gray?: boolean; steps?: Steps }) {
  const frac = enRoute ? EN_ROUTE : AT[Math.max(0, Math.min(step, 3))];
  const start = supermall.reveal.delay + supermall.reveal.stagger * 3;
  const tint = (done: boolean) => (done ? (gray ? ref.color('textTertiary') : ref.color('success')) : ref.color('borderStrong'));
  return (
    <div className={styles.stepperWrap}>
      <ol className={styles.stepper}>
        <span className={styles.track}>
          <motion.span
            className={styles.trackFill}
            style={{ width: `${frac * 100}%`, background: gray ? ref.color('borderStrong') : ordersTokens.stepFill }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: FILL_S, ease: supermall.ease.soft, delay: start }}
          />
        </span>
        {steps.map((s, i) => {
          const done = i <= step && !(i === 3 && enRoute);
          return (
            <li key={s.id} className={styles.step}>
              <motion.span
                className={styles.stepDisc}
                data-done={(done && !gray) || undefined}
                initial={done ? { scale: 0.86 } : false}
                animate={{ scale: 1 }}
                transition={{ ...spring.bouncy, delay: start + FILL_S * Math.min(AT[i], frac) * 0.6 }}
              >
                {'icon' in s ? <OriginIcon name={s.icon} size={s.size} color={tint(done)} /> : <MaskIcon src={art[s.art]} width={s.w} height={s.h} color={tint(done)} />}
              </motion.span>
              <span className={styles.stepText}>
                <span className={styles.stepLabel} data-done={done || undefined}>
                  {s.label}
                </span>
                {dates[i] && done ? <span className={styles.stepDate}>{dates[i]}</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
