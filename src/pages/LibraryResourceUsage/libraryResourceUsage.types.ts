export type MetricTone = "blue" | "green" | "amber";

export type SeriesTone = "checkouts" | "returns";

export type ConditionTone =
  | "overdue"
  | "track"
  | "written-off"
  | "replacement"
  | "total";

export type CalloutTone = "amber" | "blue" | "green";

export type SignalTone = "order" | "hold" | "promote";

export interface FilterControl {
  id: string;
  label: string;
  value: string;
  options: string[];
}

export interface SummaryMetric {
  id: string;
  label: string;
  value: string;
  caption: string;
  tone: MetricTone;
}

export interface VolumeSeries {
  id: string;
  label: string;
  tone: SeriesTone;
  values: number[];
}

export interface SchoolActivityRow {
  id: string;
  school: string;
  checkouts: string;
  returns: string;
  net: string;
}

export interface InventoryRow {
  id: string;
  category: string;
  available: string;
  borrowed: string;
  reserved: string;
  unavailable: string;
}

export interface ConditionRow {
  id: string;
  condition: string;
  items: string;
  action: string;
  status?: string;
  tone: ConditionTone;
}

export interface AcquisitionCallout {
  id: string;
  label: string;
  body: string;
  tone: CalloutTone;
}

export interface TitleRow {
  id: string;
  title: string;
  copies: string;
  available: string;
  borrowedReserved: string;
  waiting: string;
  signal: string;
  tone: SignalTone;
}
