import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../services/httpClient';

/** State returned by {@link useApi}. */
export interface ApiState<T> {
  /** Loaded data, or null while loading / after an error. */
  data: T | null;
  /** True while the request is running. */
  loading: boolean;
  /** Error message to show, or null. */
  error: string | null;
  /** Runs the request again. */
  reload: () => void;
}

/**
 * Loads data when the component mounts and whenever `loader` changes.
 * Wrap the loader in useCallback so it only changes when its inputs change.
 * Responses that arrive after the component unmounted (or after a newer
 * request started) are ignored.
 */
export function useApi<T>(loader: () => Promise<T>): ApiState<T> {
  /** Result of the latest request. */
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null,
    loading: true,
    error: null,
  });
  /** Incremented by reload() to trigger a new request. */
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    loader()
      .then((data) => {
        if (active) {
          setState({ data, loading: false, error: null });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({ data: null, loading: false, error: getErrorMessage(error) });
        }
      });
    return () => {
      active = false;
    };
  }, [loader, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);
  return { ...state, reload };
}
