// Sample data from the design. TODO: replace with calls in src/lib/api/ when endpoints exist.
import type { AssetRow, AssetSummary, CampusFilterValue, CampusOption, Condition } from "./assetsEquipment.types";

export const campusOptions: CampusOption[] = [
  { value: "all", label: "All Campuses" },
  { value: "kibuli", label: "Kibuli Main" },
  { value: "buwaate", label: "Buwaate Campus" },
  { value: "annex", label: "Annex Branch" },
];

export const conditionLabels: Record<Condition, string> = {
  good: "Operational (Good)",
  servicing: "Servicing Required",
  critical: "Critical / Repair Queued",
};

export const assets: AssetRow[] = [
  { id: "a1", name: "Dell Student Laboratory Workstations", category: "ICT Hardware", location: "Kibuli Main — Computer Suite B", campus: "kibuli", value: 180_000_000, quantity: 120, unit: "Units", condition: "good" },
  { id: "a2", name: "Optics Spectrophotometers & Beakers", category: "Science Laboratory Equipment", location: "Buwaate Campus — Chemistry Lab 1", campus: "buwaate", value: 95_000_000, quantity: 45, unit: "Units", condition: "servicing" },
  { id: "a3", name: "Executive Ergonomic Office Desks & Chairs", category: "Administrative Furniture", location: "Kibuli Main — Admin Block", campus: "kibuli", value: 65_000_000, quantity: 85, unit: "Units", condition: "good" },
  { id: "a4", name: "250kVA Heavy-Duty Backup Generator", category: "Power & Facility Machinery", location: "Annex Branch — Power House", campus: "annex", value: 210_000_000, quantity: 2, unit: "Units", condition: "critical" },
  { id: "a5", name: "67-Seater Student Transport Buses", category: "Fleet & Vehicles", location: "Kibuli Main — Transport Depot", campus: "kibuli", value: 680_000_000, quantity: 6, unit: "Vehicles", condition: "good" },
];

// Headline figures for the whole register (the table shows the main asset classes only).
export const summaries: Record<CampusFilterValue, AssetSummary> = {
  all: { totalAssets: 4250, operationalRate: 88.2 },
  kibuli: { totalAssets: 2900, operationalRate: 90.3 },
  buwaate: { totalAssets: 880, operationalRate: 84.6 },
  annex: { totalAssets: 470, operationalRate: 82.2 },
};
