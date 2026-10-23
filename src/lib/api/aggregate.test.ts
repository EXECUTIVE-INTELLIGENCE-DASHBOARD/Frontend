import { describe, expect, it } from "vitest";

import {
  groupCount,
  groupRows,
  groupSum,
  liabilityTotals,
  percentage,
  procurementTotals,
  revenueTotals,
  roundTo,
  share,
  sumBy,
  sumWhere,
  toNumber,
  uniqueValues,
} from "./aggregate";
import type { Liability, ProcurementTransaction, RevenueRecord } from "./types";

const liabilityRows: Liability[] = [
  {
    id: 1,
    creditor: 1,
    category: "current_payables",
    status: "overdue",
    amount: "1000.00",
    currency: "UGX",
    due_date: "2026-01-01",
    issued_date: "2025-12-01",
    paid_date: null,
    description: "",
  },
  {
    id: 2,
    creditor: 1,
    category: "current_payables",
    status: "due_soon",
    amount: "250.50",
    currency: "UGX",
    due_date: "2026-02-01",
    issued_date: "2026-01-01",
    paid_date: null,
    description: "",
  },
  {
    id: 3,
    creditor: 2,
    category: "long_term_debt",
    status: "paid",
    amount: "4000.00",
    currency: "UGX",
    due_date: "2025-06-01",
    issued_date: "2025-01-01",
    paid_date: "2025-05-30",
    description: "",
  },
];

const revenueRows: RevenueRecord[] = [
  {
    id: 1,
    fiscal_year: 1,
    stream: "tuition",
    billed_amount: "1000000.00",
    realized_amount: "750000.00",
    currency: "UGX",
    billing_date: "2026-01-01",
  },
  {
    id: 2,
    fiscal_year: 1,
    stream: "transport",
    billed_amount: "250000.00",
    realized_amount: "250000.00",
    currency: "UGX",
    billing_date: "2026-01-01",
  },
];

const procurementRows: ProcurementTransaction[] = [
  {
    id: 1,
    vendor: 10,
    fiscal_year: 3,
    category: "goods",
    status: "paid",
    amount: "17500000.00",
    currency: "UGX",
    transaction_date: "2026-10-01",
    reference_number: "PROC-0004",
    description: "",
  },
  {
    id: 2,
    vendor: 11,
    fiscal_year: 3,
    category: "services",
    status: "outstanding",
    amount: "15000000.00",
    currency: "UGX",
    transaction_date: "2026-10-08",
    reference_number: "PROC-0003",
    description: "",
  },
];

describe("toNumber", () => {
  it("parses DRF decimal strings", () => {
    expect(toNumber("17500000.00")).toBe(17500000);
    expect(toNumber("-12.5")).toBe(-12.5);
  });

  it("defaults unusable values to zero", () => {
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
    expect(toNumber("")).toBe(0);
    expect(toNumber("not a number")).toBe(0);
    expect(toNumber(Number.NaN)).toBe(0);
  });
});

describe("roundTo", () => {
  it("rounds to a fixed number of places", () => {
    expect(roundTo(1.23456, 2)).toBe(1.23);
    expect(roundTo(1.005, 2)).toBe(1.01);
  });

  it("never returns NaN", () => {
    expect(roundTo(Number.NaN)).toBe(0);
  });
});

describe("sumBy / sumWhere", () => {
  it("totals a decimal projection", () => {
    expect(sumBy(liabilityRows, (row) => row.amount)).toBe(5250.5);
  });

  it("totals only matching rows", () => {
    expect(
      sumWhere(
        liabilityRows,
        (row) => row.status !== "paid",
        (row) => row.amount,
      ),
    ).toBe(1250.5);
  });
});

describe("grouping", () => {
  it("buckets rows by key", () => {
    expect(Object.keys(groupRows(liabilityRows, (row) => row.category))).toEqual([
      "current_payables",
      "long_term_debt",
    ]);
  });

  it("totals per group", () => {
    expect(groupSum(liabilityRows, (row) => row.category, (row) => row.amount)).toEqual(
      { current_payables: 1250.5, long_term_debt: 4000 },
    );
  });

  it("counts per group", () => {
    expect(groupCount(liabilityRows, (row) => String(row.creditor))).toEqual({
      "1": 2,
      "2": 1,
    });
  });

  it("lists distinct values in first-seen order", () => {
    expect(uniqueValues(liabilityRows, (row) => row.status)).toEqual([
      "overdue",
      "due_soon",
      "paid",
    ]);
  });
});

describe("share / percentage", () => {
  it("clamps to 0..1", () => {
    expect(share(1, 4)).toBe(0.25);
    expect(share(5, 4)).toBe(1);
    expect(share(-1, 4)).toBe(0);
  });

  it("returns zero instead of dividing by zero", () => {
    expect(share(1, 0)).toBe(0);
    expect(percentage(1, 0)).toBe(0);
  });

  it("reports one decimal place", () => {
    expect(percentage(1, 3)).toBe(33.3);
  });
});

describe("liabilityTotals", () => {
  it("splits paid from outstanding", () => {
    const totals = liabilityTotals(liabilityRows);

    expect(totals.total).toBe(5250.5);
    expect(totals.paid).toBe(4000);
    expect(totals.outstanding).toBe(1250.5);
    expect(totals.overdue).toBe(1000);
    expect(totals.dueSoon).toBe(250.5);
    expect(totals.byStatus.overdue).toBe(1000);
    expect(totals.byCategory).toEqual({
      current_payables: 1250.5,
      long_term_debt: 4000,
    });
  });

  it("handles an empty list", () => {
    expect(liabilityTotals([]).total).toBe(0);
  });
});

describe("revenueTotals", () => {
  it("computes arrears the way the model property would", () => {
    const totals = revenueTotals(revenueRows);

    expect(totals.billed).toBe(1250000);
    expect(totals.realized).toBe(1000000);
    expect(totals.arrears).toBe(250000);
    expect(totals.collectionRate).toBe(80);
    expect(totals.byStream).toEqual({ tuition: 750000, transport: 250000 });
  });
});

describe("procurementTotals", () => {
  it("splits by settlement status", () => {
    const totals = procurementTotals(procurementRows);

    expect(totals.total).toBe(32500000);
    expect(totals.byStatus).toEqual({
      paid: 17500000,
      committed: 0,
      outstanding: 15000000,
    });
    expect(totals.byCategory).toEqual({ goods: 17500000, services: 15000000 });
    expect(totals.byVendor).toEqual({ "10": 17500000, "11": 15000000 });
  });
});
