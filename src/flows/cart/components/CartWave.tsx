/** NoonCartWave: 80×36 (viewBox 80×40, preserveAspectRatio none) — the curved tab edge used by group headers + footer savings. */
export function CartWave({ color, height = 36, className, style }: { color: string; height?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg width="80" height={height} viewBox="0 0 80 40" preserveAspectRatio="none" className={className} style={{ display: 'block', ...style }} aria-hidden>
      <path
        d="M0 0 L0 40 L14.71 40 L14.71 40.08 L79.77 39.95 C79.77 39.95 63.16 39.34 56.20 34.01 C49.24 28.68 45.54 20.66 42.61 16.33 C39.67 11.99 35.88 4.38 30.07 1.97 C24.51 -0.35 15.99 -0.09 15.23 -0.07 L15.23 -0.08 L14.77 -0.08 L0 0 Z"
        fill={color}
      />
    </svg>
  );
}
