import { afterEach, expect, it } from "vitest";
import { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import api from "./axios";

const originalAdapter = api.defaults.adapter;
afterEach(() => {
  api.defaults.adapter = originalAdapter;
  document.cookie = "csrftoken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
});

it("sends the session cookie and CSRF header for local cross-port writes", async () => {
  let captured!: InternalAxiosRequestConfig;
  api.defaults.adapter = async (config) => {
    captured = config;
    return { data: {}, status: 200, statusText: "OK", headers: new AxiosHeaders(), config };
  };
  document.cookie = "csrftoken=local-token; path=/";
  await api.post("/example/", {});
  expect(captured.withCredentials).toBe(true);
  expect(captured.headers.get("X-CSRFToken")).toBe("local-token");
});
