import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { procurementApi } from "../../lib/api/procurement";
import type {
  ProcurementTransaction,
  Vendor,
} from "../../lib/api/types";
import { ProcurementFinancials } from "./ProcurementFinancials";

vi.mock("../../lib/api/procurement", () => ({
  procurementApi: {
    vendors: { list: vi.fn() },
    procurementTransactions: { list: vi.fn() },
  },
}));

const vendorRows: Vendor[] = [
  { id: 1, name: "BuildTech Contractors Ltd", primary_category: "works" },
  { id: 2, name: "Equator Catering Services", primary_category: "services" },
  { id: 3, name: "Scholastic Publishers Ltd", primary_category: "goods" },
];

const transactionRows: ProcurementTransaction[] = [
  {
    id: 1,
    vendor: 1,
    fiscal_year: 1,
    category: "works",
    status: "paid",
    amount: "100000000.00",
    currency: "UGX",
    transaction_date: "2026-10-01",
    reference_number: "PROC-001",
    description: "",
  },
  {
    id: 2,
    vendor: 1,
    fiscal_year: 1,
    category: "goods",
    status: "outstanding",
    amount: "20000000.00",
    currency: "UGX",
    transaction_date: "2026-10-02",
    reference_number: "PROC-002",
    description: "",
  },
  {
    id: 3,
    vendor: 2,
    fiscal_year: 1,
    category: "services",
    status: "committed",
    amount: "50000000.00",
    currency: "UGX",
    transaction_date: "2026-10-03",
    reference_number: "PROC-003",
    description: "",
  },
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(<ProcurementFinancials />, { wrapper });
}

describe("ProcurementFinancials", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(procurementApi.vendors.list).mockResolvedValue(vendorRows);
    vi.mocked(
      procurementApi.procurementTransactions.list,
    ).mockResolvedValue(transactionRows);
  });

  it("uses live transaction values for the category summaries and charts", async () => {
    renderPage();

    await screen.findByText("UGX 100.0M");

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(3);
    expect(within(cards[0]).getByText("UGX 100.0M")).toBeInTheDocument();
    expect(within(cards[1]).getByText("UGX 50.0M")).toBeInTheDocument();
    expect(within(cards[2]).getByText("UGX 20.0M")).toBeInTheDocument();

    expect(
      screen.getByText(/Total outflow UGX 170\.0M/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Procurement Settlement & Liability Analysis/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Outstanding AP (Unpaid)")).toBeInTheDocument();
  });

  it("ranks vendors from API transactions and lists zero-spend API vendors", async () => {
    renderPage();

    await screen.findByText("BuildTech Contractors Ltd");
    expect(screen.getByText("Equator Catering Services")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /View All 3 Vendors/i }));

    const dialog = screen.getByRole("dialog", { name: "All 3 Vendors" });
    expect(within(dialog).getAllByRole("row")).toHaveLength(4);
    expect(
      within(dialog).getByText("Scholastic Publishers Ltd"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/3 vendors · UGX 170\.0M total spend/),
    ).toBeInTheDocument();
  });

  it("closes the vendor dialog with Escape and returns focus", async () => {
    renderPage();

    const trigger = await screen.findByRole("button", {
      name: /View All 3 Vendors/i,
    });
    fireEvent.click(trigger);
    expect(
      screen.getByRole("button", { name: "Close vendor list" }),
    ).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("shows loading while both backend resources are pending", () => {
    vi.mocked(procurementApi.vendors.list).mockReturnValue(
      new Promise(() => {}),
    );
    vi.mocked(procurementApi.procurementTransactions.list).mockReturnValue(
      new Promise(() => {}),
    );

    renderPage();

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading procurement financials",
    );
  });

  it("reports API errors instead of showing sample financials", async () => {
    vi.mocked(procurementApi.procurementTransactions.list).mockRejectedValue(
      new Error("Backend unavailable"),
    );

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Backend unavailable",
    );
    expect(screen.queryByText("UGX 180.0M")).not.toBeInTheDocument();
  });

  it("shows an empty state when the API has no transactions", async () => {
    vi.mocked(
      procurementApi.procurementTransactions.list,
    ).mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByText("No procurement transactions are available yet."),
    ).toBeInTheDocument();
  });
});
