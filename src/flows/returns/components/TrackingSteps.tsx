import { motion } from 'motion/react';
import { useLayoutEffect, useRef, useState } from 'react';
import { DottedDivider } from '../../../components';
import type { Tracking } from '../data';
import { normalizeColorCode, returnsTokens, trackingColors, trackingTextColors } from '../tokens';
import styles from '../details.module.css';

/** AFSReturnsLegacyReturnDetailsSteps getDefaultIcon — used when the stage has no SD `iconUrl` */
export function StepGlyph({ fill, size = 18 }: { fill: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.416.917a.415.415 0 1 0-.83-.005l-.012 1.968a.415.415 0 1 0 .83.005zm4.1 1.753a.415.415 0 1 0-.496-.665l-1.136.845a.415.415 0 1 0 .496.666zM7.4 2.09a.415.415 0 0 1 .58-.085l1.133.846a.415.415 0 0 1-.496.665L7.484 2.67a.415.415 0 0 1-.084-.58M2.873 5.893a.83.83 0 0 1 .83-.83h16.596a.83.83 0 0 1 .83.83v2.489H2.873zm17.425 4.149H3.702v8.297c0 .917.743 1.66 1.66 1.66h13.277a1.66 1.66 0 0 0 1.66-1.66zm-7.86 2.785v2.588a.5.5 0 0 1-1 0v-2.588a.5.5 0 1 1 1 0m-.5 4.172a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1"
        fill={fill}
      />
    </svg>
  );
}

/** step colour resolution shared by the horizontal steps and the timeline overlay */
export function stepColors(tracking: Tracking, stageColorCode?: string) {
  const code = normalizeColorCode(tracking.colorCode);
  const color = (code && trackingColors[code]) || trackingColors.green;
  const text = (code && trackingTextColors[code]) || trackingTextColors.green;
  const sc = normalizeColorCode(stageColorCode);
  return { line: color, stepColor: (sc && trackingTextColors[sc]) || color, stepText: (sc && trackingTextColors[sc]) || text, isAmber: sc === 'amber' };
}

/**
 * AFSReturnsLegacyReturnDetailsSteps — horizontal tracker: 36px circles, 2px dashed track (NoonDashedBorder 5/6
 * #EAECE0) at top 17, progress = white + colour bars of width 18 + (current−1)/(n−1)·(W−36) + 18.
 */
export function TrackingSteps({ tracking }: { tracking: Tracking }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.offsetWidth));
    ro.observe(el);
    setW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);
  const n = tracking.stages.length;
  const S = returnsTokens.stepSize;
  const progress = n <= 1 ? 0 : S / 2 + ((tracking.currentStage - 1) / (n - 1)) * (w - S) + S / 2;
  const { line } = stepColors(tracking);
  return (
    <div ref={ref} className={styles.steps}>
      <div className={styles.stepsTrack}>
        <DottedDivider color="var(--nk-palette-dashed-border-default)" dash="5, 6" height={returnsTokens.progressLine} />
      </div>
      <motion.div className={styles.stepsProgress} style={{ background: line }} initial={false} animate={{ width: progress }} transition={{ duration: 0 }} />
      {tracking.stages.map((s, i) => {
        const idx = i + 1;
        const filled = idx <= tracking.currentStage;
        const c = stepColors(tracking, s.colorCode);
        return (
          <div key={s.shortName + i} className={[styles.step, idx === 1 && styles.stepFirst, idx === n && styles.stepLast].filter(Boolean).join(' ')}>
            <span className={styles.stepIcon} style={filled ? { borderColor: c.stepColor } : undefined}>
              <StepGlyph fill={filled ? c.stepColor : 'var(--nk-color-text-tertiary)'} />
            </span>
            <span className={[styles.stepName, filled && styles.stepNameActive].filter(Boolean).join(' ')} style={filled && !c.isAmber ? { color: c.stepText } : undefined}>
              {s.shortName}
            </span>
            <span className={styles.stepDate}>{s.date}</span>
          </div>
        );
      })}
    </div>
  );
}
