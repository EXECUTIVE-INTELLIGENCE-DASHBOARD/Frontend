export type YearId = "2026/27" | "2025/26" | "2024/25";

export type TermId = "t1" | "t2" | "t3" | "full";

/**
 * The six campuses that make up the group. Nursery, primary and secondary sit
 * under Kibuli, nursery and primary under Buwaate, and the international school
 * runs the full range on its own Kansanga campus.
 */
export type SchoolId =
  | "kibuli-nursery"
  | "kibuli-primary"
  | "kibuli-secondary"
  | "buwaate-nursery"
  | "buwaate-primary"
  | "kansanga-gis";

export type SchoolSelection = SchoolId | "all";

export type LevelId = "nursery" | "primary" | "olevel" | "alevel";

export type GenderId = "boys" | "girls";

export type AgeBandId = "3-5" | "6-9" | "10-13" | "14-16" | "17-19";

export type NationalityId =
  | "ugandan"
  | "kenyan"
  | "rwandese"
  | "south-sudanese"
  | "other";

export type ReligionId =
  | "catholic"
  | "anglican"
  | "muslim"
  | "pentecostal"
  | "other"
  | "not-stated";

export type ReasonId =
  | "fees"
  | "relocation"
  | "academic-transfer"
  | "family-health"
  | "discipline"
  | "completed"
  | "unknown";

export type RiskLevel = "high" | "medium" | "low";

export type DashboardTabId =
  | "overview"
  | "breakdowns"
  | "admissions"
  | "retention"
  | "withdrawals";

export interface School {
  id: SchoolId;
  name: string;
  short: string;
  /** Relative size used to derive deterministic sample figures. */
  scale: number;
}

export interface ClassDefinition {
  id: string;
  label: string;
  level: LevelId;
  schools: SchoolId[];
  /** Learners per stream before school scaling. */
  base: number;
  /** Share of continuing learners expected to leave during a period. */
  withdrawal: number;
  /** Share of learners who board, before school scaling. */
  boarding: number;
}

export interface Filters {
  year: YearId;
  term: TermId;
  school: SchoolSelection;
  classId: string;
  stream: string;
  /** Learner name or id; applies to learner-level tables only. */
  student: string;
}

/**
 * One class/stream cohort row. All figures are already scoped to the selected
 * period by `filteredRows`, so panels only need to aggregate.
 */
export interface CohortRow {
  id: string;
  schoolId: SchoolId;
  classId: string;
  classLabel: string;
  level: LevelId;
  stream: string;

  learners: number;
  boys: number;
  girls: number;
  day: number;
  boarding: number;
  capacity: number;

  opening: number;
  newLearners: number;
  continuing: number;
  withdrawn: number;

  applicants: number;
  shortlisted: number;
  interviewed: number;
  offered: number;
  accepted: number;
  reported: number;

  ageBands: Record<AgeBandId, number>;
  nationalities: Record<NationalityId, number>;
  religions: Record<ReligionId, number>;
}

export interface Figure<T extends string> {
  id: T;
  label: string;
  value: number;
  share: number;
}

export interface Aggregate {
  learners: number;
  boys: number;
  girls: number;
  day: number;
  boarding: number;
  capacity: number;
  opening: number;
  newLearners: number;
  continuing: number;
  withdrawn: number;

  applicants: number;
  shortlisted: number;
  interviewed: number;
  offered: number;
  accepted: number;
  reported: number;

  retentionRate: number;
  withdrawalRate: number;
  utilization: number;
  conversionRate: number;
  noShowRate: number;

  byAge: Array<Figure<AgeBandId>>;
  byNationality: Array<Figure<NationalityId>>;
  byReligion: Array<Figure<ReligionId>>;
}

export interface ClassAggregate {
  id: string;
  schoolId: SchoolId;
  classId: string;
  classLabel: string;
  level: LevelId;
  stream: string;

  learners: number;
  boys: number;
  girls: number;
  day: number;
  boarding: number;
  capacity: number;

  newLearners: number;
  continuing: number;
  withdrawn: number;

  applicants: number;
  offered: number;
  accepted: number;
  reported: number;

  retentionRate: number;
  withdrawalRate: number;
  utilization: number;
  conversionRate: number;
}

export interface SchoolAggregate {
  id: SchoolId;
  name: string;
  learners: number;
  newLearners: number;
  continuing: number;
  withdrawn: number;
  capacity: number;
  retentionRate: number;
  utilization: number;
}

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
  /** Share of applications, 0 to 100. */
  share: number;
  /** Conversion from the previous stage, 0 to 100. */
  conversion: number;
}

export interface TrendPoint {
  id: string;
  label: string;
  learners: number;
  newLearners: number;
  continuing: number;
  withdrawn: number;
  retentionRate: number;
}

export interface TransitionFigure {
  id: string;
  label: string;
  from: string;
  to: string;
  learners: number;
  retained: number;
  rate: number;
}

/** Figure<ReasonId> carries the label, so no extra members are needed. */
export type ReasonFigure = Figure<ReasonId>;

interface LearnerBase {
  id: string;
  name: string;
  schoolId: SchoolId;
  classId: string;
  stream: string;
  gender: GenderId;
}

export interface WithdrawalRecord extends LearnerBase {
  reasonId: ReasonId;
  recordedOn: string;
  period: string;
}

export interface AtRiskRecord extends LearnerBase {
  attendance: number;
  academic: number;
  arrearsDays: number;
  risk: RiskLevel;
  period: string;
}
