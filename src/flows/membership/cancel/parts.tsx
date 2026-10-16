import type { CSSProperties } from 'react';
import { HtmlText, type HtmlStylesheet } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { icons } from '../assets';
import { memberColor, VipButton } from '../components/primitives';
import { mb } from '../tokens';
import type { CButton, Reminder } from './cancelData';
import styles from './parts.module.css';

/** HtmlView stylesheet helper: `p` = root font + colour (+ extra), `highlight` = successTag unless overridden. */
export const sheet = (font: string, color: string, extra: CSSProperties = {}, more: HtmlStylesheet = {}): HtmlStylesheet => ({
  p: { font, color, ...extra },
  highlight: { color: ref.color('bestPriceInk') },
  ...more,
});

/** server button icon (iconAfterTextUrl) — 20×20 on unused-seats, 14×14 elsewhere */
export function ButtonIcon({ url, size = 14 }: { url?: string; size?: number }) {
  if (!url) return null;
  return <img src={url} alt="" width={size} height={size} className={styles.buttonIcon} />;
}

/**
 * The owner-overlay button row (VIPUnusedSeats / PlanOption / CancelGroupSavings / LoseAccessWarning):
 * row, gap 12; buttons flex 1, r12, border 1, row + gap; text b16 semibold; server colours.
 */
export function OverlayButtons({ buttons, onPress, height = 48, gap = 8, iconSize = 14, singleFull, marginTop }: { buttons?: CButton[]; onPress: (b: CButton) => void; height?: number; gap?: number; iconSize?: number; singleFull?: boolean; marginTop?: number }) {
  if (!buttons?.length) return null;
  return (
    <div className={styles.buttons} style={{ marginTop }}>
      {buttons.map((b, i) => (
        <VipButton
          key={`${b.cta}_${i}`}
          className={styles.button}
          style={{
            height,
            gap,
            background: b.backgroundColor ?? ref.color('textStrong'),
            borderColor: b.borderColor ?? 'transparent',
            color: b.textColor ?? ref.color('textInverse'),
            ...(singleFull && buttons.length === 1 ? { flex: '0 0 100%' } : null),
          }}
          onPress={() => onPress(b)}
          after={<ButtonIcon url={b.iconAfterTextUrl} size={iconSize} />}
        >
          <span className={styles.buttonText}>{b.text}</span>
        </VipButton>
      ))}
    </div>
  );
}

/** screens/shared/vipOverlayReminderStyles — white r12 card, padding 12, gap 4; bell 16 + error-red 13/18 bold title; b12 description. */
export function OverlayReminder({ reminder }: { reminder?: Reminder }) {
  if (!reminder) return null;
  const color = reminder.textColor ?? ref.color('textMuted');
  return (
    <div className={styles.reminder} style={{ background: reminder.backgroundColor }}>
      <div className={styles.reminderHeader}>
        <img src={reminder.iconUrl ?? icons.reminderBell} alt="" width={16} height={16} />
        <span className={styles.reminderTitle} style={{ color: reminder.titleColor }}>
          {reminder.title}
        </span>
      </div>
      <HtmlText value={reminder.description} stylesheet={{ p: { font: ref.type('text12RegularLh18'), letterSpacing: mb.space('mbLs10'), color }, b: { color }, span: { color, fontWeight: 700 } }} />
    </div>
  );
}

/**
 * VIPPlanMembers — `max` rings overlapping by `overlap`; filled seats = VIPPlanMemberColors[i] with white initial
 * (size / 2, bold), empty seats = surfaceMuted fill + 10×10 1.5px textMuted plus. Ring 1.6px white.
 */
export function PlanMembers({ members, size = 28, overlap = 10, max = 5, emptyBg = ref.color('border'), containerBg, className }: { members: { name: string }[]; size?: number; overlap?: number; max?: number; emptyBg?: string; containerBg?: string; className?: string }) {
  const stroke = 1.6;
  const outer = size + stroke;
  return (
    <div className={[styles.members, className].filter(Boolean).join(' ')} style={{ background: containerBg, borderColor: containerBg ?? 'transparent' }}>
      {Array.from({ length: max }, (_, i) => {
        const m = members[i];
        const ring: CSSProperties = { width: outer, height: outer, borderWidth: stroke, marginInlineStart: i === 0 ? 0 : -overlap, zIndex: max - i };
        return m ? (
          <span key={i} className={styles.ring} style={ring}>
            <span className={styles.fill} style={{ background: memberColor(i), fontSize: size / 2 }}>
              {m.name?.trim()?.[0]?.toUpperCase() || ' '}
            </span>
          </span>
        ) : (
          <span key={i} className={styles.ring} style={ring}>
            <span className={styles.fill} style={{ background: emptyBg }}>
              <span className={styles.plus} />
            </span>
          </span>
        );
      })}
    </div>
  );
}
