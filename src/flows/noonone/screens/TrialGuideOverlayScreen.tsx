import { motion } from 'motion/react';
import { trialGuideData } from '../data.plans';
import { VIPOverlay, useVipOverlay } from '../components/VIPOverlay';
import s from './TrialGuideOverlayScreen.module.css';

function Content() {
  const { close } = useVipOverlay();
  const g = trialGuideData;
  return (
    <div className={s.container}>
      <div className={s.header}>
        <span className={s.title}>{g.title}</span>
      </div>
      <div className={s.guide}>
        {g.rows.map((r, i) => (
          <div key={i}>
            <div className={s.row}>
              <div className={s.time}>
                <span className={s.timeTitle}>{r.timeTitle}</span>
                <span className={s.timeValue}>{r.timeValue}</span>
              </div>
              <div className={s.details}>
                <span className={s.rowTitle}>{r.title}</span>
                <span className={s.rowSubtitle}>{r.subtitle}</span>
              </div>
            </div>
            {i < g.rows.length - 1 && <div className={s.line} />}
          </div>
        ))}
      </div>
      <div className={s.buttonContainer}>
        {/* TouchableOpacity default activeOpacity 0.2 */}
        <motion.button type="button" className={`nk-pressable ${s.button}`} whileTap={{ opacity: 0.2 }} onClick={() => close()}>
          <span className={s.buttonText}>GOT IT</span>
        </motion.button>
      </div>
    </div>
  );
}

/**
 * features/vip/screens/VIPTrialGuideOverlayScreen — opened from VIPPaymentV2Screen's VIPTrialGuideButton
 * ("How does the free trial work?"). Timeline rows (43px day box, dashed connector) + "GOT IT" (vip_got_it).
 * Legacy Overlay: edge-to-edge sheet, r16 top corners, no handle.
 */
export function TrialGuideOverlayScreen() {
  return (
    <VIPOverlay sheetClassName={s.sheet} hideHandle>
      <Content />
    </VIPOverlay>
  );
}
