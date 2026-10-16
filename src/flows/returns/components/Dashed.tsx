import { DottedDivider } from '../../../components';

/** AFSDashedSeparator (svg line, dash 4/4, 1px, default $antiFlashWhite #F2F3F7) */
export function Dashed({ color = 'var(--nk-color-border-subtle)', dash = '4, 4' }: { color?: string; dash?: string }) {
  return <DottedDivider color={color} dash={dash} cap="butt" />;
}
