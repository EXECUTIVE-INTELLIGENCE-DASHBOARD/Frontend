import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import { getFinanceDashboard } from "./financeDashboard.api";

vi.mock("../../api/axios", () => ({ default: { get: vi.fn() } }));

const empty = { period: { start: "2026-01-01", end: "2026-10-27" }, schools: [] };

describe("getFinanceDashboard", () => {
  const get = vi.mocked(api.get);
  beforeEach(() => get.mockReset());

  it("reads /finance/dashboard/", async () => {
    const data = { ...empty, schools: [{ id: 1 }] };
    get.mockResolvedValueOnce({ data });

    expect(await getFinanceDashboard()).toEqual({ data, source: "api" });
    expect(get).toHaveBeenCalledWith("/finance/dashboard/");
  });

  it("is empty when the server has no schools", async () => {
    get.mockResolvedValueOnce({ data: empty });
    expect((await getFinanceDashboard()).source).toBe("empty");
  });

  it("is offline when the server cannot be reached", async () => {
    get.mockRejectedValueOnce(new Error("network"));
    expect(await getFinanceDashboard()).toEqual({ data: null, source: "offline" });
  });
});
