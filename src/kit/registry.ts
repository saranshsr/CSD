import { pageAliases } from './routes';
import type { FlowDef, Route, ScreenDef, ScreenTruth } from './types';

export function defineFlow(flow: FlowDef): FlowDef {
  return flow;
}

export function defineScreen<P>(screen: ScreenDef<P>): ScreenDef<P> {
  return screen;
}

/**
 * Which reference is the spec for a screen: its explicit `truth`, else inferred from `source` — a Figma frame
 * plus bappzaar paths → `mixed`, a Figma frame alone → `figma`, a shared link / screenshot → `reference`,
 * anything else (bappzaar master paths) → `bappzaar`.
 */
export function screenTruth(screen: Pick<ScreenDef, 'truth' | 'source'>): ScreenTruth {
  if (screen.truth) return screen.truth;
  const src = screen.source ?? '';
  // a user-shared repo (`repo owner/name …`, github.com) is a reference, not bappzaar, even when it cites src/ paths
  const sharedRepo = /\brepo [\w.-]+\/[\w.-]+|github\.com\//i.test(src);
  const bappzaar = !sharedRepo && /marketplaces\/|src\/|screens\/|components\/|Noon[A-Z]/.test(src);
  if (/figma/i.test(src)) return bappzaar ? 'mixed' : 'figma';
  if (/^reference:|github\.com|vercel\.app|https?:/i.test(src) && !bappzaar) return 'reference';
  return 'bappzaar';
}

export interface ResolvedScreen {
  flow: FlowDef;
  screen: ScreenDef;
  route: Route;
}

export function createRegistry(flows: FlowDef[]) {
  const byRoute = new Map<string, ResolvedScreen>();
  /** URL name → route: kit/routes.ts page aliases (only for registered screens) + each screen's own `path`. */
  const byAlias = new Map<string, Route>();
  for (const [alias, route] of Object.entries(pageAliases)) byAlias.set(alias, route);
  for (const flow of flows) {
    for (const screen of flow.screens) {
      const route = `${flow.id}/${screen.id}`;
      byRoute.set(route, { flow, screen, route });
      for (const p of [screen.path ?? []].flat()) byAlias.set(p.replace(/^\//, ''), route);
    }
  }

  /**
   * Accepts `flow/screen`, a bare `screen` of `currentFlow`, a page alias (`homepage`, `plp`, `cart` … see
   * kit/routes.ts or `ScreenDef.path`) or `flow` (→ its initial screen). A leading `/` is ignored.
   */
  function qualify(input: Route, currentFlow?: string): Route {
    const route = input.replace(/^\/+/, '');
    if (route.includes('/')) return route;
    // a screen of the current flow wins over a global alias (e.g. checkout's own `add-card`)
    if (currentFlow && byRoute.has(`${currentFlow}/${route}`)) return `${currentFlow}/${route}`;
    const alias = byAlias.get(route);
    if (alias && byRoute.has(alias)) return alias;
    const flow = flows.find((f) => f.id === route);
    if (flow) return `${flow.id}/${flow.initial}`;
    if (currentFlow) return `${currentFlow}/${route}`;
    return route;
  }

  /** Shortest URL for a route: its first alias (e.g. `homepage`), else `flow` for an initial screen, else `flow/screen`. */
  function pathFor(route: Route): string {
    if (byRoute.has(route)) for (const [alias, r] of byAlias) if (r === route) return alias;
    const [flowId, screenId] = route.split('/');
    return flows.find((f) => f.id === flowId)?.initial === screenId ? flowId : route;
  }

  /** Every URL name that opens a page, for docs / search. */
  function aliases() {
    return [...byAlias.entries()].filter(([, r]) => byRoute.has(r));
  }

  function resolve(route: Route, currentFlow?: string): ResolvedScreen | undefined {
    return byRoute.get(qualify(route, currentFlow));
  }

  return { flows, qualify, resolve, pathFor, aliases, all: () => [...byRoute.values()] };
}

export type Registry = ReturnType<typeof createRegistry>;
