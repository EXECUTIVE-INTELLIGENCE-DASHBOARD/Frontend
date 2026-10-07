export type MetricTone = "blue" | "green" | "amber";

export type SeriesTone = "all" | "subject";

export type FollowUpTone = "building" | "practice" | "monitor";

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
}

export interface ChildTab {
  id: string;
  label: string;
}

export interface ProgressSeries {
  id: string;
  label: string;
  tone: SeriesTone;
  values: number[];
}

export interface AttendanceStat {
  id: string;
  label: string;
  value: string;
  note?: string;
}

export interface MissedDayRow {
  id: string;
  date: string;
  reason: string;
  followUp: string;
  status: string;
  tone: FollowUpTone;
}

export interface SubjectRow {
  id: string;
  subject: string;
  term1: string;
  term2: string;
  term3: string;
  progress: string;
  feedback: string;
  followUp: string;
  tone: FollowUpTone;
}
