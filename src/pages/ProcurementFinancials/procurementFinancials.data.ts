import type {
  SettlementSeries,
  SpendCategory,
  Vendor,
} from "./procurementFinancials.types";

export const prototypeNote =
  "Prototype view: figures are sample data until the procurement API is connected.";

export const campusOptions = [
  "All Campuses",
  "Kibuli Main Campus",
  "Buwaate Campus",
  "Annex / Preschool Branch",
];

export const spendCategories: SpendCategory[] = [
  {
    id: "works",
    label: "Works (Capital)",
    shortLabel: "Works",
    allocationLabel: "Works (Capital Projects)",
    spend: 180,
    paid: 120,
    committed: 180,
    outstanding: 60,
  },
  {
    id: "services",
    label: "Services (Operations)",
    shortLabel: "Services",
    allocationLabel: "Operational Services",
    spend: 145,
    paid: 110,
    committed: 145,
    outstanding: 35,
  },
  {
    id: "goods",
    label: "Goods",
    shortLabel: "Goods",
    allocationLabel: "Goods & Inventory",
    spend: 155,
    paid: 125,
    committed: 155,
    outstanding: 30,
  },
];

export const topVendors: Vendor[] = [
  { id: "scholastic", rank: 1, name: "Scholastic Publishers Ltd", category: "goods", spend: 85 },
  { id: "buildtech", rank: 2, name: "BuildTech Contractors Ltd", category: "works", spend: 72 },
  { id: "fresh-grain", rank: 3, name: "Fresh Grain Produce Uganda", category: "goods", spend: 55 },
  { id: "secureguard", rank: 4, name: "SecureGuard Systems Ltd", category: "services", spend: 42 },
  { id: "vivo", rank: 5, name: "Vivo Energy (Shell)", category: "goods", spend: 38 },
];

export const totalVendorCount = 34;

export const settlementSeries: SettlementSeries[] = [
  { id: "paid", label: "Paid (Disbursed)" },
  { id: "committed", label: "Committed Budget" },
  { id: "outstanding", label: "Outstanding AP (Unpaid)" },
];

/** Formats an amount held in UGX millions, e.g. 180 -> "UGX 180.0M". */
export const formatUgx = (millions: number) => `UGX ${millions.toFixed(1)}M`;

export const totalSpend = spendCategories.reduce(
  (sum, category) => sum + category.spend,
  0,
);

export const shareOfTotal = (millions: number) =>
  (millions / totalSpend) * 100;
