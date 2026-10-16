import { motion } from 'motion/react';
import { Button, HtmlText } from '../../../../components';
import { useReduceMotion } from '../../../../motion/recipes';
import { trayCopy, type TrayTiersProgressBar } from '../../data.couponTray';
import { couponTrayMotion as M } from '../../tokens';
import styles from './tray.module.css';

const PROMPT = { p: { fontWeight: 500, color: 'var(--nk-palette-blue-gray700)' }, orange: { color: 'var(--nk-palette-sunset-orange)' } };

/** calculateVisualProgress: tiers sit at (i + 1) / n of the track; progress interpolates between the last unlocked and the next locked tier. */
export function visualProgress({ current, tiers }: TrayTiersProgressBar) {
  if (!tiers.length) return 0;
  const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
  const pos = (i: number) => ((i + 1) / tiers.length) * 100;
  const lastUnlocked = tiers.map((t) => t.isUnlocked).lastIndexOf(true);
  const firstLocked = tiers.findIndex((t) => !t.isUnlocked);
  if (firstLocked === -1) return 100;
  const fromMilestone = lastUnlocked === -1 ? 0 : tiers[lastUnlocked].milestone;
  const fromPos = lastUnlocked === -1 ? 0 : pos(lastUnlocked);
  const range = tiers[firstLocked].milestone - fromMilestone;
  if (range <= 0) return clamp(fromPos, 0, 100);
  const seg = clamp((clamp(current, 0, 100) - fromMilestone) / range, 0, 1);
  return clamp(fromPos + seg * (pos(firstLocked) - fromPos), 0, 100);
}

/**
 * NoonSalesCouponTrayOfferTiersProgressBar — spend tiers: prompt (+ "Add products" while under 100), a 4px track with
 * the tier pills at the end of each equal slot; unlocked pills are deep green, locked ones grey with a top shadow.
 * Background orange50 until a tier unlocks, then brightTeal with a deep-green fill.
 */
export function TiersProgressBar({ bar, showAddProducts, onAddProducts, disabled }: { bar: TrayTiersProgressBar; showAddProducts: boolean; onAddProducts: () => void; disabled: boolean }) {
  const reduce = useReduceMotion();
  const anyUnlocked = bar.tiers.some((t) => t.isUnlocked);
  const progress = visualProgress(bar);
  return (
    <div className={styles.tiers} data-unlocked={anyUnlocked || undefined}>
      <div className={styles.criteriaRow}>
        <HtmlText value={bar.prompt} base stylesheet={PROMPT} className={styles.criteriaPrompt} />
        {showAddProducts && bar.current < 100 && (
          <Button variant="noonDotted" dottedColor="var(--nk-palette-blue-gray900)" className={styles.dottedAction} disabled={disabled} onClick={onAddProducts}>
            {trayCopy.addProducts}
          </Button>
        )}
      </div>
      <div className={styles.tiersTrackWrap}>
        <div className={styles.tiersTrack}>
          <motion.span className={styles.tiersFill} initial={{ width: reduce ? `${progress}%` : 0 }} animate={{ width: `${progress}%` }} transition={{ duration: reduce ? 0 : M.barS, ease: 'easeInOut' }} />
        </div>
        <div className={styles.tierSlots}>
          {bar.tiers.map((t, i) => (
            <span key={t.milestone} className={styles.tierSlot} style={{ zIndex: bar.tiers.length - i }}>
              {t.isUnlocked ? (
                <span className={styles.tierUnlocked}>
                  <HtmlText value={t.label} />
                </span>
              ) : (
                <span className={styles.tierLocked}>
                  <span className={styles.tierGap} aria-hidden />
                  <HtmlText value={t.label} />
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
