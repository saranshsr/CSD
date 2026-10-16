import { motion } from 'motion/react';
import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { fieldMotion } from '../../motion/presets';
import { useReduceMotion } from '../../motion/reducedMotion';
import { field } from '../../foundations/tokens';
import { OriginIcon } from '../Icon/OriginIcon';
import type { OriginIconName } from '../Icon/originIcons';
import { Pressable } from '../Pressable/Pressable';
import styles from './Accordion.module.css';

export interface AccordionProps {
  title: ReactNode;
  /** body; a string renders as B14 Regular textPrimary, nodes render as is */
  children?: ReactNode;
  /** controlled open state (pair with `onExpandedChange`) */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** uncontrolled initial state */
  defaultExpanded?: boolean;
  /** 20px icon before the title: an Origin icon name or any node */
  iconLeft?: OriginIconName | ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Field DS M-Accordion (`@field-ds/components` Accordion/Accordion.tsx): disclosure row that reveals its body on tap.
 * Outer surfacePrimary r12 (clips); header min 44h, padding 12, gap 8, surfaceSecondary, optional 20px `iconLeft`
 * 4 from a B14 SemiBold textPrimary title, 20px chevron-down that turns 180° open; header pressed opacity .85. A 1px
 * surfacePrimary hairline separates the body (surfaceSecondary, padding 12). The body is uncovered, not stretched:
 * height 0 ↔ auto + an opacity ramp, 320ms open / 260ms close on `fieldMotion.ease.standard`; instant with reduced
 * motion. Controlled (`expanded` + `onExpandedChange`) or uncontrolled (`defaultExpanded`).
 *
 *   <Accordion title="Specifications" iconLeft="info-circle">Water resistant to 50m.</Accordion>
 */
export function Accordion({ title, children, expanded: controlled, onExpandedChange, defaultExpanded = false, iconLeft, className, style }: AccordionProps) {
  const [internal, setInternal] = useState(defaultExpanded);
  const expanded = controlled ?? internal;
  const reduce = useReduceMotion();
  const id = useId();
  const bodyId = `${id}-body`;
  const headerId = `${id}-header`;
  const toggle = () => {
    const next = !expanded;
    if (controlled === undefined) setInternal(next);
    onExpandedChange?.(next);
  };

  const { duration, ease } = fieldMotion;
  const open = reduce ? 0 : duration.xl;
  const close = reduce ? 0 : duration.lg;
  const icon = typeof iconLeft === 'string' ? <OriginIcon name={iconLeft as OriginIconName} size={20} color={field.textPrimary} /> : iconLeft;

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} style={style}>
      <Pressable
        className={styles.header}
        scale={1}
        whileTap={{ opacity: fieldMotion.pressOpacity }}
        transition={{ duration: duration.xs }}
        id={headerId}
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={bodyId}
      >
        <span className={styles.titleBlock}>
          {icon != null && <span className={styles.icon}>{icon}</span>}
          <span className={styles.title}>{title}</span>
        </span>
        <motion.span
          className={styles.chevron}
          initial={false}
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: expanded ? open : close, ease: ease.standard }}
        >
          <OriginIcon name="chevron-down" size={20} color={field.textPrimary} />
        </motion.span>
      </Pressable>
      <motion.div
        id={bodyId}
        role="region"
        aria-labelledby={headerId}
        className={styles.body}
        initial={false}
        animate={expanded ? 'open' : 'closed'}
        variants={{
          // opacity reaches 1 by half-way on open; on close it holds, then fades over the second half
          open: { height: 'auto', opacity: 1, transition: { height: { duration: open, ease: ease.standard }, opacity: { duration: open / 2, ease: ease.standard } } },
          closed: { height: 0, opacity: 0, transition: { height: { duration: close, ease: ease.standard }, opacity: { duration: close / 2, delay: close / 4, ease: ease.standard } } },
        }}
        aria-hidden={!expanded}
        inert={!expanded}
      >
        <div className={styles.hairline} />
        <div className={styles.details}>{typeof children === 'string' ? <p className={styles.text}>{children}</p> : children}</div>
      </motion.div>
    </div>
  );
}
