import type { CSSProperties, ReactNode } from 'react';
import { HtmlText, Pressable } from '../../../components';
import chevronRight from '@assets/cart/figma/variants-chevron-right.svg';
import type { SalesCallout as SalesCalloutType } from '../data';
import html from './html.module.css';
import styles from './callout.module.css';

/**
 * NoonSalesCallout: optional gradient/solid background (padding 8, r8), optional border (r8, 1px),
 * icon (16×16 default) left or right of the HTML message, trailing button (hyperlink #0F61FF 600 /
 * icon 14×14 / message). Pressing the callout runs the button action.
 */
export function SalesCallout({
  entry,
  sheet = 'plain',
  onAction,
  lines,
  className,
  style,
  wrapperStyle,
  iconSize,
  iconRender,
  children,
}: {
  entry: SalesCalloutType;
  /** html.module.css sheet name (NoonCart HtmlView stylesheets) */
  sheet?: string;
  onAction?: (action: NonNullable<SalesCalloutType['button']>['action']) => void;
  lines?: number;
  className?: string;
  style?: CSSProperties;
  wrapperStyle?: CSSProperties;
  iconSize?: number | { width: number; height: number };
  /** render the icon yourself (for named icons not backed by an image url) */
  iconRender?: (url: string) => ReactNode;
  children?: ReactNode;
}) {
  const colors = entry.background?.colors ?? [];
  const hasBorder = !!entry.background?.border;
  const bg = colors.length > 1 ? `linear-gradient(90deg, ${colors.join(', ')})` : colors[0];
  const size = typeof iconSize === 'number' ? { width: iconSize, height: iconSize } : (iconSize ?? { width: 16, height: 16 });
  const icon = entry.icon?.url ? (iconRender ? iconRender(entry.icon.url) : <img src={entry.icon.url} alt="" style={{ ...size, objectFit: 'contain', flexShrink: 0 }} />) : null;
  const button = entry.button;
  const trailing = button && button.position !== 'nl' ? renderButton(button) : null;
  const body = (
    <span
      className={[styles.wrapper, colors.length ? styles.withBg : '', colors.length && !hasBorder ? styles.bgOnly : ''].join(' ')}
      style={{ background: bg, ...wrapperStyle }}
    >
      <span className={styles.content}>
        {entry.icon?.isLeft && icon}
        <span className={styles.message}>
          <HtmlText base value={entry.message} lines={lines} className={html[sheet]} />
          {button?.position === 'nl' && renderButton(button)}
          {children}
        </span>
        {!entry.icon?.isLeft && icon}
      </span>
      {trailing}
    </span>
  );
  const containerStyle: CSSProperties = { ...(hasBorder ? { borderColor: entry.background!.border! } : null), ...style };
  const cls = [styles.container, hasBorder ? styles.withBorder : '', className].filter(Boolean).join(' ');
  if (!button) {
    return (
      <span className={cls} style={containerStyle}>
        {body}
      </span>
    );
  }
  return (
    <Pressable
      className={cls}
      style={containerStyle}
      scale={1}
      whileTap={{ opacity: 0.6 }}
      onClick={(e) => {
        e.stopPropagation();
        onAction?.(button.action);
      }}
    >
      {body}
    </Pressable>
  );
}

function renderButton(button: NonNullable<SalesCalloutType['button']>) {
  switch (button.type) {
    case 'hyperlink':
      return <span className={styles.hyperlink}>{button.message}</span>;
    case 'icon':
      return (
        <span className={styles.iconButton}>
          <img src={button.icon?.url === 'chevron' ? chevronRight : button.icon?.url} alt="" className={button.icon?.url === 'chevron' ? 'nk-flip-rtl' : undefined} style={{ width: button.icon?.url === 'chevron' ? 16 : 14, height: button.icon?.url === 'chevron' ? 16 : 14, objectFit: 'contain' }} />
        </span>
      );
    case 'message':
      return (
        <span className={styles.messageButton}>
          <HtmlText base value={button.message} />
        </span>
      );
    default:
      return null;
  }
}
