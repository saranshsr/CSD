import { Children, type CSSProperties, type ReactNode } from 'react';
import { DottedDivider, Pressable, Spinner } from '../../../components';
import { AccountIconImg } from '../icons';
import styles from '../inner.module.css';
import { ref } from '../../../foundations/tokens';

/**
 * NoonAccountSection: white r14 card, marginHorizontal 15, children separated by a centred 93% dashed divider (NoonAccountDivider).
 * `separator={false}` = `renderSeparator={() => null}`.
 */
export function AccountSection({ children, dash = '4,4', separator = true, style, className }: { children: ReactNode; dash?: string; separator?: boolean; style?: CSSProperties; className?: string }) {
  const items = Children.toArray(children).filter(Boolean);
  return (
    <div className={`${styles.section} ${className ?? ''}`} style={style}>
      {items.map((item, i) => (
        <div key={i}>
          {item}
          {separator && i < items.length - 1 && <DottedDivider height={2} dash={dash} cap="butt" width="93%" centered />}
        </div>
      ))}
    </div>
  );
}

/**
 * NoonAccountSectionItem: row 18/16 padding, before-slot marginEnd 14, title 15/18 500 blueGray900,
 * subtitle 13 blueGray500 (+4), after-slot gap 12 with the noon chevron by default.
 */
export function AccountSectionItem({
  before,
  title,
  subtitle,
  after,
  afterTitle,
  onPress,
  rowStyle,
  beforeStyle,
  titleClass,
  subtitleClass,
}: {
  before: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** `undefined` → chevron, `null` → nothing */
  after?: ReactNode | null;
  afterTitle?: ReactNode;
  onPress?: () => void;
  rowStyle?: CSSProperties;
  beforeStyle?: CSSProperties;
  titleClass?: string;
  subtitleClass?: string;
}) {
  const content = (
    <>
      <span className={styles.itemBefore} style={beforeStyle}>
        {before}
      </span>
      <span className={styles.itemText}>
        <span className={styles.itemTitleRow}>
          <span className={`${styles.itemTitle} ${titleClass ?? ''}`}>{title}</span>
          {afterTitle}
        </span>
        {subtitle && <span className={`${styles.itemSubtitle} ${subtitleClass ?? ''}`}>{subtitle}</span>}
      </span>
      <span className={styles.itemAfter}>{after === undefined ? <AccountIconImg name="chevron" flipRtl /> : after}</span>
    </>
  );
  // A row with interactive content in `after` (switch, language toggle) must not be a <button>.
  if (!onPress) {
    return (
      <div className={styles.item} style={rowStyle}>
        {content}
      </div>
    );
  }
  return (
    <Pressable className={styles.item} style={rowStyle} onClick={onPress} scale={0.98}>
      {content}
    </Pressable>
  );
}

/** Two-button row used by the sign-out / clear-cache / notifications sheets (each passes its own button classes). */
export function SheetButtons({
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
  className,
  cancelClass,
  confirmClass,
  disabled,
  loading,
}: {
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  className?: string;
  cancelClass: string;
  confirmClass: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div className={`${styles.sheetButtons} ${className ?? ''}`}>
      <Pressable className={cancelClass} onClick={onCancel} disabled={disabled} scale={0.97}>
        {cancelLabel}
      </Pressable>
      <Pressable className={confirmClass} onClick={onConfirm} disabled={disabled} scale={0.97}>
        {loading ? <Spinner color={ref.color('textInverse')} track={ref.palette('whiteAlpha35')} /> : confirmLabel}
      </Pressable>
    </div>
  );
}

/** NoonAccountBottomSheetScreen body: turns the kit sheet into the floating #F9F9FB r16 card (AddressV2FloatingOverlay). */
export function SheetBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.sheetBody} ${className ?? ''}`}>{children}</div>;
}
