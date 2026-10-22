/**
 * `procurement` app endpoints — `/api/procurement/<resource>/`.
 *
 * This is the only domain with live rows on the deployed backend today.
 */
import { createCrudResource } from "./resources";
import type { ProcurementTransaction, Vendor } from "./types";

export const vendors = createCrudResource<Vendor>("procurement/vendors");

export const procurementTransactions =
  createCrudResource<ProcurementTransaction>(
    "procurement/procurement-transactions",
  );

export const procurementApi = {
  vendors,
  procurementTransactions,
} as const;

export type ProcurementApi = typeof procurementApi;

export type ProcurementResource = keyof ProcurementApi;
