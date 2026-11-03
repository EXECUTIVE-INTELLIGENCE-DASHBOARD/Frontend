import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";

import { SessionGate } from "./SessionGate";
import { signInUrl, verifySession } from "../lib/session";

/**
 * The gate's whole job is to make the server's answer, not the browser's
 * memory, decide what is on screen. So `verifySession` is stubbed and the test
 * asserts what a person can see for each answer.
 */
vi.mock("../lib/session", () => ({
  verifySession: vi.fn(),
  signInUrl: vi.fn(() => "/api/auth/login/"),
}));

const mockedVerifySession = vi.mocked(verifySession);

function renderGate() {
  return render(
    <SessionGate>
      <p>dashboard</p>
    </SessionGate>,
  );
}

/** A restored-from-bfcache navigation, which is how the back arrow returns. */
function restoreFromHistory() {
  const event = new Event("pageshow");

  Object.defineProperty(event, "persisted", { value: true });

  act(() => {
    window.dispatchEvent(event);
  });
}

beforeEach(() => {
  mockedVerifySession.mockReset();
  window.history.replaceState(null, "", "/?signin=complete");
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("SessionGate", () => {
  it("conceals the dashboard before saving a page in browser history", async () => {
    mockedVerifySession.mockResolvedValue("signed-in");
    renderGate();
    await screen.findByText("dashboard");
    act(() => window.dispatchEvent(new Event("pagehide")));
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
    expect(mockedVerifySession).toHaveBeenCalledTimes(1);
  });

  it("checks a history navigation without forcing a new login", async () => {
    window.history.replaceState(null, "", "/");
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([
      { type: "back_forward" } as PerformanceNavigationTiming,
    ]);
    mockedVerifySession.mockResolvedValue("signed-in");
    renderGate();
    expect(await screen.findByText("dashboard")).toBeInTheDocument();
    expect(signInUrl).not.toHaveBeenCalled();
  });

  it("does not reopen from an old response after a history check rejects access", async () => {
    let finishOld!: (value: "signed-in") => void;
    mockedVerifySession.mockReturnValueOnce(new Promise((resolve) => { finishOld = resolve; }));
    mockedVerifySession.mockResolvedValueOnce("signed-out");
    renderGate();
    restoreFromHistory();
    await screen.findByText("You have been signed out");
    await act(async () => { finishOld("signed-in"); });
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });

  it("hides content immediately while a back/forward check is pending", async () => {
    mockedVerifySession.mockResolvedValueOnce("signed-in");
    renderGate();
    await screen.findByText("dashboard");
    mockedVerifySession.mockReturnValueOnce(new Promise(() => {}));
    act(() => window.dispatchEvent(new Event("popstate")));
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });

  it("checks silently without showing protected content", () => {
    mockedVerifySession.mockReturnValue(new Promise(() => {}));
    const { container } = renderGate();
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/Checking your session/)).not.toBeInTheDocument();
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });

  it("does not repeat the initial check on a normal pageshow", async () => {
    mockedVerifySession.mockResolvedValue("signed-in");
    renderGate();
    await screen.findByText("dashboard");
    act(() => window.dispatchEvent(new Event("pageshow")));
    expect(mockedVerifySession).toHaveBeenCalledTimes(1);
  });

  it("starts sign-in on direct entry even with an existing session", () => {
    window.history.replaceState(null, "", "/");
    mockedVerifySession.mockResolvedValue("signed-in");
    renderGate();
    expect(signInUrl).toHaveBeenCalled();
    expect(mockedVerifySession).not.toHaveBeenCalled();
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });

  it("removes the callback marker after returning from sign-in", async () => {
    mockedVerifySession.mockResolvedValue("signed-in");
    renderGate();
    expect(await screen.findByText("dashboard")).toBeInTheDocument();
    expect(window.location.search).toBe("");
  });

  it("renders the application when the server confirms a session", async () => {
    mockedVerifySession.mockResolvedValue("signed-in");

    renderGate();

    expect(await screen.findByText("dashboard")).toBeInTheDocument();
  });

  it("hides the application when the server says there is no session", async () => {
    mockedVerifySession.mockResolvedValue("signed-out");

    renderGate();

    expect(
      await screen.findByText("You have been signed out"),
    ).toBeInTheDocument();

    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });

  it("offers the sign-in route rather than a route that does not exist", async () => {
    mockedVerifySession.mockResolvedValue("signed-out");

    renderGate();

    const signIn = await screen.findByRole("link", { name: "Sign in" });

    expect(signIn).toHaveAttribute("href", "/api/auth/login/");
  });

  it("holds the application back when the answer is unknown", async () => {
    mockedVerifySession.mockResolvedValue("unknown");

    renderGate();

    expect(
      await screen.findByText("We could not confirm your session"),
    ).toBeInTheDocument();

    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });

  it("asks again when a page is restored from the back/forward cache", async () => {
    mockedVerifySession.mockResolvedValue("signed-in");

    renderGate();

    expect(await screen.findByText("dashboard")).toBeInTheDocument();

    expect(mockedVerifySession).toHaveBeenCalledTimes(1);

    restoreFromHistory();

    await waitFor(() => {
      expect(mockedVerifySession).toHaveBeenCalledTimes(2);
    });
  });

  it("closes on a restored page once the session has ended", async () => {
    mockedVerifySession.mockResolvedValueOnce("signed-in");

    renderGate();

    expect(await screen.findByText("dashboard")).toBeInTheDocument();

    mockedVerifySession.mockResolvedValueOnce("signed-out");

    restoreFromHistory();

    expect(
      await screen.findByText("You have been signed out"),
    ).toBeInTheDocument();

    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });

  it("asks again on an in-app history move", async () => {
    mockedVerifySession.mockResolvedValue("signed-in");

    renderGate();

    expect(await screen.findByText("dashboard")).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event("popstate"));
    });

    await waitFor(() => {
      expect(mockedVerifySession).toHaveBeenCalledTimes(2);
    });
  });

  it("hides a restored session when the check cannot reach the server", async () => {
    mockedVerifySession.mockResolvedValueOnce("signed-in");

    renderGate();

    expect(await screen.findByText("dashboard")).toBeInTheDocument();

    mockedVerifySession.mockResolvedValueOnce("unknown");

    restoreFromHistory();

    await waitFor(() => {
      expect(mockedVerifySession).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("We could not confirm your session")).toBeInTheDocument();
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });
});
