import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { SessionGate } from "./SessionGate";
import { signInUrl, verifySession } from "../lib/session";

vi.mock("../lib/session", () => ({
  verifySession: vi.fn(),
  signInUrl: vi.fn(() => "/api/auth/login/"),
}));
const verify = vi.mocked(verifySession);
function renderGate() {
  return render(<SessionGate><p>dashboard</p></SessionGate>);
}
function restore() {
  const event = new Event("pageshow");
  Object.defineProperty(event, "persisted", { value: true });
  act(() => window.dispatchEvent(event));
}
beforeEach(() => {
  vi.clearAllMocks();
  verify.mockReset();
  window.history.replaceState(null, "", "/?signin=complete");
});

describe("fresh sign-in and history", () => {
  it("opens a successful callback only after server verification", async () => {
    verify.mockResolvedValue("signed-in");
    renderGate();
    expect(await screen.findByText("dashboard")).toBeInTheDocument();
    expect(window.location.search).toBe("");
  });
  it("checks silently and hides data until verification finishes", () => {
    verify.mockReturnValue(new Promise(() => {}));
    const { container } = renderGate();
    expect(container).toBeEmptyDOMElement();
  });
  it("starts sign-in on direct entry even with an existing session", () => {
    window.history.replaceState(null, "", "/");
    verify.mockResolvedValue("signed-in");
    renderGate();
    expect(signInUrl).toHaveBeenCalledOnce();
    expect(verify).not.toHaveBeenCalled();
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });
  it("does not accept a cached callback marker on history navigation", () => {
    vi.spyOn(performance, "getEntriesByType").mockReturnValue([
      { type: "back_forward" } as PerformanceNavigationTiming,
    ]);
    renderGate();
    expect(signInUrl).toHaveBeenCalledOnce();
    expect(verify).not.toHaveBeenCalled();
  });
  it("requires fresh sign-in on a cached history restore even if the session is active", async () => {
    verify.mockResolvedValue("signed-in");
    renderGate();
    await screen.findByText("dashboard");
    restore();
    expect(signInUrl).toHaveBeenCalledOnce();
    expect(verify).toHaveBeenCalledOnce();
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });
  it("requires fresh sign-in on an in-page Back or Forward navigation", async () => {
    verify.mockResolvedValue("signed-in");
    renderGate();
    await screen.findByText("dashboard");
    act(() => window.dispatchEvent(new Event("popstate")));
    expect(signInUrl).toHaveBeenCalledOnce();
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });
  it("ignores an old successful check after a history restore", async () => {
    let finish!: (value: "signed-in") => void;
    verify.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    renderGate();
    restore();
    await act(async () => { finish("signed-in"); });
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
    expect(signInUrl).toHaveBeenCalledOnce();
  });
  it("conceals the dashboard before the browser takes a history snapshot", async () => {
    verify.mockResolvedValue("signed-in");
    renderGate();
    await screen.findByText("dashboard");
    act(() => window.dispatchEvent(new Event("pagehide")));
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
    expect(signInUrl).not.toHaveBeenCalled();
  });
  it("does not repeat verification on an ordinary pageshow", async () => {
    verify.mockResolvedValue("signed-in");
    renderGate();
    await screen.findByText("dashboard");
    act(() => window.dispatchEvent(new Event("pageshow")));
    expect(verify).toHaveBeenCalledOnce();
  });
  it("denies a signed-out callback", async () => {
    verify.mockResolvedValue("signed-out");
    renderGate();
    await screen.findByText("You have been signed out");
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });
  it("keeps content hidden when verification fails", async () => {
    verify.mockResolvedValue("unknown");
    renderGate();
    await screen.findByText("We could not confirm your session");
    expect(screen.queryByText("dashboard")).not.toBeInTheDocument();
  });
});
