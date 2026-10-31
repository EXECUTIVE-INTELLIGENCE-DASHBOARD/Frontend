import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";

import { SessionGate } from "./SessionGate";
import { verifySession } from "../lib/session";

/**
 * The gate's whole job is to make the server's answer, not the browser's
 * memory, decide what is on screen. So `verifySession` is stubbed and the test
 * asserts what a person can see for each answer.
 */
vi.mock("../lib/session", () => ({
  verifySession: vi.fn(),
  signInUrl: () => "/api/auth/login/",
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
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("SessionGate", () => {
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

  it("keeps a confirmed session when the check cannot reach the server", async () => {
    mockedVerifySession.mockResolvedValueOnce("signed-in");

    renderGate();

    expect(await screen.findByText("dashboard")).toBeInTheDocument();

    mockedVerifySession.mockResolvedValueOnce("unknown");

    restoreFromHistory();

    await waitFor(() => {
      expect(mockedVerifySession).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });
});
