/**
 * Figma-style smoothed rectangle ("corner smoothing") as an SVG path, for `clip-path: path()`.
 * Same geometry as Figma's squircle (see figma-squircle): each corner is a circular arc
 * blended into the straight edge with two cubic Béziers spread over (1 + smoothing) × radius.
 */
export function squirclePath(width: number, height: number, radius: number, smoothing: number) {
  const budget = Math.min(width, height) / 2;
  const R = Math.min(radius, budget);
  const rad = (deg: number) => (deg * Math.PI) / 180;

  const maxSmoothing = budget / R - 1;
  const s = Math.max(0, Math.min(smoothing, maxSmoothing));
  const p = Math.min((1 + s) * R, budget);
  const arcMeasure = 90 * (1 - s);
  const arc = Math.sin(rad(arcMeasure / 2)) * R * Math.SQRT2;
  const alpha = (90 - arcMeasure) / 2;
  const p3ToP4 = R * Math.tan(rad(alpha / 2));
  const beta = 45 * s;
  const c = p3ToP4 * Math.cos(rad(beta));
  const d = c * Math.tan(rad(beta));
  const b = (p - arc - c - d) / 3;
  const a = 2 * b;
  const n = (v: number) => +v.toFixed(3);

  return [
    `M ${n(width - p)} 0`,
    `c ${n(a)} 0 ${n(a + b)} 0 ${n(a + b + c)} ${n(d)}`,
    `a ${n(R)} ${n(R)} 0 0 1 ${n(arc)} ${n(arc)}`,
    `c ${n(d)} ${n(c)} ${n(d)} ${n(b + c)} ${n(d)} ${n(a + b + c)}`,
    `L ${width} ${n(height - p)}`,
    `c 0 ${n(a)} 0 ${n(a + b)} ${n(-d)} ${n(a + b + c)}`,
    `a ${n(R)} ${n(R)} 0 0 1 ${n(-arc)} ${n(arc)}`,
    `c ${n(-c)} ${n(d)} ${n(-(b + c))} ${n(d)} ${n(-(a + b + c))} ${n(d)}`,
    `L ${n(p)} ${height}`,
    `c ${n(-a)} 0 ${n(-(a + b))} 0 ${n(-(a + b + c))} ${n(-d)}`,
    `a ${n(R)} ${n(R)} 0 0 1 ${n(-arc)} ${n(-arc)}`,
    `c ${n(-d)} ${n(-c)} ${n(-d)} ${n(-(b + c))} ${n(-d)} ${n(-(a + b + c))}`,
    `L 0 ${n(p)}`,
    `c 0 ${n(-a)} 0 ${n(-(a + b))} ${n(d)} ${n(-(a + b + c))}`,
    `a ${n(R)} ${n(R)} 0 0 1 ${n(arc)} ${n(-arc)}`,
    `c ${n(c)} ${n(-d)} ${n(b + c)} ${n(-d)} ${n(a + b + c)} ${n(-d)}`,
    'Z',
  ].join(' ');
}
