import type { ApiErrorBody } from '../models/api';

/**
 * Base URL prepended to every request. Empty by default: requests go to
 * relative URLs (e.g. `/api/users`) and the Vite dev server proxies them to
 * the API Gateway (see vite.config.ts). Set VITE_API_BASE_URL to call a
 * gateway directly (the gateway must then allow CORS).
 */
const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '';

/** Requests taking longer than this are aborted (milliseconds). */
const REQUEST_TIMEOUT_MS = 15_000;

/** HTTP methods used by the application. */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Error thrown for every failed request. `status` is 0 when the server could
 * not be reached at all.
 */
export class ApiError extends Error {
  /** HTTP status code, or 0 for network failures / timeouts. */
  readonly status: number;
  /** Per-field validation messages sent by the back end (may be empty). */
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/** True if the parsed JSON looks like the back end's ApiError body. */
function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return typeof value === 'object' && value !== null && 'status' in value;
}

/** Reads the response body as JSON, or returns null for an empty / non-JSON body. */
async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/** Builds a readable message for a failed response. */
function describeFailure(status: number, body: unknown): ApiError {
  if (isApiErrorBody(body)) {
    const fieldErrors = body.fieldErrors ?? {};
    const details = Object.values(fieldErrors);
    // The gateway's own error bodies (e.g. 503 when a service is not registered yet) have no message.
    const fallback = status >= 500
      ? `A back-end service is not available right now (HTTP ${status}). Please try again in a moment.`
      : body.error ?? `Request failed with status ${status}`;
    const base = body.message || fallback;
    // "Validation failed" alone is not helpful - append the field messages.
    const message = details.length > 0 ? `${base}: ${details.join('; ')}` : base;
    return new ApiError(status, message, fieldErrors);
  }
  if (status >= 500) {
    return new ApiError(
      status,
      `The server is not responding (HTTP ${status}). Please make sure the API gateway and services are running.`,
    );
  }
  return new ApiError(status, `Request failed with status ${status}`);
}

/**
 * Sends a JSON request and returns the parsed JSON response.
 *
 * @param method HTTP method
 * @param path   path starting with `/api/...`
 * @param body   optional request body, sent as JSON
 * @throws ApiError when the request fails or the response status is not 2xx
 */
async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'AbortError';
    throw new ApiError(
      0,
      timedOut
        ? 'The server took too long to respond. Please try again.'
        : 'Unable to reach the server. Please check that the API gateway (port 8080) is running.',
    );
  } finally {
    window.clearTimeout(timer);
  }

  const data = await readJson(response);
  if (!response.ok) {
    throw describeFailure(response.status, data);
  }
  return data as T;
}

/** Thin typed wrapper around fetch used by every service module. */
export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

/** Returns a message suitable for showing to the user for any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
