/**
 * Error body returned by every back-end service
 * (GlobalExceptionHandler -> ApiError record).
 */
export interface ApiErrorBody {
  timestamp?: string;
  /** HTTP status code. */
  status: number;
  /** HTTP reason phrase, e.g. "Not Found". */
  error?: string;
  /** Human-readable explanation, e.g. "Issue with ID 9 not found". */
  message?: string;
  /** Request path that failed. */
  path?: string;
  /** Only present for validation errors: field name -> message. */
  fieldErrors?: Record<string, string>;
}

/** Body of simple confirmation responses (e.g. after a delete). */
export interface MessageResponse {
  message: string;
}
