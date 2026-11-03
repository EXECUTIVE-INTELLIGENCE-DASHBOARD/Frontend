/**
 * Is this browser still signed in?
 *
 * EID does not own the session. It belongs to the GreenHill identity provider
 * and is shared with PMS and ISMP, so it can end at any moment: the person
 * signed out here, signed out in another system, signed out on another device,
 * or their account was disabled.
 *
 * The awkward case is the browser's back and forward cache. A restored page is
 * a memory copy -- React never mounts again, no effect re-runs, and the screen
 * that was open when the person left is simply put back on the glass. So the
 * question has to be asked *again* every time a page comes back, or a
 * signed-out screen becomes a way in without credentials.
 *
 * `cache: "no-store"` is the other half of that. Without it the browser is
 * entitled to answer the very check that is supposed to catch the sign-out out
 * of its own cache.
 */
import { apiUrl } from "./api/client";
import { signInUrl } from "./api/core";

export type SessionVerdict = "signed-in" | "signed-out" | "unknown";

export { signInUrl };

async function ask(url: string): Promise<SessionVerdict> {
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });

    // Both services answer 401 with `{authenticated: false}`, which is a
    // definite no rather than a failure.
    if (response.status === 401) return "signed-out";
    if (!response.ok) return "unknown";

    const body: unknown = await response.json();
    const authenticated =
      typeof body === "object" &&
      body !== null &&
      (body as { authenticated?: unknown }).authenticated === true;

    return authenticated ? "signed-in" : "signed-out";
  } catch {
    return "unknown";
  }
}

/** EID's own backend is authoritative for access to the EID dashboard. */
export async function verifySession(): Promise<SessionVerdict> {
  return ask(apiUrl("auth/me/"));
}
