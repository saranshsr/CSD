import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import { useEffect, useRef } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useLottieReducedMotion } from '../../components/Lottie/Lottie';
import { Screen } from '../../components';
import { useNav } from '../../kit/Navigator';
import type { ScreenProps } from '../../kit/types';
import { lotties } from './assets';
import { initialAddresses, singleLineAddress, t, type SavedAddress } from './data';
import { addressStore } from './store';
import styles from './address.module.css';
import { useReduceMotion } from '../../motion/reducedMotion';

export interface SuccessParams {
  address?: SavedAddress;
  line?: string;
}

/**
 * AddressV2LatLngCreateSuccessScreen — 2s save-success Lottie on rgb(251,251,251); title + address fade/slide in
 * between 50% and 70% of the progress (translateY 20 → -3 → 0). Then onAfterSuccessAnimation: the address is
 * added to the list and the map modal is dismissed (alpha 1→0, translateY → -screenHeight, 400ms).
 */
export function SuccessScreen({ params }: ScreenProps<SuccessParams>) {
  const nav = useNav();
  const progress = useMotionValue(0);
  const opacity = useTransform(progress, [0, 0.5, 0.7, 1], [0, 0, 1, 1]);
  // reduced motion: the text fades in place (same 2s timeline)
  const reduce = useReduceMotion();
  const y = useTransform(progress, [0, 0.5, 0.7, 1], reduce ? [0, 0, 0, 0] : [20, 20, -3, 0]);
  const rm = useLottieReducedMotion({});
  const done = useRef(false);
  const address = params.address;
  const line = params.line ?? `${singleLineAddress(initialAddresses[0])}, ${initialAddresses[0].area}`;

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: 2,
      ease: 'linear',
      onComplete: () => {
        // opened from the playground (no address) → stay on the screen
        if (done.current || !address) return;
        done.current = true;
        addressStore.add(address);
        nav.back();
        nav.back();
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen background="addrSuccessBg" safeTop={false} contentStyle={{ overflow: 'hidden', paddingBottom: 0 }}>
      <div className={styles.success}>
        <div className={styles.successLottie}>
          <DotLottieReact src={lotties.saveSuccess} autoplay={rm.autoplay} layout={{ fit: 'cover', align: [0.5, 0.5] }} style={{ width: '100%', height: '100%' }} dotLottieRefCallback={rm.attach} />
        </div>
        <div className={styles.successText}>
          <motion.span className={styles.successTitle} style={{ opacity, y }}>
            {t.address_v2_address_save_success_title}
          </motion.span>
          <motion.span className={styles.successAddress} style={{ opacity, y }}>
            {line}
          </motion.span>
        </div>
      </div>
    </Screen>
  );
}
