import { afterEach, describe, expect, it, vi } from "vitest";
import { verifySession } from "./session";

vi.mock("./api/client", () => ({ apiUrl: (path: string) => "/api/" + path }));
vi.mock("./api/core", () => ({ signInUrl: () => "/api/auth/login/" }));

afterEach(() => vi.unstubAllGlobals());

describe("EID session authority", () => {
  it("denies access when EID is signed out without falling back to central auth", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("", { status: 401 }));
    vi.stubGlobal("fetch", fetcher);
    expect(await verifySession()).toBe("signed-out");
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toBe("/api/auth/me/");
    expect(fetcher.mock.calls[0][1].cache).toBe("no-store");
  });

  it("does not grant access when the session server cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await verifySession()).toBe("unknown");
  });
});
