/**
 * `core` app endpoints — health check and the GreenHill OIDC session.
 *
 * The OIDC routes are plain Django views (not DRF), so they return
 * `JsonResponse` bodies rather than DRF-shaped errors.
 */
import { apiClient, apiUrl } from "./client";
import { ApiError } from "./errors";
import type { AuthState, AuthUser, HealthStatus } from "./types";

export interface CoreRequestOptions {
  signal?: AbortSignal;
}

/** `GET /api/health/` → `{"status": "ok"}`. */
export async function fetchHealth(
  options?: CoreRequestOptions,
): Promise<HealthStatus> {
  const response = await apiClient.get<HealthStatus>("health/", {
    signal: options?.signal,
  });

  return response.data;
}

/** Resolve the signed-in user, or `null` when unauthenticated. */
export async function fetchCurrentUser(
  options?: CoreRequestOptions,
): Promise<AuthUser | null> {
  try {
    const response = await apiClient.get<AuthState>("auth/me/", {
      signal: options?.signal,
      // A cached "signed in" answer would survive a sign-out and be reused
      // when the browser restores the page.
      headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
    });

    return response.data.authenticated ? response.data.user ?? null : null;
  } catch (error) {
    // `/api/auth/me/` answers 401 with `{authenticated: false}` when signed out.
    if (error instanceof ApiError && error.isAuthError) return null;
    throw error;
  }
}

/** Absolute URL of the OIDC sign-in entry point. */
export function signInUrl(): string {
  return apiUrl("auth/login/");
}

/** Full-page redirect into the GreenHill OIDC flow. */
export function signIn(): void {
  window.location.assign(signInUrl());
}

/**
 * Base URL of the GreenHill identity provider.
 *
 * Signing out is not something this app can finish on its own: the account's
 * session lives on the identity provider, which is shared with PMS and ISMP.
 * Only that service can end it, and it has to be reached in the top-level
 * browser so its cookie travels with the request.
 */
const DEFAULT_SSO_BASE_URL = "https://greenhill-auth-backend2.onrender.com";

export function ssoBaseUrl(): string {
  const configured = import.meta.env.VITE_SSO_BASE_URL || DEFAULT_SSO_BASE_URL;

  return configured.replace(/\/+$/, "");
}

/**
 * Absolute URL of the identity provider's sign-out.
 *
 * `auth/logout-redirect/` answers a GET, so a plain navigation will do. It
 * ends the session, deletes the OAuth tokens that every system is holding --
 * not just this one's -- and lands the person back on the sign-in page.
 */
export function signOutUrl(): string {
  return `${ssoBaseUrl()}/auth/logout-redirect/`;
}

/**
 * Sign out of every system.
 *
 * This app's own session is cleared first, then the browser is handed to the
 * identity provider, which is the authority on whether the person is signed
 * in. Doing it in that order means that even if the hand-over never completes,
 * this app is already signed out locally.
 */
export async function signOut(): Promise<void> {
  try {
    await apiClient.post("auth/logout/");
  } catch {
    // The central sign-out below is what actually ends the account session, so
    // failing to clear this app's copy of it must not prevent it.
  }

  window.location.assign(signOutUrl());
}

export const coreApi = {
  fetchHealth,
  fetchCurrentUser,
  signIn,
  signInUrl,
  signOut,
  signOutUrl,
} as const;
