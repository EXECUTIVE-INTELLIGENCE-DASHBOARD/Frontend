export type Tone = "green" | "amber" | "red" | "blue" | "slate";

export type TrendTone = "primary" | "target" | "previous";

export type GroupTone = "present" | "late" | "absent";

export interface FilterControl {
  id: string;
  label: string;
  options: string[];
}

export interface SummaryMetric {
  id: "rate" | "followup" | "declining";
  label: string;
  value: string;
  caption: string;
  tone: Tone;
}

export interface TrendSeries {
  id: string;
  label: string;
  tone: TrendTone;
  values: number[];
}

export interface GroupSeries {
  id: string;
  label: string;
  tone: GroupTone;
  values: number[];
}

export interface ClassComparisonRow {
  id: string;
  kind: string;
  name: string;
  term1: number;
  term2: number;
  term3: number;
  change: number;
  flag: string;
  tone: Tone;
}

export interface InterventionRow {
  id: string;
  band: string;
  bandMeta: string;
  signal: string;
  signalMeta: string;
  action: string;
  owner: string;
  ownerMeta: string;
  due: string;
  status: string;
  tone: Tone;
}
