import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ProcurementRequests from "./ProcurementRequests";
import {
  createProcurementTransaction,
  getProcurementRequestsData,
} from "./procurementRequests.api";
import type { ProcurementRequestsData } from "./procurementRequests.api";

vi.mock("./procurementRequests.api", () => ({
  createProcurementTransaction: vi.fn(),
  getProcurementRequestsData: vi.fn(),
  updateProcurementTransactionStatus: vi.fn(),
}));

const mockGetData = vi.mocked(getProcurementRequestsData);
const mockCreate = vi.mocked(createProcurementTransaction);

const data: ProcurementRequestsData = {
  transactions: [
    {
      id: 8,
      vendor: 3,
      fiscal_year: 12,
      category: "services",
      status: "outstanding",
      amount: "250000.00",
      currency: "UGX",
      transaction_date: "2026-03-05",
      reference_number: "PO-8",
      description: "Cleaning services",
      school: 2,
    },
  ],
  vendors: [{ id: 3, name: "Acme Supplies", primary_category: "goods" }],
  fiscalYears: [{ id: 12, year: "2026", quarter: 1 }],
  schools: [{ id: 2, name: "Main School", campus_display: "Kibuli" }],
  errors: [],
};

describe("ProcurementRequests", () => {
  beforeEach(() => {
    mockGetData.mockReset();
    mockCreate.mockReset();
    mockGetData.mockResolvedValue(data);
    mockCreate.mockResolvedValue(data.transactions[0]);
  });

  it("renders transactions and metrics from the API data", async () => {
    render(<ProcurementRequests />);

    expect(await screen.findByText("Cleaning services")).toBeInTheDocument();
    expect(screen.getByText("Acme Supplies")).toBeInTheDocument();
    expect(screen.getByText("Transaction Register")).toBeInTheDocument();
    expect(screen.getByText("Total Transactions")).toBeInTheDocument();
    expect(screen.getAllByText("Outstanding").length).toBeGreaterThan(0);
    expect(mockGetData).toHaveBeenCalledWith(expect.any(AbortSignal));
  });

  it("submits a transaction using the selected backend lookup IDs", async () => {
    const user = userEvent.setup();
    render(<ProcurementRequests />);

    await user.click(
      await screen.findByRole("button", { name: "Record Transaction" }),
    );
    await user.selectOptions(screen.getByLabelText("Vendor *"), "3");
    await user.selectOptions(screen.getByLabelText("Fiscal year *"), "12");
    await user.type(screen.getByLabelText("Amount *"), "250000");
    await user.click(screen.getByRole("button", { name: "Save Transaction" }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          vendor: 3,
          fiscal_year: 12,
          category: "goods",
          status: "outstanding",
          amount: "250000",
          currency: "UGX",
          reference_number: "",
          description: "",
        }),
      );
    });
    expect(
      await screen.findByRole("status"),
    ).toHaveTextContent("Procurement transaction saved.");
  });
});
