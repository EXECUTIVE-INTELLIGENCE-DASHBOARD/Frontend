export interface Outlet {
  id: string;
  name: string;
  icon: string;
  type: string;
  team: string;
  staff: number;
}

export interface SalesRow extends Outlet {
  revenue: number; // UGX
  grossMargin: number; // %
  transactions: number;
  change: number; // % vs previous period
}

export interface MonthlySales {
  month: string;
  value: number; // UGX millions
  holiday?: boolean;
}

export interface InventoryRow {
  item: string;
  outlet: Outlet;
  onHand: number;
  minLevel: number;
  unitCost: number; // UGX
}

export interface BudgetRow extends Outlet {
  allocated: number; // UGX
  spent: number; // UGX
}

export type Tone = "ok" | "wn" | "bad" | "nu";
export type OutletFilterValue = "all" | string;
