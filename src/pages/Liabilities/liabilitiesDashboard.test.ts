import { describe, expect, it } from "vitest";

import type { LiabilitiesApiData } from "./liabilities.api";
import { buildLiabilitiesDashboard } from "./liabilitiesDashboard";

const apiData: LiabilitiesApiData = {
  dashboard: {
    summary: {
      total_outstanding: 130,
      due_within_30_days: 50,
      overdue: 80,
      liability_count: 3,
      overdue_count: 1,
    },
    by_category: [],
    by_status: [],
    top_creditors: [],
    as_of_date: "2026-10-28",
  },
  liabilities: [
    {
      id: 1,
      creditor: 1,
      category: "current_payables",
      status: "due_soon",
      amount: "50",
      paid_amount: "0",
      outstanding_amount: "50",
      currency: "UGX",
      due_date: "2026-11-05",
      issued_date: "2026-10-01",
      paid_date: null,
      description: "Supplier invoice",
      school: 7,
    },
    {
      id: 2,
      creditor: 2,
      category: "accrued_expenses_tax",
      status: "overdue",
      amount: "80",
      paid_amount: "0",
      outstanding_amount: "80",
      currency: "UGX",
      due_date: "2026-09-10",
      issued_date: "2026-09-01",
      paid_date: null,
      description: "PAYE",
      school: 7,
    },
    {
      id: 3,
      creditor: 2,
      category: "accrued_expenses_tax",
      status: "paid",
      amount: "25",
      paid_amount: "25",
      outstanding_amount: "0",
      currency: "UGX",
      due_date: "2026-10-10",
      issued_date: "2026-09-10",
      paid_date: "2026-10-12",
      description: "Prior tax payment",
      school: 7,
    },
  ],
  creditors: [
    {
      id: 1,
      name: "Supplier",
      reference_number: "SUP-1",
      creditor_type: "trade_payable",
    },
    {
      id: 2,
      name: "Revenue Authority",
      reference_number: "URA-1",
      creditor_type: "statutory_tax",
    },
  ],
  schools: [
    {
      id: 7,
      name: "Kibuli Nursery",
      campus: "kibuli",
      campus_display: "Kibuli Main",
      level: "nursery",
    },
    {
      id: 10,
      name: "Buwaate Primary",
      campus: "buwaate",
      campus_display: "Buwaate",
      level: "primary",
    },
  ],
  schoolFees: {
    summary: { fees_not_received: 150 },
    breakdown: [
      { id: 7, name: "Kibuli Nursery", fees_not_received: 150 },
      { id: 10, name: "Buwaate Primary", fees_not_received: 200 },
    ],
  },
  loans: [
    {
      id: 1,
      loan_reference: "LOAN-1",
      principal_amount: "1000",
      outstanding_balance: "800",
      annual_interest_rate: "12",
      currency: "UGX",
      start_date: "2026-01-01",
      maturity_date: "2028-01-01",
      next_installment_date: "2026-11-20",
      status: "active",
      description: "Loan",
      school: 7,
      creditor: 1,
    },
  ],
  repayments: [
    {
      id: 1,
      installment_total: "100",
      installment_paid: "0",
      installment_outstanding: "100",
      installment_number: 1,
      due_date: "2026-11-20",
      principal_due: "90",
      interest_due: "10",
      principal_paid: "0",
      interest_paid: "0",
      balance_after_payment: "800",
      paid_date: null,
      status: "scheduled",
      loan: 1,
    },
  ],
  bankAccounts: [
    {
      id: 1,
      account_name: "School account",
      bank_name: "Bank",
      account_reference: "BA-1",
      account_type: "bank",
      balance: "400",
      currency: "UGX",
      as_of_date: "2026-10-28",
      is_active: true,
      school: 7,
    },
  ],
  cashForecasts: [
    {
      id: 1,
      forecast_date: "2026-11-01",
      forecast_balance: "500",
      actual_balance: "400",
      currency: "UGX",
      notes: "",
      school: 7,
    },
  ],
};

describe("liabilities dashboard aggregation", () => {
  it("uses API figures for liability cards, aging, statutory records, and loans", () => {
    const model = buildLiabilitiesDashboard(apiData, null);

    expect(model.metrics.map((metric) => metric.amount)).toEqual([
      930,
      80,
      800,
      400,
    ]);
    expect(model.metrics[3].label).toBe("Bank cash balance");
    expect(model.metrics[1].amount).toBe(80);
    expect(model.statutoryPayments.map((payment) => payment.status)).toEqual([
      "Overdue",
      "Paid late",
    ]);
    expect(model.loans[0]).toMatchObject({
      borrowed: 1000,
      paid: 200,
      balance: 800,
      nextInstallment: 100,
    });
  });

  it("filters all campus-derived totals to the selected campus", () => {
    const model = buildLiabilitiesDashboard(apiData, "kibuli");

    expect(model.schoolBalances).toHaveLength(1);
    expect(model.schoolBalances[0]).toMatchObject({
      name: "Kibuli Nursery",
      owedToUs: 150,
      weOwe: 930,
    });
    expect(model.metrics[0].amount).toBe(930);
    expect(model.metrics[1].amount).toBe(80);
    expect(model.metrics[3].amount).toBe(400);
    expect(model.schoolTotals.bankBalance).toBe(400);
  });

  it("filters live school data by the selected backend section", () => {
    const model = buildLiabilitiesDashboard(apiData, null, "nursery");

    expect(model.schoolBalances).toHaveLength(1);
    expect(model.schoolBalances[0].name).toBe("Kibuli Nursery");
    expect(model.metrics[0].amount).toBe(930);
    expect(model.schoolTotals.bankBalance).toBe(400);
  });
});
