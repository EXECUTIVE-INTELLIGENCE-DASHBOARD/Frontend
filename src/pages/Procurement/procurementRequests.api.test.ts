import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import {
  createProcurementTransaction,
  getProcurementRequestsData,
  updateProcurementTransactionStatus,
} from "./procurementRequests.api";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockGet = vi.mocked(api.get);
const mockPost = vi.mocked(api.post);
const mockPatch = vi.mocked(api.patch);

describe("procurement requests API", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
  });

  it("loads transactions and their backend lookup data through axios.ts", async () => {
    const transactions = [
      {
        id: 8,
        vendor: 3,
        fiscal_year: 12,
        category: "goods",
        status: "paid",
        amount: "250000.00",
        currency: "UGX",
        transaction_date: "2026-03-05",
        reference_number: "PO-8",
        description: "Stationery",
        school: 2,
      },
    ];
    const vendors = [{ id: 3, name: "Acme", primary_category: "goods" }];
    const fiscalYears = [{ id: 12, year: "2026", quarter: 1 }];
    const schools = [{ id: 2, name: "Main School", campus_display: "Kibuli" }];
    const responses: Record<string, unknown> = {
      "/procurement/procurement-transactions/": transactions,
      "/procurement/vendors/": vendors,
      "/fiscal-years/": fiscalYears,
      "/academics/schools/": schools,
    };
    mockGet.mockImplementation((url) =>
      Promise.resolve({ data: responses[String(url)] }) as never,
    );

    const controller = new AbortController();
    const result = await getProcurementRequestsData(controller.signal);

    expect(result).toEqual({
      transactions,
      vendors,
      fiscalYears,
      schools,
      errors: [],
    });
    expect(mockGet).toHaveBeenCalledTimes(4);
    expect(mockGet).toHaveBeenCalledWith(
      "/procurement/procurement-transactions/",
      { signal: controller.signal },
    );
    expect(mockGet).toHaveBeenCalledWith("/fiscal-years/", {
      signal: controller.signal,
    });
  });

  it("reports failed lookup requests without hiding successful transaction data", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockGet.mockImplementation((url) => {
      if (url === "/procurement/procurement-transactions/") {
        return Promise.resolve({ data: [] }) as never;
      }
      if (url === "/procurement/vendors/") {
        return Promise.reject(new Error("offline")) as never;
      }

      return Promise.resolve({ data: [] }) as never;
    });

    const result = await getProcurementRequestsData(new AbortController().signal);

    expect(result.transactions).toEqual([]);
    expect(result.vendors).toEqual([]);
    expect(result.errors).toContain("Could not load vendors.");
    expect(logError).toHaveBeenCalledOnce();
    logError.mockRestore();
  });

  it("creates transactions and patches only their supported settlement status", async () => {
    const created = { id: 20 };
    const updated = { id: 20, status: "paid" };
    mockPost.mockResolvedValue({ data: created } as never);
    mockPatch.mockResolvedValue({ data: updated } as never);

    const payload = {
      vendor: 3,
      fiscal_year: 12,
      category: "goods" as const,
      status: "outstanding" as const,
      amount: "250000.00",
      currency: "UGX",
      transaction_date: "2026-03-05",
      reference_number: "PO-20",
      description: "Stationery",
    };
    await createProcurementTransaction(payload);
    await updateProcurementTransactionStatus(20, "paid");

    expect(mockPost).toHaveBeenCalledWith(
      "/procurement/procurement-transactions/",
      payload,
    );
    expect(mockPatch).toHaveBeenCalledWith(
      "/procurement/procurement-transactions/20/",
      { status: "paid" },
    );
  });
});
