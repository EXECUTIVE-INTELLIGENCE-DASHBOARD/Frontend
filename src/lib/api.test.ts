import { describe, expect, it } from "vitest";
import { apiClient } from "./api";

describe("apiClient", () => {
  it("has a configured API base URL", () => {
    expect(apiClient.defaults.baseURL).toBeTruthy();
    expect(String(apiClient.defaults.headers.common.Accept)).toContain("application/json");
  });
});

