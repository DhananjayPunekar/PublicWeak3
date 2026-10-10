import { useOutletContext } from 'react-router-dom';

/** Data the application layout shares with the page rendered inside it. */
export interface LayoutContextValue {
  /** Text typed in the header search bar. */
  searchText: string;
  /** Reloads the counters in the sidebar (call after creating or changing data). */
  refreshStats: () => void;
}

/** Reads the layout context from inside a page. */
export function useLayoutContext(): LayoutContextValue {
  return useOutletContext<LayoutContextValue>();
}
