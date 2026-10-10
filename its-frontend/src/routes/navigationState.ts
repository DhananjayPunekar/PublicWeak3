/** State passed with navigate() between pages. */
export interface NavigationState {
  /** One-off success message shown by the layout on the next page. */
  flash?: string;
}

/** Reads the flash message from router location state (if any). */
export function readFlash(state: unknown): string | null {
  if (typeof state === 'object' && state !== null && 'flash' in state) {
    const { flash } = state as NavigationState;
    return typeof flash === 'string' ? flash : null;
  }
  return null;
}
