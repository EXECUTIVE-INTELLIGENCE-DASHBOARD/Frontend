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
import { flushSync } from "react-dom";

import { signInUrl, verifySession } from "../lib/session";
import "./SessionGate.css";

type GateState = "checking" | "open" | "signed-out" | "unreachable";

export function SessionGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>("checking");

  // A response from before a history move must never reopen a newer session check.
  const requestVersion = useRef(0);
  const returnedFromLogin = useRef(
    new URLSearchParams(window.location.search).get("signin") === "complete" &&
      (performance.getEntriesByType("navigation")[0] as
        PerformanceNavigationTiming | undefined)?.type !== "back_forward",
  );

  const revalidate = useCallback(async () => {
    if (!returnedFromLogin.current) return;
    const version = ++requestVersion.current;
    setState("checking");
    let verdict;
    try {
      verdict = await verifySession();
    } catch {
      verdict = "unknown";
    }
    if (version !== requestVersion.current) return;
    setState(
      verdict === "signed-in" ? "open" :
        verdict === "signed-out" ? "signed-out" : "unreachable",
    );
  }, []);

  useEffect(() => {
    if (!returnedFromLogin.current) {
      window.location.replace(signInUrl());
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("signin");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    void revalidate();
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
      restartSignIn();
    }

    function conceal() {
      ++requestVersion.current;
      flushSync(() => setState("checking"));
    }

    function handlePageHide() {
      conceal();
    }

    function restartSignIn() {
      conceal();
      returnedFromLogin.current = false;
      window.location.replace(signInUrl());
    }

    function handlePopState() {
      restartSignIn();
    }

    function handleVisibilityChange() {
      conceal();
      if (document.visibilityState === "visible") void revalidate();
    }

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      ++requestVersion.current;
      window.removeEventListener("pagehide", handlePageHide);
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
              onClick={() => void revalidate()}
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
