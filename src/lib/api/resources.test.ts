import { AxiosHeaders, type AxiosAdapter } from "axios";
import { afterEach, describe, expect, it } from "vitest";

import { apiClient } from "./client";
import {
  createCrudResource,
  toSearchParams,
  unwrapList,
  withQuery,
} from "./resources";
import type { Liability } from "./types";

const originalAdapter = apiClient.defaults.adapter;

interface Call {
  method: string;
  url: string;
  data: unknown;
}

function capture(data: unknown = []) {
  const calls: Call[] = [];

  const adapter: AxiosAdapter = async (config) => {
    calls.push({
      method: (config.method ?? "get").toUpperCase(),
      url: config.url ?? "",
      data: config.data,
    });

    return {
      data,
      status: 200,
      statusText: "OK",
      headers: new AxiosHeaders(),
      config,
    };
  };

  apiClient.defaults.adapter = adapter;

  return calls;
}

const liabilities = createCrudResource<Liability>("finance/liabilities");

describe("toSearchParams", () => {
  it("drops empty values", () => {
    expect(
      toSearchParams({ status: "overdue", campus: "", quarter: null }).toString(),
    ).toBe("status=overdue");
  });

  it("repeats array values", () => {
    expect(toSearchParams({ status: ["paid", "overdue"] }).getAll("status")).toEqual(
      ["paid", "overdue"],
    );
  });

  it("stringifies numbers and booleans", () => {
    expect(toSearchParams({ page: 2, open: true }).toString()).toBe(
      "page=2&open=true",
    );
  });
});

describe("withQuery", () => {
  it("returns the bare path when there is nothing to add", () => {
    expect(withQuery("finance/liabilities/")).toBe("finance/liabilities/");
    expect(withQuery("finance/liabilities/", {})).toBe("finance/liabilities/");
  });

  it("appends a query string", () => {
    expect(withQuery("finance/liabilities/", { status: "overdue" })).toBe(
      "finance/liabilities/?status=overdue",
    );
  });
});

describe("unwrapList", () => {
  it("passes a bare array through", () => {
    expect(unwrapList<number>([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it("unwraps a DRF paginated envelope", () => {
    expect(
      unwrapList<number>({ count: 2, next: null, previous: null, results: [4, 5] }),
    ).toEqual([4, 5]);
  });

  it("returns an empty array for an unexpected body", () => {
    expect(unwrapList<number>(null)).toEqual([]);
    expect(unwrapList<number>({ detail: "nope" })).toEqual([]);
  });
});

describe("createCrudResource", () => {
  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
  });

  it("normalises the resource path", () => {
    expect(liabilities.path).toBe("finance/liabilities/");
    expect(createCrudResource("/finance/creditors").path).toBe(
      "finance/creditors/",
    );
  });

  it("lists rows from a bare array", async () => {
    const calls = capture([{ id: 1 }, { id: 2 }]);

    const rows = await liabilities.list();

    expect(rows).toHaveLength(2);
    expect(calls[0]).toMatchObject({
      method: "GET",
      url: "finance/liabilities/",
    });
  });

  it("lists rows from a paginated envelope", async () => {
    capture({ count: 1, next: null, previous: null, results: [{ id: 9 }] });

    await expect(liabilities.list()).resolves.toEqual([{ id: 9 }]);
  });

  it("sends query params", async () => {
    const calls = capture([]);

    await liabilities.list({ status: "overdue" });

    expect(calls[0].url).toBe("finance/liabilities/?status=overdue");
  });

  it("retrieves one row by id", async () => {
    const calls = capture({ id: 7 });

    await expect(liabilities.retrieve(7)).resolves.toEqual({ id: 7 });
    expect(calls[0].url).toBe("finance/liabilities/7/");
  });

  it("creates, updates, patches and deletes", async () => {
    const calls = capture({ id: 3 });

    await liabilities.create({ amount: "1000.00" });
    await liabilities.update(3, { amount: "2000.00" });
    await liabilities.patch(3, { status: "paid" });
    await liabilities.destroy(3);

    expect(calls.map((call) => `${call.method} ${call.url}`)).toEqual([
      "POST finance/liabilities/",
      "PUT finance/liabilities/3/",
      "PATCH finance/liabilities/3/",
      "DELETE finance/liabilities/3/",
    ]);
  });

  it("forwards an abort signal", async () => {
    let seenSignal: unknown;

    apiClient.defaults.adapter = async (config) => {
      seenSignal = config.signal;

      return {
        data: [],
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders(),
        config,
      };
    };

    const controller = new AbortController();

    await liabilities.list(undefined, { signal: controller.signal });

    expect(seenSignal).toBe(controller.signal);
  });
});
