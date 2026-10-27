import axios, { type InternalAxiosRequestConfig } from "axios";

import { toApiError } from "./errors";

/** Used when `VITE_API_BASE_URL` is not set (see `.env` / `render.yaml`). */
export const defaultApiBaseUrl = "/api";

const configuredBaseUrl =
  import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;

/** Normalised base URL with no trailing slash, e.g. `https://host/api`. */
export const apiBaseUrl = String(configuredBaseUrl).replace(/\/+$/, "");

/** Methods Django's CSRF middleware does not guard. */
const SAFE_METHODS = new Set(["get", "head", "options", "trace"]);

const CSRF_COOKIE_NAME = "csrftoken";
const CSRF_HEADER_NAME = "X-CSRFToken";

/** Read a cookie by name without pulling in a dependency. */
export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${escaped}=([^;]*)`),
  );

  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Django only accepts unsafe requests (POST/PUT/PATCH/DELETE) when the
 * `X-CSRFToken` header echoes the `csrftoken` cookie. The backend sets
 * `CSRF_COOKIE_HTTPONLY` to false, so the cookie is readable here.
 */
function attachCsrfToken(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  const method = (config.method ?? "get").toLowerCase();

  if (SAFE_METHODS.has(method)) return config;

  const token = readCookie(CSRF_COOKIE_NAME);
  if (token) config.headers.set(CSRF_HEADER_NAME, token);

  return config;
}

/** The single axios instance every API module goes through. */
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 20_000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(attachCsrfToken);

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);

/** Build an absolute API URL, for links that must leave axios (OIDC redirects). */
export function apiUrl(path: string): string {
  return `${apiBaseUrl}/${path.replace(/^\/+/, "")}`;
}
