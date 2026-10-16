import type { ComponentType, ReactNode } from 'react';
import type { TokenOverrides } from '../foundations/tokens';
import type { TransitionName } from '../motion/transitions';

/** `flowId/screenId`, e.g. `pdp/detail`. A bare `screenId` resolves inside the current flow. */
export type Route = string;

export type Presentation =
  /** full-screen page pushed on the stack */
  | 'screen'
  /** bottom sheet over the current screen, with scrim + drag-to-dismiss */
  | 'sheet'
  /** full-screen modal sliding up from the bottom */
  | 'modal';

/**
 * How a `presentation: 'sheet'` screen is framed.
 * - `origin` (default): Origin Design System M-BottomSheet — bold scrim, grabber ABOVE the sheet, sheet floats with a
 *   12px inset and r16 on all corners, max 680 high; the screen fills it with <SheetHeader> / <SheetBody> / <SheetFooter>.
 * - `classic`: the edge-to-edge sheet the bappzaar ports use (r24 top corners, grabber inside) — keep it for 1:1 ports.
 * - `floating`: bappzaar OverlayBottomSheet `isFloating` 1:1 — scrim rgba(30,30,30,0.7), #B7B7B7 handle 18px above the
 *   sheet (tap or drag closes), 12px side inset, r16, 60px top gap, bottom gap = safe area (15 without one).
 * A sheet with a grabber never shows a close button; `grabber: false` makes <SheetHeader> show the close (X) instead.
 */
export interface SheetOptions {
  layout?: 'origin' | 'classic' | 'floating';
  /** default true — drag the grabber down to dismiss */
  grabber?: boolean;
  /** sheet fill (origin, floating and classic, grabber zone included), any surface colour, e.g. `var(--nk-color-bg-subtle)` */
  surface?: string;
  /** default true — tapping the scrim dismisses */
  dismissible?: boolean;
  /** floating only: side inset in px (default `--nk-sheet-floating-inset`, 12), e.g. 8 for a gorhom `detached` sheet */
  inset?: number;
  /** floating only: minimum gap under the sheet in px (default `--nk-sheet-floating-bottom-gap`, 15; the safe area wins if larger) */
  bottomGap?: number;
}

export interface ScreenProps<P = Record<string, unknown>> {
  params: P;
}

export type ScreenTruth = 'bappzaar' | 'figma' | 'mixed' | 'reference';

export interface ScreenDef<P = any> {
  id: string;
  title: string;
  component: ComponentType<ScreenProps<P>>;
  presentation?: Presentation;
  /** sheet framing when presented as a sheet (default: Origin M-BottomSheet); `'classic'` is shorthand for `{ layout: 'classic' }` */
  sheet?: SheetOptions | SheetOptions['layout'];
  /**
   * The stack layer has no page background, so the screen below stays visible: for bappzaar modals that draw their own
   * scrim and floating card over the current page (e.g. AddressV2SelectScreen with `isBottomSheet`). Pair with `transition: 'fade'`.
   */
  transparent?: boolean;
  /** default transition when this screen is opened; can be overridden per navigation */
  transition?: TransitionName;
  /** status bar content colour on top of this screen */
  statusBar?: 'dark' | 'light';
  /** default params used when the screen is opened from the playground sidebar */
  defaultParams?: P;
  /** shown in the playground notes panel — what this screen demonstrates */
  notes?: string;
  /** where this was ported from: bappzaar master path(s), `Figma <fileKey> · <node>`, or `reference: <what the user shared>` */
  source?: string;
  /**
   * Which reference wins when they disagree. `bappzaar` = the RN app on master is the spec (layout, values, behaviour);
   * `figma` = the Figma frame in `source` is the spec; `mixed` = Figma for the look, bappzaar for behaviour (spell out
   * per area in the flow's MAPPING.md / FIGMA-MAPPING.md); `reference` = something the user shared. Omitted → inferred
   * from `source` (see `screenTruth` in kit/registry.ts). On a conflict the agent asks; it never silently picks.
   */
  truth?: ScreenTruth;
  /** last date (YYYY-MM-DD) the screen was compared against its reference, side by side */
  verified?: string;
  /** where Back goes when this screen is the only one in the stack (opened directly / by URL); overrides FlowDef.parent */
  parent?: Route;
  /** extra URL names for this screen, e.g. `['homepage']` → open it at `/homepage` (see kit/routes.ts) */
  path?: string | string[];
}

export interface FlowDef {
  id: string;
  title: string;
  description?: string;
  /** playground sidebar grouping, e.g. "Shopping", "Post-order", "Profile" */
  group?: string;
  initial: string;
  screens: ScreenDef[];
  /** flow-scoped token overrides — only affect screens of this flow */
  tokens?: TokenOverrides;
  /** screen rendered behind a sheet/modal route when it is opened directly (default: `initial`) */
  sheetBackdrop?: Route;
  /** where Back goes from this flow's screens when they're opened directly (no history). Default: home, except tab roots (no back). */
  parent?: Route;
  /** show the bottom tab bar on these screens; `variant: 'field'` = opt-in Field DS M-Bottomnav look (default: bappzaar bar) */
  /**
   * Bottom tabs on these screens. `variant`: unset = Liquid Glass (bappzaar liquid-upgrade), `'classic'` = the opaque
   * pre-iOS-26 bar, `'field'` = Field DS M-Bottomnav. `scrollHide` (glass, default true): the bar slides off while the
   * screen scrolls down and returns on scroll up / at the top (ScrollVisibilityProvider).
   */
  tabBar?: { tab: TabId; screens: string[]; variant?: 'classic' | 'field'; scrollHide?: boolean };
}

export type TabId = 'home' | 'categories' | 'deals' | 'account' | 'cart';

export interface NavigateOptions {
  transition?: TransitionName;
  presentation?: Presentation;
}

export interface StackEntry {
  key: string;
  route: Route; // always fully qualified flow/screen
  params: Record<string, unknown>;
  presentation: Presentation;
  transition: TransitionName;
}

/** `nav.toast(title, opts)` — rendered as the Origin M-Toast (<Snackbar>); two or more queued stack (M-Stacked Toast). */
export interface ToastOptions {
  /** leading asset (icon / avatar, 20–40) */
  icon?: ReactNode;
  /** trailing button, or `'close'` for the Field M-Toast round ✕ (dismisses this toast) */
  action?: { label: string; onPress: () => void } | 'close';
  duration?: number;
  /** M-Toast Type: dark (default) · light · error · success. Wins over `tone`. */
  type?: 'dark' | 'light' | 'error' | 'success';
  /** legacy alias of `type`: default → dark */
  tone?: 'default' | 'success' | 'error';
  /** one-line subtitle under the title */
  subtitle?: string;
  /** makes the subtitle a link with a trailing chevron */
  onSubtitlePress?: () => void;
}
