import type { ReactNode } from 'react';
import { MaskIcon, Pressable } from '../../../components';
import { icons } from '../assets';
import styles from './afs.module.css';

/**
 * features/afs/common/components/AFSBackHeader — absolute header, statusBar + 8 / 8 / 12 padding, 40px white back
 * circle (1px #F2F3F7, pressed 0.96), title 18/700 #1D2539. `blur` = iOS ProgressiveBlurView (#F9F9FBCC overlay,
 * blur 10, blurred top → clear bottom from 0.4); otherwise a flat `background` (Request summary: #F9F9FB).
 */
export function AFSBackHeader({ title, onBack, blur, solid, titleClassName, children }: { title?: ReactNode; onBack: () => void; blur?: boolean; solid?: boolean; titleClassName?: string; children?: ReactNode }) {
  return (
    <div className={styles.backHeader}>
      {blur && <div className={styles.backHeaderBlur} aria-hidden />}
      {solid && <div className={styles.backHeaderSolid} aria-hidden />}
      <div className={styles.backHeaderContent}>
        <Pressable className={styles.backButton} scale={0.96} onClick={onBack} aria-label="Back">
          <MaskIcon src={icons.slimChevronLeft} size={20} color="var(--nk-color-text-primary)" className={styles.flipRtl} />
        </Pressable>
        <span className={[styles.backHeaderTitle, titleClassName].filter(Boolean).join(' ')}>{title}</span>
        {children}
      </div>
    </div>
  );
}
