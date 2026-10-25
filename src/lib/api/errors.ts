import axios from "axios";

/** Coarse classification of a failed request, so UI can react without parsing strings. */
export type ApiErrorCode =
  | "aborted"
  | "network"
  | "timeout"
  | "auth"
  | "forbidden"
  | "not-found"
  | "validation"
  | "client"
  | "server"
  | "unknown";

/** DRF field errors: `{ "amount": ["This field is required."] }`. */
export type ApiFieldErrors = Record<string, string[]>;

export interface ApiErrorInit {
  message: string;
  status?: number | null;
  code?: ApiErrorCode;
  fieldErrors?: ApiFieldErrors;
  url?: string;
}

function statusToCode(status: number | null): ApiErrorCode {
  if (status === null) return "unknown";
  if (status === 401) return "auth";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 400 || status === 422) return "validation";
  if (status >= 500) return "server";
  if (status >= 400) return "client";
  return "unknown";
}

function defaultMessage(status: number | null): string {
  switch (status) {
    case 401:
      return "You need to sign in to view this.";
    case 403:
      return "You do not have permission to do that.";
    case 404:
      return "That resource does not exist on the server.";
    case null:
      return "Something went wrong talking to the server.";
    default:
      return status >= 500
        ? "The server failed to handle the request."
        : "The request was rejected by the server.";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asMessages(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return [];
}

/** Pull DRF's `{field: [messages]}` shape out of an arbitrary error body. */
export function extractFieldErrors(payload: unknown): ApiFieldErrors {
  if (!isRecord(payload)) return {};

  const errors: ApiFieldErrors = {};

  for (const [field, value] of Object.entries(payload)) {
    if (field === "detail") continue;
    const messages = asMessages(value);
    if (messages.length > 0) errors[field] = messages;
  }

  return errors;
}

/** Pull the human-readable headline out of an arbitrary DRF error body. */
export function extractDetail(payload: unknown): string | null {
  if (typeof payload === "string") {
    // Django's HTML 404/500 pages arrive as a string; never show raw HTML.
    const text = payload.trim();
    if (!text) return null;
    if (text.startsWith("<")) return null;
    return text.slice(0, 300);
  }

  if (!isRecord(payload)) return null;

  const detail = payload.detail ?? payload.message ?? payload.error;
  const messages = asMessages(detail);
  if (messages.length > 0) return messages[0];

  const nonField = asMessages(payload.non_field_errors);
  if (nonField.length > 0) return nonField[0];

  return null;
}

/**
 * Every failed request to the backend is normalised into this one error type,
 * so callers never have to branch on `axios.isAxiosError`.
 */
export class ApiError extends Error {
  readonly status: number | null;
  readonly code: ApiErrorCode;
  readonly fieldErrors: ApiFieldErrors;
  readonly url: string | null;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = "ApiError";
    this.status = init.status ?? null;
    this.code = init.code ?? statusToCode(this.status);
    this.fieldErrors = init.fieldErrors ?? {};
    this.url = init.url ?? null;
  }

  /** The server rejected the request because there is no valid session. */
  get isAuthError(): boolean {
    return this.code === "auth";
  }

  /** The current backend deployment does not expose this endpoint. */
  get isNotFound(): boolean {
    return this.code === "not-found";
  }

  /** The backend could not be reached at all (offline, CORS, DNS). */
  get isOffline(): boolean {
    return this.code === "network" || this.code === "timeout";
  }

  /** The first message the server returned for a specific field. */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }

  /** Every message the server returned, flattened. */
  get messages(): string[] {
    return Object.values(this.fieldErrors).flat();
  }
}

/** Convert anything thrown by `apiClient` into an `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isCancel(error)) {
    return new ApiError({ message: "Request cancelled.", code: "aborted" });
  }

  if (axios.isAxiosError(error)) {
    const url = error.config?.url;

    if (!error.response) {
      const timedOut =
        error.code === "ECONNABORTED" || error.code === "ETIMEDOUT";

      return new ApiError({
        message: timedOut
          ? "The server took too long to respond."
          : "The server could not be reached.",
        code: timedOut ? "timeout" : "network",
        url,
      });
    }

    const { status, data } = error.response;

    return new ApiError({
      message: extractDetail(data) ?? defaultMessage(status),
      status,
      fieldErrors: extractFieldErrors(data),
      url,
    });
  }

  return new ApiError({
    message: error instanceof Error ? error.message : "Unexpected error.",
    code: "unknown",
  });
}

/** True when the error means "no live backend", useful for falling back to sample data. */
export function isOfflineError(error: unknown): boolean {
  return toApiError(error).isOffline;
}
