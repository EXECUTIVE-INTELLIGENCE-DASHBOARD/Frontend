export type DeltaDirection = "up" | "down";

export type MetricTone = "blue" | "green" | "amber";

export interface Metric {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaDirection: DeltaDirection;
  context: string;
  tone: MetricTone;
}

export type SubjectIconName = "science" | "maths" | "english" | "ict";

export interface SubjectPerformanceRow {
  id: string;
  name: string;
  caption: string;
  icon: SubjectIconName;
  graded: number;
  average: number;
  delta: number;
  pass: number;
  fail: number;
}

export type RetentionTone = "navy" | "blue" | "sky";

export interface RetentionSegment {
  id: string;
  label: string;
  value: number;
  tone: RetentionTone;
}

export interface RetentionStat {
  id: string;
  label: string;
  value: string;
}

export type ActionTone = "warning" | "info";

export interface SupportRow {
  id: string;
  group: string;
  trend: string;
  indicator: string;
  impact: number;
  action: string;
  actionTone: ActionTone;
}
