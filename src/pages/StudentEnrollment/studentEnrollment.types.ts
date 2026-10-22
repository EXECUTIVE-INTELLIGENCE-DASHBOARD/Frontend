/** The campus key sent by the backend, for example "kibuli". */
export type CampusId = string;

export type TierId = "nursery" | "primary" | "olevel" | "alevel";

export interface CampusRecord {
  id: CampusId;
  name: string;
  boys: number;
  girls: number;
  capacity: number;
  /** Percentage of applicants who went on to enrol, 0 to 100. */
  admissionsConversion: number;
  /** Students in each educational tier. They add up to boys + girls. */
  tiers: Record<TierId, number>;
}

export interface TierFigure {
  id: TierId;
  label: string;
  value: number;
  /** Share of the selected enrolment, 0 to 100. */
  share: number;
}

export interface TierLegendItem {
  label: string;
  tone: TierId;
}

export interface EnrollmentSummary {
  /** The campuses being shown: one when a campus is picked, otherwise all. */
  records: CampusRecord[];
  isAll: boolean;
  total: number;
  boys: number;
  girls: number;
  boysShare: number;
  girlsShare: number;
  conversion: number;
  utilization: number;
  tiers: TierFigure[];
  scopeText: string;
}
