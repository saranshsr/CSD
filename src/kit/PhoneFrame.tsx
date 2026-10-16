import type { CSSProperties, ReactNode } from 'react';
import { layout } from '../foundations/tokens';
import { squirclePath } from './squircle';
import styles from './PhoneFrame.module.css';

const screenClip = `path('${squirclePath(layout.deviceWidth, layout.deviceHeight, layout.screenRadius, layout.screenSmoothing)}')`;

/**
 * iPhone-style screen (390×844) with status bar + home indicator: no bezel, no island, corners clipped to a
 * smoothed squircle (layout.screenRadius, layout.screenSmoothing). `frameless` renders the bare viewport.
 */
export function PhoneFrame({ children, statusBar = 'dark', frameless, scale = 1, time = '9:41' }: { children: ReactNode; statusBar?: 'dark' | 'light' | 'light-top'; frameless?: boolean; scale?: number; time?: string }) {
  const vars = {
    '--nk-inset-top': `${layout.statusBar}px`,
    '--nk-inset-bottom': `${layout.homeIndicator}px`,
    width: layout.deviceWidth,
    height: layout.deviceHeight,
    clipPath: frameless ? undefined : screenClip,
  } as CSSProperties;
  return (
    <div className={frameless ? styles.frameless : styles.device} style={{ transform: scale !== 1 ? `scale(${scale})` : undefined }}>
      <div className={styles.viewport} style={vars}>
        {children}
        <div className={styles.statusBar} data-tone={statusBar === 'light-top' ? 'light' : statusBar}>
          <span className={styles.time}>{time}</span>
          <span className={styles.sysIcons}>
            <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="7" rx="1" /><rect x="10" y="2.5" width="3" height="9.5" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.3A10.2 10.2 0 0 0 8 .4C5.2.4 2.7 1.5.8 3.3L2 4.6a8.4 8.4 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.6 6.6 0 0 0 8 4c-1.8 0-3.4.7-4.6 1.8l1.2 1.3c.9-.8 2.1-1.3 3.4-1.3Zm0 3.6c-.6 0-1.1.2-1.5.6L8 11.6l1.5-1.6c-.4-.4-.9-.6-1.5-.6Z" /></svg>
            <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x=".5" y=".5" width="23" height="12" rx="3.5" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="currentColor" opacity=".4" /></svg>
          </span>
        </div>
        <div className={styles.homeIndicator} data-tone={statusBar === 'light-top' ? 'dark' : statusBar} />
      </div>
    </div>
  );
}
