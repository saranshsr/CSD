import { AnimatePresence, motion } from 'motion/react';
import { useState, type ReactNode } from 'react';
import { DashedDivider, OriginIcon, Pressable } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { haptic } from '../../../motion/haptics';
import { copy, makeCollapsed } from '../data';
import { reviewsAi, reviewsMotion as M, reviewsTokens } from '../tokens';
import { EyeIcon, SparkleIcon } from './icons';
import styles from './DraftCard.module.css';

// ───────────────────────────────────────── crafting shimmer ─────────────────────────────────────────

/**
 * "Crafting your draft" — sparkle + pink→purple gradient label over 11 shimmering lines (repo
 * src/screens/NewReviewScreen.tsx CraftingLines; Figma 7629:275417). Line widths keep the card as tall as the
 * generated one so nothing jumps when the text lands. The white sweep loops linearly (1.2s, 120ms apart) —
 * a loader, so the loop is allowed (motion.md).
 */
export function CraftingShimmer({ label = copy.crafting }: { label?: string }) {
  return (
    <div className={styles.crafting}>
      <div className={styles.craftHead}>
        <SparkleIcon />
        <span className={styles.craftLabel}>{label}</span>
      </div>
      <div className={styles.lines}>
        {reviewsAi.craftWidths.map((w, i) => (
          <div key={i} className={styles.line} style={{ width: w }}>
            <motion.div className={styles.sweep} aria-hidden initial={{ x: M.craftSweep.from }} animate={{ x: M.craftSweep.to }} transition={{ repeat: Infinity, duration: M.craftSweep.duration, ease: 'linear', delay: i * M.craftSweep.stagger }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ───────────────────────────────────────── actions ─────────────────────────────────────────

/**
 * Draft action: icon + label. 'button' = NewReview ActionButton (40h, r10, 13/16 SemiBold, flex 1);
 * 'pill' = ReviewDraft RoundButton / ReviewDraftB NamePill (36h, fully round, 12/16 SemiBold).
 */
export function DraftAction({ icon, label, onPress, kind = 'button', disabled }: { icon: ReactNode; label: string; onPress?: () => void; kind?: 'button' | 'pill'; disabled?: boolean }) {
  return (
    <Pressable
      className={styles.action}
      data-kind={kind}
      data-disabled={disabled || undefined}
      scale={disabled ? 1 : undefined}
      onClick={
        disabled
          ? undefined
          : () => {
              haptic('tap');
              onPress?.();
            }
      }
    >
      <span className={styles.icon}>{icon}</span>
      {label}
    </Pressable>
  );
}

/** "Hide name" ⇄ "Show name" (eye-off while visible, eye while hidden — as the repo). */
export function NameToggle({ hideName, onToggle, kind = 'button', capitalised }: { hideName: boolean; onToggle: () => void; kind?: 'button' | 'pill'; capitalised?: boolean }) {
  return <DraftAction kind={kind} icon={<EyeIcon off={!hideName} />} label={hideName ? copy.showName : capitalised ? copy.hideNameA : copy.hideName} onPress={onToggle} />;
}

// ───────────────────────────────────────── card ─────────────────────────────────────────

export interface DraftCardProps {
  /** the review text */
  text: string;
  /** 'generating' shows CraftingShimmer and hides the meta (NewReview / RatePastOrders). Default 'generated' */
  phase?: 'generating' | 'generated';
  /**
   * 'inline' — NewReview / RatePastOrders draft (Figma 7629:275417): text 15/22 Regular, "Written by" + name,
   *            dashed `borderStrong` divider, two 40h buttons [Hide name | Edit review].
   * 'review' — ReviewDraft A body (Figma 7116:43925): text 14/20 Medium with show more / show less, plain
   *            attribution 13/18 `textSecondary`, dashed `borderSubtle` divider, two 36h pills [Hide Name | Edit review].
   *            Bottom-rounded only — put the grey product top (polaroid) above it via `header`.
   * 'field'  — ReviewDraft B card (Figma 7159:44106): `header` (ReviewProductHeader compact) + `body` (the
   *            in-place editable field) + "Written by" row with a single name pill on the right.
   */
  look?: 'inline' | 'review' | 'field';
  reviewerName: string;
  hideName: boolean;
  onToggleName: () => void;
  /** "Edit review" (omitted on 'field'); also fires when the text is tapped on 'inline' */
  onEdit?: () => void;
  /** fold the attribution + actions away (NewReview pinned editor open) */
  editing?: boolean;
  /** 'review': collapse long text (> 240 chars) with "show more" / "show less" (default true) */
  collapsible?: boolean;
  /** rendered first, inside the card */
  header?: ReactNode;
  /** replaces the text block (e.g. DraftB's editable textarea) */
  body?: ReactNode;
  className?: string;
}

/**
 * DraftCard — the generated review card (repo src/screens/NewReviewScreen.tsx DraftCard, also used by
 * RatePastOrdersScreen; ReviewDraftScreen.tsx ReviewCard; ReviewDraftScreenB.tsx ReviewCardB). Shimmer →
 * text swap is a blur cross-fade (blur 4px, y 4, repo ease.out ≈ supermall.ease.soft); the meta folds in/out on
 * the repo fold spring (.45s, no bounce); "show more / less" re-flows in place. Name visibility and edit are
 * callbacks — the session's `hideName` lives in the store (reviewsActions.toggleHideName).
 */
export function DraftCard({ text, phase = 'generated', look = 'inline', reviewerName, hideName, onToggleName, onEdit, editing, collapsible = true, header, body, className }: DraftCardProps) {
  const [expanded, setExpanded] = useState(false);
  const generating = phase === 'generating';
  const ease = M.ease.out;

  if (look === 'review') {
    const collapsed = collapsible ? makeCollapsed(text, reviewsTokens.collapseAt, reviewsTokens.collapseTo) : null;
    return (
      <div className={className}>
        {header}
        <motion.div layout transition={M.spring.gentle} className={styles.card} data-look="review">
          <motion.div layout="position" className={styles.reviewTop}>
            <p className={styles.text}>
              {collapsed === null || expanded ? text : collapsed}
              {collapsed !== null && (
                <>
                  {expanded ? ' ' : '… '}
                  <span role="button" tabIndex={0} className={styles.more} onClick={() => setExpanded((v) => !v)}>
                    {expanded ? copy.showLess : copy.showMore}
                  </span>
                </>
              )}
            </p>
            <span className={styles.plainName}>{reviewerName}</span>
          </motion.div>
          <DashedDivider color={ref.color('borderSubtle')} inset={0} margin={`${reviewsTokens.cardGap}px 0`} />
          <div className={styles.actions}>
            <NameToggle kind="pill" capitalised hideName={hideName} onToggle={onToggleName} />
            <DraftAction kind="pill" icon={<OriginIcon name="edit" size={16} />} label={copy.editReview} onPress={onEdit} />
          </div>
        </motion.div>
      </div>
    );
  }

  if (look === 'field') {
    return (
      <div className={[styles.card, className].filter(Boolean).join(' ')} data-look="field">
        {header}
        {body ?? <p className={styles.text}>{text}</p>}
        <div className={styles.fieldFoot}>
          <div className={styles.who}>
            <span className={styles.whoLabel}>{copy.writtenBy}</span>
            <span className={styles.whoName}>{reviewerName}</span>
          </div>
          <NameToggle kind="pill" hideName={hideName} onToggle={onToggleName} />
        </div>
      </div>
    );
  }

  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')} data-look="inline">
      {header}
      <div className={styles.body}>
        <AnimatePresence mode="wait" initial={false}>
          {generating ? (
            <motion.div
              key="crafting"
              initial={{ opacity: 0, filter: `blur(${M.swap.blur}px)` }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: `blur(${M.swap.blur}px)` }}
              transition={{ duration: M.duration.fast, ease }}
            >
              <CraftingShimmer />
            </motion.div>
          ) : (
            <motion.div
              key="text"
              initial={{ opacity: 0, filter: `blur(${M.swap.blur}px)`, y: 4 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: M.duration.base, ease }}
            >
              {body ?? (
                <div className={styles.text} data-draft-text onClick={onEdit}>
                  {text}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence initial={false}>
        {!editing && !generating && (
          <motion.div key="meta" className={styles.meta} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={M.spring.fold}>
            <div className={styles.who}>
              <span className={styles.whoLabel}>{copy.writtenBy}</span>
              <span className={styles.whoName}>{reviewerName}</span>
            </div>
            <DashedDivider color={ref.color('borderStrong')} inset={0} />
            <div className={styles.actions}>
              <NameToggle hideName={hideName} onToggle={onToggleName} />
              {onEdit && <DraftAction icon={<OriginIcon name="edit" size={16} />} label={copy.editReview} onPress={onEdit} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
