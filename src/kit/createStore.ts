import { useSyncExternalStore } from 'react';

/**
 * Tiny typed module-level store for flow-local state that has to outlive a screen
 * (sheets and pushed screens are separate stack entries, so they can't share component state).
 *
 *   const store = createStore({ count: 0 });
 *   store.patch({ count: 1 });                      // shallow merge (object or updater)
 *   const count = store.useStore((s) => s.count);   // React hook (useSyncExternalStore)
 *
 * Selectors must return a stable value (a slice of state or a primitive), same as useSyncExternalStore.
 */
export interface Store<S> {
  /** current snapshot */
  get: () => S;
  /** replace the whole state and notify */
  set: (next: S) => void;
  /** shallow-merge a patch (or an updater returning one) and notify */
  patch: (patch: Partial<S> | ((s: S) => Partial<S>)) => void;
  subscribe: (listener: () => void) => () => void;
  /** subscribe a component to the whole state, or to `select(state)` */
  useStore: {
    (): S;
    <T>(select: (s: S) => T): T;
  };
}

export function createStore<S extends object>(initial: S): Store<S> {
  let state = initial;
  const listeners = new Set<() => void>();
  const get = () => state;
  const set = (next: S) => {
    state = next;
    listeners.forEach((l) => l());
  };
  const patch: Store<S>['patch'] = (p) => set({ ...state, ...(typeof p === 'function' ? p(state) : p) });
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };
  function useStore<T>(select?: (s: S) => T): S | T {
    const snapshot: () => S | T = select ? () => select(state) : get;
    return useSyncExternalStore<S | T>(subscribe, snapshot, snapshot);
  }
  return { get, set, patch, subscribe, useStore: useStore as Store<S>['useStore'] };
}
