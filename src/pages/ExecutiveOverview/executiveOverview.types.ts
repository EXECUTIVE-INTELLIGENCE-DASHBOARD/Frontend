export type MetricTone = "blue" | "green" | "amber";

export type MetricIcon = "users" | "calendar" | "staff";

export interface OverviewMetric {
  id: string;
  label: string;
  value: string;
  icon: MetricIcon;
  tone: MetricTone;
}

export interface BudgetPoint {
  id: string;
  /** Short quarter label, e.g. "Q1". */
  quarter: string;
  /** Month range covered by the quarter, e.g. "Sep-Nov". */
  period: string;
  /** Cumulative actual spend in millions (UGX). */
  actual: number;
  /** Cumulative planned spend in millions (UGX). */
  budget: number;
}

export type PipelineTone = "navy" | "blue" | "sky" | "gold";

export interface PipelineStage {
  id: string;
  label: string;
  /** Headline figure for the stage, e.g. "2,450". */
  value: string;
  /** Share of applications reaching the stage, e.g. "50.9%". Empty for the total. */
  share: string;
  /** Visual width of the funnel band, 0-100. */
  width: number;
  tone: PipelineTone;
}

export interface IncidentPoint {
  id: string;
  label: string;
  safety: number;
  disciplinary: number;
}

export type OrderTone = "critical" | "warning" | "positive";

export interface OpenOrder {
  id: string;
  name: string;
  date: string;
  status: string;
  tone: OrderTone;
}

export type ProjectTone = "blue" | "gold" | "amber";

export interface CapitalProject {
  id: string;
  name: string;
  percent: number;
  tone: ProjectTone;
}
