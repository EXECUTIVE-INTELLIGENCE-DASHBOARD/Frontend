import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import { getLiabilitiesApiData } from "./liabilities.api";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockGet = vi.mocked(api.get);

describe("liabilities API", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("loads dashboard, liabilities, and related finance data through axios.ts", async () => {
    const dataByPath: Record<string, unknown> = {
      "/finance/liability/dashboard/": { summary: { total_outstanding: 10 } },
      "/liabilities/": [{ id: 1 }],
      "/creditors/": [{ id: 2 }],
      "/academics/schools/": [{ id: 3 }],
      "/finance/school-fees/dashboard/": { summary: {}, breakdown: [] },
      "/loans/": [{ id: 4 }],
      "/loan-repayments/": [{ id: 5 }],
      "/bank-accounts/": [{ id: 6 }],
      "/cash-forecasts/": [{ id: 7 }],
    };
    mockGet.mockImplementation((url) =>
      Promise.resolve({ data: dataByPath[String(url)] }) as never,
    );
    const controller = new AbortController();

    const result = await getLiabilitiesApiData(controller.signal);

    expect(result.dashboard).toEqual(dataByPath["/finance/liability/dashboard/"]);
    expect(result.liabilities).toEqual(dataByPath["/liabilities/"]);
    expect(result.creditors).toEqual(dataByPath["/creditors/"]);
    expect(result.schools).toEqual(dataByPath["/academics/schools/"]);
    expect(result.schoolFees).toEqual(
      dataByPath["/finance/school-fees/dashboard/"],
    );
    expect(result.loans).toEqual(dataByPath["/loans/"]);
    expect(result.repayments).toEqual(dataByPath["/loan-repayments/"]);
    expect(result.bankAccounts).toEqual(dataByPath["/bank-accounts/"]);
    expect(result.cashForecasts).toEqual(dataByPath["/cash-forecasts/"]);
    expect(mockGet).toHaveBeenCalledTimes(9);
    expect(mockGet).toHaveBeenCalledWith(
      "/finance/liability/dashboard/",
      { signal: controller.signal },
    );
  });

  it("accepts DRF paginated list responses", async () => {
    mockGet.mockImplementation((url) => {
      const path = String(url);
      if (path === "/liabilities/") {
        return Promise.resolve({ data: { count: 1, results: [{ id: 1 }] } }) as never;
      }

      if (path === "/finance/liability/dashboard/") {
        return Promise.resolve({ data: { summary: {} } }) as never;
      }
      if (path === "/finance/school-fees/dashboard/") {
        return Promise.resolve({ data: { summary: {}, breakdown: [] } }) as never;
      }
      return Promise.resolve({ data: [] }) as never;
    });

    const result = await getLiabilitiesApiData(new AbortController().signal);

    expect(result.liabilities).toEqual([{ id: 1 }]);
  });

  it("rejects malformed list responses rather than hiding a contract error", async () => {
    mockGet.mockImplementation((url) => {
      const path = String(url);
      if (path === "/liabilities/") {
        return Promise.resolve({ data: { unexpected: true } }) as never;
      }
      if (path === "/finance/liability/dashboard/") {
        return Promise.resolve({ data: { summary: {} } }) as never;
      }
      if (path === "/finance/school-fees/dashboard/") {
        return Promise.resolve({ data: { summary: {}, breakdown: [] } }) as never;
      }
      return Promise.resolve({ data: [] }) as never;
    });

    await expect(
      getLiabilitiesApiData(new AbortController().signal),
    ).rejects.toThrow("invalid list response");
  });
});
