// Sample data from the HR design prototype.
// TODO: replace with calls in src/lib/api.ts when endpoints exist.
import { allCampusesLabel, summaryFor } from "./hrWorkforce.data";
import type {
  Employer,
  EmployerFilter,
  EstablishmentRow,
  ExitRecord,
  ExitType,
  GslUnit,
  RenewalStatus,
  SeniorStaff,
} from "./hrTalent.types";

/** "Today" for the sample figures; switch to the real date once data is live. */
export const asOf = "2026-10-19";

/** The screen opens on the schools' figures, as it did before the GSL rows were added. */
export const defaultEmployer: EmployerFilter = "schools";

export const employerOptions: Array<{ value: EmployerFilter; label: string }> = [
  { value: "all", label: "All Employment" },
  { value: "schools", label: "Greenhill Schools" },
  { value: "gsl", label: "GSL – Services & Head Office" },
];

export const employerLabel = (value: EmployerFilter) =>
  employerOptions.find((option) => option.value === value)?.label ?? "All Employment";

export const byEmployer =
  (filter: EmployerFilter) =>
  (item: { employer: Employer }): boolean =>
    filter === "all" || item.employer === filter;

/* ---------- GSL workforce register ---------- */

export const gslLocation = "GSL Services";

const gslRaw: Array<[string, string, number, number, number]> = [
  ["GSL Head Office", "General Manager, Operations Officer & Assistant", 3, 100, 0],
  ["Shop A – Uniform Shop", "Cashier & seasonal helpers", 3, 97, 1],
  ["Shop B – Stationery Shop", "Cashier & part-time assistant", 2, 95.5, 0],
  ["Shop C", "Cashier & part-time cashier", 2, 94, 0],
  ["Shop D", "Cashier, assistant & seasonal helper", 3, 92.5, 1],
  ["Café", "Barista, chef, cashier, cleaner & part-timers", 7, 95, 1],
  ["Minimart", "Cashier & part-time assistant", 2, 96, 0],
];

export const gslUnits: GslUnit[] = gslRaw.map(
  ([name, category, headcount, attendanceRate, absent], index) => ({
    id: `gsl-${index}`,
    name,
    category,
    headcount,
    attendanceRate,
    absent,
  }),
);

export const gslHeadcount = gslUnits.reduce((sum, unit) => sum + unit.headcount, 0);

/** Headcount-weighted attendance across the GSL units, in percent. */
export const gslAttendance =
  gslUnits.reduce((sum, unit) => sum + unit.attendanceRate * unit.headcount, 0) / gslHeadcount;

export const gslAbsenceLabel = (unit: GslUnit) =>
  unit.absent === 0 ? "No absences" : `${unit.absent} on Leave`;

/** All staff for the chosen employer (schools figures are for every campus). */
export function headcountFor(filter: EmployerFilter): number {
  const schools = summaryFor(allCampusesLabel).totalStaff;

  if (filter === "schools") return schools;
  if (filter === "gsl") return gslHeadcount;

  return schools + gslHeadcount;
}

/* ---------- Establishment ---------- */

const establishmentRaw: Array<[string, string, number, number, Employer]> = [
  ["Teaching – Sciences", "Kibuli Main", 38, 34, "schools"],
  ["Teaching – Mathematics", "Kibuli Main", 24, 22, "schools"],
  ["Teaching – Languages", "Kibuli Main & Buwaate", 32, 29, "schools"],
  ["Teaching – Humanities", "Kibuli Main", 30, 28, "schools"],
  ["Teaching – Arts & Technical", "Buwaate", 18, 14, "schools"],
  ["Teaching – Primary Section", "Buwaate", 46, 42, "schools"],
  ["GSL Head Office", gslLocation, 3, 3, "gsl"],
  ["Shop A – Uniform Shop", gslLocation, 3, 3, "gsl"],
  ["Shop B – Stationery Shop", gslLocation, 2, 2, "gsl"],
  ["Shop C", gslLocation, 2, 2, "gsl"],
  ["Shop D", gslLocation, 4, 3, "gsl"],
  ["Café", gslLocation, 8, 7, "gsl"],
  ["Minimart", gslLocation, 2, 2, "gsl"],
];

export const establishment: EstablishmentRow[] = establishmentRaw.map(
  ([name, location, approved, filled, employer], index) => ({
    id: `est-${index}`,
    name,
    location,
    approved,
    filled,
    employer,
  }),
);

export const fillRate = (row: EstablishmentRow) => Math.round((row.filled / row.approved) * 100);

