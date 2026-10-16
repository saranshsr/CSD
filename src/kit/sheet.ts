import { createContext, useContext } from 'react';
import type { SheetOptions } from './types';

export interface SheetContext {
  layout: NonNullable<SheetOptions['layout']>;
  /** the navigator draws a grabber — so no close button (Origin rule) */
  grabber: boolean;
  dismiss: () => void;
}

export const SheetCtx = createContext<SheetContext | null>(null);

/** Inside a sheet screen: how the navigator framed it (`null` when the screen isn't presented as a sheet). */
export const useSheet = () => useContext(SheetCtx);

export const resolveSheet = (o: SheetOptions | SheetOptions['layout'] | undefined) => {
  const opts = typeof o === 'string' ? { layout: o } : (o ?? {});
  return { layout: opts.layout ?? 'origin', grabber: opts.grabber ?? true, surface: opts.surface, dismissible: opts.dismissible ?? true, inset: opts.inset, bottomGap: opts.bottomGap } as const;
};
