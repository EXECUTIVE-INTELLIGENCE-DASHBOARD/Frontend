export type MetricTone = "blue" | "green" | "amber";

export type SignalTone = "strong" | "steady" | "watch";

export type RiskBandTone = "severe" | "moderate" | "watch";

export type PathwayTone = "blue" | "navy";

export type RosterStatusTone = "scheduled" | "coaching" | "progress" | "review";

export interface FilterControl {
  id: string;
  label: string;
  value: string;
}

export interface SummaryMetric {
  id: string;
  label: string;
  value: string;
  caption: string;
  tone: MetricTone;
  highlight?: boolean;
}

export interface TrendPoint {
  id: string;
  label: string;
  classAverage: number;
  schoolAverage: number;
}

export interface SubjectSignalRow {
  id: string;
  subject: string;
  term2: number;
  term3: number;
  signal: SignalTone;
}

export interface PathwayComparison {
  id: string;
  pathway: string;
  detail: string;
  value: number;
  tone: PathwayTone;
}

export interface RiskBand {
  id: string;
  label: string;
  value: number;
  tone: RiskBandTone;
}

export interface RiskIndicator {
  id: string;
  label: string;
  learners: number;
  percent: string;
  bands: RiskBand[];
}

export interface RetentionGroupRow {
  id: string;
  group: string;
  term2: number;
  term3: number;
}

export interface GraduationRow {
  id: string;
  cohort: string;
  completed: string;
  eligible: string;
  term2: number;
  term3: number;
}

export interface SupportRosterRow {
  id: string;
  learner: string;
  cohort: string;
  signal: string;
  route: string;
  support: string;
  owner: string;
  status: string;
  statusTone: RosterStatusTone;
}
