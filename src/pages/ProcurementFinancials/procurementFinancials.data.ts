import { toNumber } from "../../lib/api/aggregate";
import type {
  ProcurementTransaction,
  Vendor as ProcurementVendor,
} from "../../lib/api/types";
import type {
  CategoryId,
  SpendCategory,
  Vendor as VendorSpend,
} from "./procurementFinancials.types";

const categoryLabels: Record<CategoryId, string> = {
  works: "Works",
  services: "Services",
  goods: "Goods",
};

const categoryDetails: ReadonlyArray<
  Pick<SpendCategory, "id" | "label" | "shortLabel" | "allocationLabel">
> = [
  {
    id: "works",
    label: "Works (Capital)",
    shortLabel: categoryLabels.works,
    allocationLabel: "Works (Capital Projects)",
  },
  {
    id: "services",
    label: "Services (Operations)",
    shortLabel: categoryLabels.services,
    allocationLabel: "Operational Services",
  },
  {
    id: "goods",
    label: "Goods",
    shortLabel: categoryLabels.goods,
    allocationLabel: "Goods & Inventory",
  },
];

export { categoryLabels };

export const settlementSeries = [
  { id: "paid", label: "Paid (Disbursed)" },
  { id: "committed", label: "Committed Budget" },
  { id: "outstanding", label: "Outstanding AP (Unpaid)" },
] as const;

const amountInMillions = (amount: string) => toNumber(amount) / 1_000_000;

export function buildProcurementFinancialsData(
  transactions: readonly ProcurementTransaction[],
  vendors: readonly ProcurementVendor[],
): { categories: SpendCategory[]; vendors: VendorSpend[]; totalSpend: number } {
  const categories = categoryDetails.map((details) => {
    const categoryTransactions = transactions.filter(
      (transaction) => transaction.category === details.id,
    );
    const statusTotal = (status: ProcurementTransaction["status"]) =>
      categoryTransactions
        .filter((transaction) => transaction.status === status)
        .reduce((total, transaction) => total + amountInMillions(transaction.amount), 0);

    return {
      ...details,
      spend: categoryTransactions.reduce(
        (total, transaction) => total + amountInMillions(transaction.amount),
        0,
      ),
      paid: statusTotal("paid"),
      committed: statusTotal("committed"),
      outstanding: statusTotal("outstanding"),
    };
  });

  const spendByVendor = new Map<number, number>();
  const categoryByVendor = new Map<number, CategoryId>();

  for (const transaction of transactions) {
    spendByVendor.set(
      transaction.vendor,
      (spendByVendor.get(transaction.vendor) ?? 0) +
        amountInMillions(transaction.amount),
    );
    categoryByVendor.set(transaction.vendor, transaction.category);
  }

  const vendorById = new Map(vendors.map((vendor) => [vendor.id, vendor]));
  const vendorIds = new Set([
    ...vendors.map((vendor) => vendor.id),
    ...spendByVendor.keys(),
  ]);
  const rankedVendors = [...vendorIds]
    .map((id) => {
      const vendor = vendorById.get(id);
      const category = vendor?.primary_category ?? categoryByVendor.get(id);

      if (!category) {
        throw new Error(`Procurement vendor ${id} has no category.`);
      }

      return {
        id: String(id),
        rank: 0,
        name: vendor?.name ?? `Vendor #${id}`,
        category,
        spend: spendByVendor.get(id) ?? 0,
      };
    })
    .sort((left, right) => right.spend - left.spend || left.name.localeCompare(right.name))
    .map((vendor, index) => ({ ...vendor, rank: index + 1 }));

  return {
    categories,
    vendors: rankedVendors,
    totalSpend: categories.reduce((total, category) => total + category.spend, 0),
  };
}

/** Formats an amount held in UGX millions, e.g. 180 -> "UGX 180.0M". */
export const formatUgx = (millions: number) => `UGX ${millions.toFixed(1)}M`;

export const shareOfTotal = (amount: number, total: number) =>
  total > 0 ? (amount / total) * 100 : 0;
