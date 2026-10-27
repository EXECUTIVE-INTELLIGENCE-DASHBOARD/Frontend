// Sample data from the design prototype (GSL organogram, Q2 2026).
// TODO: replace each export with a call in src/lib/api/ when endpoints exist.
import type { BudgetRow, InventoryRow, MonthlySales, Outlet, SalesRow } from "./services.types";

export const outlets: Outlet[] = [
  { id: "shop-a", name: "Shop A", icon: "👔", type: "Uniform shop", team: "Cashier + 2 seasonal helpers", staff: 3 },
  { id: "shop-b", name: "Shop B", icon: "📚", type: "Stationery shop", team: "Cashier + part-time assistant", staff: 2 },
  { id: "shop-c", name: "Shop C", icon: "🛍️", type: "Retail shop", team: "Cashier + part-time cashier", staff: 2 },
  { id: "shop-d", name: "Shop D", icon: "🛍️", type: "Retail shop", team: "Cashier + assistant + seasonal helper", staff: 3 },
  { id: "cafe", name: "Café", icon: "☕", type: "Café", team: "Cashier, barista, chef, cleaner + 3 part-time", staff: 7 },
  { id: "minimart", name: "Minimart", icon: "🛒", type: "Minimart", team: "Cashier + part-time assistant", staff: 2 },
];

const sales: [number, number, number, number][] = [
  [148, 34, 2900, 8.4], [96, 31, 11200, 3.2], [74, 29, 8400, -2.1],
  [68, 28, 7600, -5.6], [132, 42, 24000, 11.3], [163, 24, 38000, 4.7],
];
export const salesByOutlet: SalesRow[] = sales.map(([rev, gm, tx, chg], i) => ({
  ...outlets[i], revenue: rev * 1e6, grossMargin: gm, transactions: tx, change: chg,
}));

export const monthlySales: MonthlySales[] = [
  { month: "Feb", value: 112 }, { month: "Mar", value: 74 }, { month: "Apr", value: 58, holiday: true },
  { month: "May", value: 88 }, { month: "Jun", value: 79 }, { month: "Jul", value: 52, holiday: true },
  { month: "Aug", value: 96 }, { month: "Sep", value: 70 }, { month: "Oct", value: 52 },
];

const inv: [string, number, number, number, number][] = [
  ["Boys' shirt (M)", 0, 64, 80, 28000], ["Girls' skirt (L)", 0, 12, 40, 32000],
  ["School sweater", 0, 55, 50, 45000], ["Exercise books (96pg)", 1, 900, 500, 1800],
  ["Pens (box of 50)", 1, 18, 30, 22000], ["Toiletry pack", 2, 60, 40, 9500],
  ["Snacks carton", 3, 22, 30, 34000], ["Coffee beans (1kg)", 4, 14, 10, 48000],
  ["Fresh milk (1L)", 4, 20, 60, 3200], ["Bottled water (24 pack)", 5, 35, 50, 17000],
  ["Sugar (1kg)", 5, 210, 150, 4800], ["Bread loaf", 5, 25, 40, 4500],
];
export const inventory: InventoryRow[] = inv.map(([item, o, onHand, minLevel, unitCost]) => ({
  item, outlet: outlets[o], onHand, minLevel, unitCost,
}));

const bud: [number, number][] = [[120, 102], [80, 58], [62, 49], [58, 52], [110, 98], [140, 121]];
export const budgets: BudgetRow[] = bud.map(([a, s], i) => ({ ...outlets[i], allocated: a * 1e6, spent: s * 1e6 }));

/** % of the financial year elapsed (290 of 365 days). */
export const timeElapsedPct = 79;
