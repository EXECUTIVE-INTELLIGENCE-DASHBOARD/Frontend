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

/** `POST /api/auth/logout/` — clears the Django session. */
export async function signOut(): Promise<void> {
  await apiClient.post("auth/logout/");
}

export const coreApi = {
  fetchHealth,
  fetchCurrentUser,
  signIn,
  signInUrl,
  signOut,
} as const;
