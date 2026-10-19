import type { Outlet, OutletFilterValue } from "./services.types";

export const fmt = (n: number): string => n.toLocaleString("en-US");
export const toM = (n: number): string => (n / 1e6).toFixed(1);

/** Keeps every row when filter is "all", otherwise only the chosen outlet. */
export const byOutlet =
  (filter: OutletFilterValue) =>
  (row: Outlet | { outlet: Outlet }): boolean =>
    filter === "all" || ("outlet" in row ? row.outlet.id : row.id) === filter;
