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

/*
 * All 34 vendors, ranked by total spend. The first five come from the design
 * reference. The rest are sample figures that bring the total to the
 * UGX 480.0M outflow. Amounts are in UGX millions.
 */
export const allVendors: Vendor[] = [
  { id: "scholastic", rank: 1, name: "Scholastic Publishers Ltd", category: "goods", spend: 85 },
  { id: "buildtech", rank: 2, name: "BuildTech Contractors Ltd", category: "works", spend: 72 },
  { id: "fresh-grain", rank: 3, name: "Fresh Grain Produce Uganda", category: "goods", spend: 55 },
  { id: "secureguard", rank: 4, name: "SecureGuard Systems Ltd", category: "services", spend: 42 },
  { id: "vivo", rank: 5, name: "Vivo Energy (Shell)", category: "goods", spend: 38 },
  { id: "kampala-office-supplies-ltd", rank: 6, name: "Kampala Office Supplies Ltd", category: "goods", spend: 23.2 },
  { id: "pearl-cleaning-services", rank: 7, name: "Pearl Cleaning Services", category: "services", spend: 20.4 },
  { id: "jinja-hardware-mart", rank: 8, name: "Jinja Hardware Mart", category: "goods", spend: 17.9 },
  { id: "sunrise-electrical-contractors", rank: 9, name: "Sunrise Electrical Contractors", category: "works", spend: 15.8 },
  { id: "equator-catering-services", rank: 10, name: "Equator Catering Services", category: "services", spend: 13.9 },
  { id: "lakeview-plumbing-works", rank: 11, name: "Lakeview Plumbing Works", category: "works", spend: 12.2 },
  { id: "mbale-uniform-makers", rank: 12, name: "Mbale Uniform Makers", category: "goods", spend: 10.7 },
  { id: "savannah-transport-ltd", rank: 13, name: "Savannah Transport Ltd", category: "services", spend: 9.5 },
  { id: "crested-crane-printing", rank: 14, name: "Crested Crane Printing", category: "goods", spend: 8.3 },
  { id: "entebbe-lab-supplies", rank: 15, name: "Entebbe Lab Supplies", category: "goods", spend: 7.3 },
  { id: "rwenzori-water-systems", rank: 16, name: "Rwenzori Water Systems", category: "works", spend: 6.4 },
  { id: "victoria-furniture-works", rank: 17, name: "Victoria Furniture Works", category: "goods", spend: 5.7 },
  { id: "bugolobi-pest-control", rank: 18, name: "Bugolobi Pest Control", category: "services", spend: 5.0 },
  { id: "kololo-it-solutions", rank: 19, name: "Kololo IT Solutions", category: "services", spend: 4.4 },
  { id: "mukono-sports-equipment", rank: 20, name: "Mukono Sports Equipment", category: "goods", spend: 3.9 },
  { id: "ntinda-medical-supplies", rank: 21, name: "Ntinda Medical Supplies", category: "goods", spend: 3.4 },
  { id: "masaka-roofing-ltd", rank: 22, name: "Masaka Roofing Ltd", category: "works", spend: 3.0 },
  { id: "gulu-agro-supplies", rank: 23, name: "Gulu Agro Supplies", category: "goods", spend: 2.6 },
  { id: "fort-portal-paints", rank: 24, name: "Fort Portal Paints", category: "goods", spend: 2.3 },
  { id: "nakasero-security-alarms", rank: 25, name: "Nakasero Security Alarms", category: "services", spend: 2.0 },
  { id: "lugogo-photocopy-services", rank: 26, name: "Lugogo Photocopy Services", category: "services", spend: 1.8 },
  { id: "busia-building-materials", rank: 27, name: "Busia Building Materials", category: "works", spend: 1.6 },
  { id: "mityana-laundry-services", rank: 28, name: "Mityana Laundry Services", category: "services", spend: 1.4 },
  { id: "kabale-timber-merchants", rank: 29, name: "Kabale Timber Merchants", category: "works", spend: 1.2 },
  { id: "arua-solar-solutions", rank: 30, name: "Arua Solar Solutions", category: "works", spend: 1.1 },
  { id: "soroti-library-books-ltd", rank: 31, name: "Soroti Library Books Ltd", category: "goods", spend: 0.9 },
  { id: "hoima-gas-distributors", rank: 32, name: "Hoima Gas Distributors", category: "goods", spend: 0.8 },
  { id: "tororo-cement-depot", rank: 33, name: "Tororo Cement Depot", category: "works", spend: 0.7 },
  { id: "wakiso-garden-services", rank: 34, name: "Wakiso Garden Services", category: "services", spend: 0.6 },
];

export const topVendors: Vendor[] = allVendors.slice(0, 5);

export const totalVendorCount = allVendors.length;

export const vendorsTotalSpend = allVendors.reduce(
  (sum, vendor) => sum + vendor.spend,
  0,
);

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
