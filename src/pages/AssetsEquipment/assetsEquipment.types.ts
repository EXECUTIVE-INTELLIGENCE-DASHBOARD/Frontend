export type AssetCondition =
  | "operational"
  | "servicing_required"
  | "critical"
  | "decommissioned";

export interface Asset {
  id: number;
  name: string;
  category: string;
  category_display?: string;
  facility: number;
  facility_name: string;
  campus: string;
  campus_display?: string;
  quantity: number;
  available_quantity: number;
  unit_value: string | number;
  total_value: string | number;
  condition: AssetCondition;
  condition_display?: string;
  acquired_date: string | null;
}

export interface AssetSummary {
  total_assets: number;
  in_use: number;
  out_of_use: number;
  total_value: string | number;
  operational_rate: number | null;
  capital_risk: number | null;
  capital_at_risk_value: string | number;
  units_by_condition: Record<string, number>;
}

export interface AssetDashboardResponse {
  summary: AssetSummary;
  assets: Asset[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type AssetListResponse =
  | Asset[]
  | PaginatedResponse<Asset>;

export interface AssetFilters {
  campus: string;
  category: string;
  facility: string;
  condition: string;
}