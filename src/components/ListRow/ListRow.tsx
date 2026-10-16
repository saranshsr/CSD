import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon/Icon';
import { OriginIcon } from '../Icon/OriginIcon';
import { Pressable } from '../Pressable/Pressable';
import { DashedDivider } from '../Divider/Divider';
import { field, radius, ref, spacing } from '../../foundations/tokens';
import { fieldMotion } from '../../motion/presets';
import styles from './ListRow.module.css';

export interface ListRowProps {
  icon?: IconName;
  iconNode?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  danger?: boolean;
  paddingY?: number;
  /** `field`: Field DS M-ListItem look (opt-in); `default` (NoonAccountSectionItem) is unchanged */
  variant?: 'default' | 'field';
  /** field variant: `small` (B14 SemiBold title, default) · `big` (H16 Bold title) */
  size?: 'small' | 'big';
  /** field variant: 24 × 24 leading slot (replaces `iconNode` / `icon`) */
  leading?: ReactNode;
  /** field variant: 16 × 16 slot inline after the title (badge, status dot) */
  titleSlot?: ReactNode;
  /** field variant: trailing slot (Switch, button, close…); replaces the chevron. Mirrored in RTL. */
  trailing?: ReactNode;
  /** accessible name for a pressable row */
  'aria-label'?: string;
}

/** NoonAccountSectionItem: padding 18/16, 20px icon, 15/500 #1D2539 title, chevron. `variant="field"`: Field M-ListItem. */
export function ListRow(props: ListRowProps) {
  if (props.variant === 'field') return <FieldListRow {...props} />;
  const { icon, iconNode, title, subtitle, right, chevron = true, onPress, danger, paddingY = spacing.s18 } = props;
  return (
    <Pressable
      onClick={onPress}
      asDiv={!onPress}
      scale={onPress ? 0.98 : 1}
      style={{ display: 'flex', alignItems: 'center', width: '100%', padding: `${paddingY}px ${spacing.s16}px`, gap: spacing.s14, color: danger ? ref.color('danger') : ref.color('textPrimary') }}
    >
      {iconNode ?? (icon && <Icon name={icon} size={20} strokeWidth={1.7} />)}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing.s4 }}>
        <span style={{ font: ref.type('text15MediumLh18') }}>{title}</span>
        {subtitle && <span style={{ font: ref.type('text13RegularLh16'), color: ref.palette('blueGray500') }}>{subtitle}</span>}
      </span>
      {right}
      {chevron && <Icon name="chevronRight" size={18} color={ref.color('textSecondary')} flipRtl />}
    </Pressable>
  );
}

/**
 * Field DS M-ListItem (`@field-ds/components` ListItem/ListItem.tsx): surfacePrimary row, padding 12, gap 8, 24 × 24
 * leading slot, title B14 SemiBold (`size="big"`: H16 Bold) textPrimary with a 16 × 16 `titleSlot` 8 after it,
 * subtitle B12 Regular Field textSecondary (2 lines, 2 below), `trailing` slot (default: 20px chevron-right in Field
 * textSecondary, as the Field playground; `chevron={false}` hides it), mirrored in RTL. Pressable rows dip to
 * opacity .85 (no scale). `right` still renders before the trailing slot; `danger` tints the title Field textError.
 */
function FieldListRow({ icon, iconNode, title, subtitle, right, chevron = true, onPress, danger, size = 'small', leading, titleSlot, trailing, 'aria-label': ariaLabel }: ListRowProps) {
  const lead = leading ?? iconNode ?? (icon && <Icon name={icon} size={20} strokeWidth={1.7} />);
  const trail = trailing ?? (chevron ? <OriginIcon name="chevron-right" size={20} color={field.textSecondary} /> : null);
  return (
    <Pressable
      className={styles.field}
      data-size={size}
      onClick={onPress}
      asDiv={!onPress}
      tabIndex={onPress ? undefined : -1}
      role={onPress ? undefined : 'group'}
      aria-label={ariaLabel}
      scale={1}
      whileTap={onPress ? { opacity: fieldMotion.pressOpacity } : undefined}
      transition={{ duration: fieldMotion.duration.xs }}
    >
      {lead != null && lead !== false && <span className={styles.leading}>{lead}</span>}
      <span className={styles.body}>
        <span className={styles.titleRow}>
          <span className={styles.title} style={danger ? { color: field.textError } : undefined}>
            {title}
          </span>
          {titleSlot != null && <span className={styles.titleSlot}>{titleSlot}</span>}
        </span>
        {subtitle != null && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      {right}
      {trail != null && <span className={styles.trailing}>{trail}</span>}
    </Pressable>
  );
}

/** White r14 card of ListRows separated by dashed lines. */
export function ListGroup({ children, margin = `0 ${spacing.s15}px` }: { children: ReactNode[] | ReactNode; margin?: string | number }) {
  const items = (Array.isArray(children) ? children : [children]).filter(Boolean);
  return (
    <div style={{ background: ref.color('bgSurface'), borderRadius: radius.r14, margin, overflow: 'hidden' }}>
      {items.map((c, i) => (
        <div key={i}>
          {i > 0 && <DashedDivider />}
          {c}
        </div>
      ))}
    </div>
  );
}
