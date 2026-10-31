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

const DEFAULT_PROVIDER_URL = "https://greenhill-auth-backend2.onrender.com";

/** The identity provider itself, for asking about the shared session. */
function providerBaseUrl(): string {
  const configured = import.meta.env.VITE_SSO_BASE_URL || DEFAULT_PROVIDER_URL;

  return String(configured).replace(/\/+$/, "");
}

async function ask(url: string): Promise<SessionVerdict> {
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
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

/**
 * Ask the server whether the session behind this browser is still live.
 *
 * Two sources, because there are two sessions in play and either one being
 * live is enough to let the dashboard open:
 *
 * 1. This app's own backend, which is the fast, same-origin answer.
 * 2. The identity provider, because that is the session that actually decides
 *    whether the person is signed in to GreenHill at all. This is what keeps
 *    the gate working before EID's own callback has been exercised.
 *
 * The gate only closes on two definite "no" answers. A 5xx from a cold Render
 * instance says nothing about the person's credentials, so it is reported as
 * "unknown" rather than "signed-out" -- bouncing a signed-in user to a
 * sign-in page on a cold start would be its own bug.
 */
export async function verifySession(): Promise<SessionVerdict> {
  const own = await ask(apiUrl("auth/me/"));

  if (own === "signed-in") return "signed-in";

  const provider = await ask(`${providerBaseUrl()}/auth/me/`);

  if (provider === "signed-in") return "signed-in";
  if (own === "signed-out" && provider === "signed-out") return "signed-out";

  return "unknown";
}
