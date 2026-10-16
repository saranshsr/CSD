import { Pressable, Switch } from '../../../components';
import { ref } from '../../../foundations/tokens';
import { haptic } from '../../../motion/haptics';
import { copy } from '../data';
import { reviewsMotion as M, reviewsTokens } from '../tokens';
import styles from './AiToggle.module.css';

export interface AiToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  /** 'outline' = ManualReview (1px hairline, flat) · 'raised' = NewReview (0 4px 6px black 4%) */
  look?: 'outline' | 'raised';
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * AiToggle — the "Write with AI · Turn your picks into a review" card (repo src/screens/ManualReviewScreen.tsx
 * WriteWithAICard + SpringToggle, NewReviewScreen.tsx WriteWithAICard; Figma KzR8dy12uT8CtgBRHHY6Qx · 6042:140824).
 * The switch is the central `Switch` at the repo geometry (42×24, knob 20, inset 2): on = the orange → pink →
 * violet AI track (`--nk-color-reviews-ai-track`), off = `borderStrong`; the knob slides on repo spring.snappy
 * and carries the 4.8px knob shadow. The whole switch dips to .92 on press, `tap` haptic.
 * Margins are the caller's (repo: 12px inline).
 */
export function AiToggle({ enabled, onChange, look = 'outline', title = copy.writeWithAi, subtitle = copy.writeWithAiSub, className }: AiToggleProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')} data-look={look}>
      <div className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </div>
      <Pressable
        className={styles.press}
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        scale={M.press.toggle}
        transition={M.spring.snappy}
        onClick={() => {
          haptic('tap');
          onChange(!enabled);
        }}
      >
        <Switch
          as="span"
          className={styles.switch}
          value={enabled}
          {...reviewsTokens.aiSwitch}
          onColor="var(--nk-color-reviews-ai-track)"
          offColor={ref.color('borderStrong')}
          transition={M.spring.snappy}
        />
      </Pressable>
    </div>
  );
}