/* ---------- Exits & turnover ---------- */

const exitsRaw: Array<[string, string, string, string, string, ExitType, Employer]> = [
  ["Mr. John Mubiru", "Chemistry Teacher", "Sciences", "2026-09-30", "Resignation", "Voluntary", "schools"],
  ["Ms. Sarah Nankya", "Primary Class Teacher", "Primary Section", "2026-09-15", "Relocation", "Voluntary", "schools"],
  ["Mr. Peter Odongo", "Bus Driver", "Transport & Fleet", "2026-08-31", "Contract ended", "Contract end", "schools"],
  ["Mrs. Agnes Birungi", "Mathematics Teacher", "Mathematics", "2026-07-31", "Retirement", "Retirement", "schools"],
  ["Mr. Isaac Lubega", "Art Teacher", "Arts & Technical", "2026-06-30", "Better offer", "Voluntary", "schools"],
  ["Ms. Joan Akello", "Boarding Kitchen Supervisor", "Boarding Kitchen", "2026-05-31", "Resignation", "Voluntary", "schools"],
  ["Mr. Brian Kiiza", "Groundskeeper", "Facilities", "2026-04-30", "Dismissal", "Involuntary", "schools"],
  ["Ms. Doreen Tumusiime", "Languages Teacher", "Languages", "2026-03-31", "Further studies", "Voluntary", "schools"],
  ["Ms. Brenda Nakirya", "Cashier", "Minimart", "2026-08-15", "Resignation", "Voluntary", "gsl"],
  ["Ms. Mary Auma", "Part-time Waitress", "Café", "2026-07-10", "Resignation", "Voluntary", "gsl"],
  ["Mr. Denis Ssali", "Seasonal Helper", "Shop A – Uniform Shop", "2026-06-15", "Term 1 ended", "Contract end", "gsl"],
];

export const exits: ExitRecord[] = exitsRaw
  .map(([name, role, unit, date, reason, type, employer], index) => ({
    id: `exit-${index}`,
    name,
    role,
    unit,
    date,
    reason,
    type,
    employer,
  }))
  .sort((a, b) => b.date.localeCompare(a.date));

/* ---------- Senior staff: contracts and ratings ---------- */

const seniorsRaw: Array<[string, string, string, number, string, RenewalStatus, Employer]> = [
  ["Mr. Andrew Byaruhanga", "General Manager – GSL", "2027-05-31", 4.2, "Jun 2026", "Not yet due", "gsl"],
  ["Ms. Prossy Nambi", "Operations Officer – GSL", "2027-01-15", 4.0, "Jun 2026", "Renewal recommended", "gsl"],
  ["Dr. Peter Ssemakula", "Head Teacher", "2027-03-31", 4.6, "Jun 2026", "Pending board decision", "schools"],
  ["Ms. Grace Namukasa", "Deputy Head – Academics", "2026-12-31", 4.3, "Jun 2026", "Renewal recommended", "schools"],
  ["Mr. David Okello", "Deputy Head – Administration", "2027-06-30", 3.9, "Jun 2026", "Not yet due", "schools"],
  ["Mrs. Rose Nakato", "Bursar", "2026-11-30", 4.4, "Jun 2026", "Renewal recommended", "schools"],
  ["Mr. Joseph Mugisha", "Director of Studies", "2027-08-31", 4.1, "Jun 2026", "Not yet due", "schools"],
  ["Ms. Esther Atim", "Head of Boarding", "2027-01-31", 3.2, "Jun 2026", "Under review", "schools"],
  ["Mr. Samuel Kato", "Transport Manager", "2027-12-31", 4.0, "Jun 2026", "Not yet due", "schools"],
  ["Ms. Irene Nabirye", "ICT Manager", "2028-03-31", 4.5, "Jun 2026", "Not yet due", "schools"],
  ["Mr. Moses Wanyama", "Estates Manager", "2027-02-28", 2.8, "Jun 2026", "Under review", "schools"],
];

export const seniors: SeniorStaff[] = seniorsRaw.map(
  ([name, position, contractEnd, rating, lastReview, renewal, employer], index) => ({
    id: `senior-${index}`,
    name,
    position,
    contractEnd,
    rating,
    lastReview,
    renewal,
    employer,
  }),
);

export const daysLeft = (date: string) =>
  Math.round((Date.parse(date) - Date.parse(asOf)) / 86_400_000);

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const exceedsRating = 4.3;
export const needsImprovementBelow = 3;
