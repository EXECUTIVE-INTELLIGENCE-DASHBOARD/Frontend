export type CampusId = "kibuli" | "buwaate" | "annex";
export type CampusFilterValue = "all" | CampusId;
export type Condition = "good" | "servicing" | "critical";

export interface CampusOption {
  value: CampusFilterValue;
  label: string;
}

export interface AssetRow {
  id: string;
  name: string;
  category: string;
  location: string;
  campus: CampusId;
  value: number; // UGX
  quantity: number;
  unit: string; // "Units" | "Vehicles"
  condition: Condition;
}

export interface AssetSummary {
  totalAssets: number;
  operationalRate: number; // %; capital risk is 100 - operationalRate
}
