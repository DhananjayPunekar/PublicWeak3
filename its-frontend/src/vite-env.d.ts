/// <reference types="vite/client" />

/** Environment variables read by the application (all optional). */
interface ImportMetaEnv {
  /** Base URL for API calls; empty = same origin through the Vite proxy. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
