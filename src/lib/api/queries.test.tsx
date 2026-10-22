import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { apiClient } from "./client";
import type { ApiError } from "./errors";
import { apiKeys, useHealth, useSession, useVendors } from "./queries";

const originalAdapter = apiClient.defaults.adapter;

function installAdapter(data: unknown) {
  const captured: InternalAxiosRequestConfig[] = [];

  const adapter: AxiosAdapter = async (config) => {
    captured.push(config);

    return {
      data,
      status: 200,
      statusText: "OK",
      headers: new AxiosHeaders(),
      config,
    };
  };

  apiClient.defaults.adapter = adapter;

  return captured;
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("apiKeys", () => {
  it("scopes resource keys by app and params", () => {
    expect(apiKeys.resource("finance", "liabilities")).toEqual([
      "api",
      "finance",
      "liabilities",
      null,
    ]);

    expect(apiKeys.resource("finance", "liabilities", { status: "overdue" })).toEqual([
      "api",
      "finance",
      "liabilities",
      { status: "overdue" },
    ]);
  });

  it("keeps core keys unique", () => {
    expect(apiKeys.health()).not.toEqual(apiKeys.session());
  });
});

describe("useVendors", () => {
  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
  });

  it("loads rows from /api/procurement/vendors/", async () => {
    const captured = installAdapter([
      { id: 10, name: "Building Contractors", primary_category: "works" },
    ]);

    const { result } = renderHook(() => useVendors(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      { id: 10, name: "Building Contractors", primary_category: "works" },
    ]);
    expect(captured[0].url).toBe("procurement/vendors/");
  });

  it("surfaces an ApiError when the endpoint is missing", async () => {
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError("Not Found", "ERR_BAD_REQUEST", config, undefined, {
        status: 404,
        statusText: "Not Found",
        data: "<!doctype html><h1>Not Found</h1>",
        headers: new AxiosHeaders(),
        config,
      });
    };

    const { result } = renderHook(() => useVendors(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    const error = result.current.error as ApiError;

    expect(error.name).toBe("ApiError");
    expect(error.isNotFound).toBe(true);
    expect(error.message).toBe("That resource does not exist on the server.");
  });
});

describe("useHealth", () => {
  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
  });

  it("reports backend reachability", async () => {
    installAdapter({ status: "ok" });

    const { result } = renderHook(() => useHealth(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ status: "ok" });
  });
});

describe("useSession", () => {
  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
  });

  it("resolves to null when the backend answers 401", async () => {
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError(
        "Unauthorized",
        "ERR_BAD_REQUEST",
        config,
        undefined,
        {
          status: 401,
          statusText: "Unauthorized",
          data: { authenticated: false },
          headers: new AxiosHeaders(),
          config,
        },
      );
    };

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });

  it("returns the signed-in user", async () => {
    installAdapter({
      authenticated: true,
      user: {
        id: 1,
        email: "maruf.hossen@greenhill.ac.ug",
        name: "Maruf Hossen",
        first_name: "Maruf",
        last_name: "Hossen",
      },
    });

    const { result } = renderHook(() => useSession(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.email).toBe("maruf.hossen@greenhill.ac.ug");
  });
});
