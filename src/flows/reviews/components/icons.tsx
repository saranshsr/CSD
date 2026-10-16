/**
 * The few R&R glyphs the Origin icon set (icons.md) doesn't have. Everything else uses <OriginIcon>
 * (chevron-left, cross, edit, camera, gallery, info-circle, star, star-filled, check-circle-filled, mic).
 * Paths are repo geometry (src/screens/NewReviewScreen.tsx EyeOpenIcon / EyeClosedIcon / SparkleIcon); strokes
 * use currentColor, fills use tokens, so nothing here is a raw colour.
 */

/** Eye / eye-off, 16px (repo EyeOpenIcon / EyeClosedIcon) — "Show name" / "Hide name". */
export function EyeIcon({ off, size = 16 }: { off?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M1.33 8S3.7 3.5 8 3.5 14.67 8 14.67 8 12.3 12.5 8 12.5 1.33 8 1.33 8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1.9" stroke="currentColor" strokeWidth="1.3" />
      {off && <path d="M2.6 2.6 13.4 13.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />}
    </svg>
  );
}

/** Two-tone AI sparkle, 20px (repo SparkleIcon): purple main star, pink small star. */
export function SparkleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M9.8 1.6l1.5 4.6 4.6 1.5-4.6 1.5-1.5 4.6-1.5-4.6L3.7 7.7l4.6-1.5z" fill="var(--nk-color-reviews-ai-purple)" />
      <path d="M15.2 11.8l.65 2 2 .65-2 .65-.65 2-.65-2-2-.65 2-.65z" fill="var(--nk-color-reviews-ai-pink)" />
    </svg>
  );
}

/** White exclamation for the amber "Rewrite your review?" badge (repo WarningBadge, 28px). */
export function ExclamationIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden>
      <path d="M14 7v8.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="14" cy="20.5" r="1.6" fill="currentColor" />
    </svg>
  );
}
