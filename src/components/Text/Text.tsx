import type { CSSProperties, ElementType, ReactNode } from 'react';
import type { colors, type as typeScale } from '../../foundations/tokens';

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export interface TextProps {
  variant?: keyof typeof typeScale;
  color?: keyof typeof colors | (string & {});
  weight?: 400 | 500 | 600 | 700 | 800;
  size?: number;
  lines?: number;
  align?: CSSProperties['textAlign'];
  as?: ElementType;
  strike?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** render trusted HTML strings like 'Get it <b>Tomorrow</b>' (server-driven copy in bappzaar) */
  html?: string;
}

/** Typography primitive bound to the type scale + colour tokens. */
export function Text({ variant = 'body', color = 'textPrimary', weight, size, lines, align, as: As = 'span', strike, className, style, children, html }: TextProps) {
  const isToken = /^[a-z][a-zA-Z0-9]*$/.test(color);
  const s: CSSProperties = {
    font: `var(--nk-type-${kebab(variant)})`,
    color: isToken ? `var(--nk-color-${kebab(color)})` : color,
    ...(weight ? { fontWeight: weight } : null),
    ...(size ? { fontSize: size } : null),
    ...(align ? { textAlign: align } : null),
    ...(strike ? { textDecoration: 'line-through' } : null),
    ...(lines
      ? { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
      : null),
    ...style,
  };
  if (html !== undefined) return <As className={className} style={s} dangerouslySetInnerHTML={{ __html: html }} />;
  return (
    <As className={className} style={s}>
      {children}
    </As>
  );
}
