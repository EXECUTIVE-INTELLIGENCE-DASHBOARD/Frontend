export type MetricTone = "blue" | "green" | "amber";

export type SeriesTone = "current" | "previous";

export type AttentionTone = "closing" | "planning" | "monitor";

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

export interface EnrollmentSeries {
  id: string;
  label: string;
  tone: SeriesTone;
  values: number[];
}

export interface ComparisonStat {
  id: string;
  label: string;
  value: string;
  note?: string;
}

export interface CohortRow {
  id: string;
  group: string;
  sciences: string;
  arts: string;
  total: string;
}

export interface CapacityRow {
  id: string;
  group: string;
  enrolled: string;
  capacity: string;
  placesLeft: string;
  utilization: string;
  owner: string;
}

export interface AttentionRow {
  id: string;
  area: string;
  change: string;
  followUp: string;
  owner: string;
  status: string;
  tone: AttentionTone;
}
