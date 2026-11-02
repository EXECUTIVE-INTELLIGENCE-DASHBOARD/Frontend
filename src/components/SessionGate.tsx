/**
 * Nothing behind this gate is rendered until the server agrees a session exists.
 *
 * Why a gate and not a redirect: the dashboard answers 401s with empty panels,
 * so a signed-out person still sees the whole application and can click
 * around it. That is what makes the back arrow feel like a way back in. Hiding
 * the content is the fix that matters; the sign-in button is the way out.
 *
 * It listens for the three ways a signed-out screen can come back:
 *
 * - `pageshow` with `persisted` -- the back/forward cache restored the page
 *   from memory. The app is unmounted *before* the check, because a restored
 *   page is painted before any effect runs.
 * - `popstate` -- an in-app history move.
 * - `visibilitychange` -- a tab regains focus after the session ended
 *   elsewhere, in another system or on another device.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { signInUrl, verifySession } from "../lib/session";
import "./SessionGate.css";

type GateState = "checking" | "open" | "signed-out" | "unreachable";

export function SessionGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>("checking");

  // Two events can fire for the same restore; one request per answer is enough.
  const checking = useRef(false);
  const returnedFromLogin = useRef(
    new URLSearchParams(window.location.search).get("signin") === "complete",
  );

  // The first `pageshow` of a normal load arrives just after mount, which is
  // already being checked. Ignoring it avoids asking twice on every cold start.

  // A re-check hides the content before it asks, so the state is no longer
  // "open" by the time the answer arrives. Remembering that it *was* open is
  // what lets an unreachable server leave a working dashboard alone.
  const confirmed = useRef(false);

  const revalidate = useCallback(async (hideContentFirst: boolean) => {
    if (!returnedFromLogin.current || checking.current) return;
    checking.current = true;

    if (hideContentFirst) setState("checking");

    try {
      const verdict = await verifySession();

      if (verdict === "signed-in") {
        confirmed.current = true;
        setState("open");
        return;
      }

      if (verdict === "signed-out") {
        confirmed.current = false;
        setState("signed-out");
        return;
      }

      // Could not tell. A session that was already confirmed stays confirmed so
      // a cold backend does not sign everybody out; anything else is held.
      setState(confirmed.current ? "open" : "unreachable");
    } finally {
      checking.current = false;
    }
  }, []);

  useEffect(() => {
    if (!returnedFromLogin.current) {
      window.location.replace(signInUrl());
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("signin");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    void revalidate(true);
  }, [revalidate]);

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted) {
        // A re-load, not a restore: React mounted again, and the mount effect
        // above is already checking.
        return;
      }

      // Hide the content first. `event.persisted` means the browser put the
      // old screen back, so it is on screen right now.
      void revalidate(event.persisted);
    }

    function handlePopState() {
      void revalidate(false);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") void revalidate(false);
    }

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [revalidate]);

  if (state === "open") return <>{children}</>;
  if (state === "checking") return null;

  return (
    <div className="session-gate" role="status" aria-live="polite">
      <div className="session-gate__card">
        {state === "signed-out" && (
          <>
            <h1 className="session-gate__title">You have been signed out</h1>
            <p className="session-gate__text">
              Your session has ended. Sign in again to open the dashboard.
            </p>
            <a className="session-gate__button" href={signInUrl()}>
              Sign in
            </a>
          </>
        )}

        {state === "unreachable" && (
          <>
            <h1 className="session-gate__title">
              We could not confirm your session
            </h1>
            <p className="session-gate__text">
              The sign-in service did not answer, so your data stays hidden
              until it does.
            </p>
            <button
              className="session-gate__button"
              type="button"
              onClick={() => void revalidate(true)}
            >
              Try again
            </button>
            <a className="session-gate__link" href={signInUrl()}>
              Sign in again
            </a>
          </>
        )}
      </div>
    </div>
  );
}
