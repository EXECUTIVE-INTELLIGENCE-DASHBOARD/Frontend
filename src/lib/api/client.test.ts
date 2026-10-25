import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { apiBaseUrl, apiClient, apiUrl, readCookie } from "./client";
import { ApiError } from "./errors";

const originalAdapter = apiClient.defaults.adapter;

function installAdapter(data: unknown = []) {
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

function clearCookies() {
  for (const name of ["csrftoken", "sessionid"]) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}

describe("apiClient", () => {
  beforeEach(clearCookies);

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    clearCookies();
  });

  it("has a configured base URL with no trailing slash", () => {
    expect(apiBaseUrl).toBeTruthy();
    expect(apiBaseUrl.endsWith("/")).toBe(false);
    expect(apiClient.defaults.baseURL).toBe(apiBaseUrl);
  });

  it("asks for JSON and sends cookies", () => {
    expect(String(apiClient.defaults.headers.common.Accept)).toContain(
      "application/json",
    );
    expect(apiClient.defaults.withCredentials).toBe(true);
  });

  it("builds absolute endpoint URLs", () => {
    expect(apiUrl("finance/liabilities/")).toBe(
      `${apiBaseUrl}/finance/liabilities/`,
    );
    expect(apiUrl("/academics/students/")).toBe(
      `${apiBaseUrl}/academics/students/`,
    );
  });

  it("attaches the CSRF token to unsafe requests", async () => {
    document.cookie = "csrftoken=abc123token";

    const captured = installAdapter({ id: 1 });

    await apiClient.post("finance/creditors/", { name: "NSSF" });

    expect(captured[0].headers.get("X-CSRFToken")).toBe("abc123token");
  });

  it("does not send a CSRF token on safe requests", async () => {
    document.cookie = "csrftoken=abc123token";

    const captured = installAdapter([]);

    await apiClient.get("finance/creditors/");

    expect(captured[0].headers.get("X-CSRFToken")).toBeFalsy();
  });

  it("omits the header when the cookie is absent", async () => {
    const captured = installAdapter({ id: 1 });

    await apiClient.patch("finance/creditors/1/", { name: "NSSF" });

    expect(captured[0].headers.get("X-CSRFToken")).toBeFalsy();
  });

  it("normalises adapter failures into ApiError", async () => {
    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError(
        "Request failed",
        "ERR_BAD_REQUEST",
        config,
        undefined,
        {
          status: 400,
          statusText: "Bad Request",
          data: { amount: ["This field is required."] },
          headers: new AxiosHeaders(),
          config,
        },
      );
    };

    await expect(apiClient.get("finance/liabilities/")).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});

describe("readCookie", () => {
  afterEach(clearCookies);

  it("reads a cookie value", () => {
    document.cookie = "csrftoken=from-the-server";

    expect(readCookie("csrftoken")).toBe("from-the-server");
  });

  it("returns null for a missing cookie", () => {
    expect(readCookie("csrftoken")).toBeNull();
  });
});
