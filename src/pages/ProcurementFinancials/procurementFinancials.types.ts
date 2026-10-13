export type CategoryId = "works" | "services" | "goods";

export interface SpendCategory {
  id: CategoryId;
  /** Label used on the summary card, e.g. "Works (Capital)". */
  label: string;
  /** Short label used on chart axes, e.g. "Works". */
  shortLabel: string;
  /** Label used in the allocation list, e.g. "Works (Capital Projects)". */
  allocationLabel: string;
  /** Amounts are in UGX millions. */
  spend: number;
  paid: number;
  committed: number;
  outstanding: number;
}

export interface Vendor {
  id: string;
  rank: number;
  name: string;
  category: CategoryId;
  /** Amount is in UGX millions. */
  spend: number;
}

export interface SettlementSeries {
  id: "paid" | "committed" | "outstanding";
  label: string;
}
