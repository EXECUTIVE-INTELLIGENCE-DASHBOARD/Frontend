import api from "../../api/axios";

/**
 * `GET /finance/school-fees/dashboard/` — school fees for one term: revenue per school
 * (or per class for one school), day vs boarding, and learners paid vs enrolled.
 */

export interface SchoolFeeFigures {
  revenue: number;
  day_revenue: number;
  /** null when the school has no boarding section */
  boarding_revenue: number | null;
  enrolled: number;
  paid: number;
  not_paid: number;
  paid_rate: number | null;
  fees_not_received: number;
}

export interface SchoolFeeRow extends SchoolFeeFigures {
  /** school id; null for a class row */
  id: number | null;
  /** school name, or the class (e.g. "P5") */
  name: string;
}

export interface SchoolFeeSection {
  section: "day" | "boarding";
  section_display: string;
  students: number;
  revenue: number;
  fee_per_student: number | null;
}

export interface SchoolFeesDashboard {
  term: { id: number; label: string } | null;
  school: { id: number; name: string; has_boarding: boolean } | null;
  has_boarding: boolean;
  summary: SchoolFeeFigures;
  sections: SchoolFeeSection[];
  breakdown_by: "school" | "class";
  breakdown: SchoolFeeRow[];
}

export interface SchoolFeesFilters {
  school?: number;
  term?: number;
}

export async function getSchoolFees(filters: SchoolFeesFilters = {}): Promise<SchoolFeesDashboard> {
  const params = {
    ...(filters.school ? { school: filters.school } : {}),
    ...(filters.term ? { term: filters.term } : {}),
  };
  const { data } = await api.get<SchoolFeesDashboard>("/finance/school-fees/dashboard/", {
    params,
  });
  return data;
}

/* ---------- Filter options ---------- */

export interface SchoolOption {
  id: number;
  name: string;
  campus: string;
  level: string;
}

export interface TermOption {
  id: number;
  academic_year: string;
  number: number;
  start_date: string;
}

type ApiList<T> = T[] | { results?: T[] };

const asList = <T>(data: ApiList<T>): T[] => (Array.isArray(data) ? data : data.results ?? []);

const campusOrder = ["kibuli", "buwaate", "gis"];
const levelOrder = ["nursery", "primary", "secondary"];

/** Schools in campus order (Kibuli, Buwaate, GIS), nursery to secondary within a campus. */
export async function getSchools(): Promise<SchoolOption[]> {
  const { data } = await api.get<ApiList<SchoolOption>>("/academics/schools/");
  const rank = (s: SchoolOption) => campusOrder.indexOf(s.campus) * 10 + levelOrder.indexOf(s.level);
  return asList(data).sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

/** Terms that have started, newest first. */
export async function getStartedTerms(today = new Date()): Promise<TermOption[]> {
  const { data } = await api.get<ApiList<TermOption>>("/academics/terms/");
  const now = today.toISOString().slice(0, 10);
  return asList(data)
    .filter((term) => term.start_date <= now)
    .sort((a, b) => b.start_date.localeCompare(a.start_date));
}
