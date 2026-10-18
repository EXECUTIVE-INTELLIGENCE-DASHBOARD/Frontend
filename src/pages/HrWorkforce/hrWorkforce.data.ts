import type {
  CampusKey,
  Department,
  DepartmentFigures,
  DepartmentRow,
  WorkforceSummary,
} from "./hrWorkforce.types";

export const allCampusesLabel = "All Campuses";
export const allDepartmentsLabel = "All Departments";

/** The period the sample figures cover. */
export const reportingPeriod = "01 Feb 2026 → 17 Oct 2026";

/** Attendance at or above this rate shows green, below it amber. */
export const attendanceTarget = 95;

export const campuses: Array<{ key: CampusKey; label: string }> = [
  { key: "kibuli", label: "Kibuli Main Campus" },
  { key: "buwaate", label: "Buwaate Campus" },
  { key: "annex", label: "Annex / Preschool Branch" },
];

/* The five departments come from the design reference. */
export const departments: Department[] = [
  {
    id: "academic",
    name: "Academic & Curriculum Instruction",
    icon: "book",
    category: "Teaching Staff (Full-Time & Contract)",
    teaching: true,
    location: "Kibuli Main & Buwaate",
    attendanceRate: 98.0,
    absenceKind: "Leave",
    absenceTone: "neutral",
  },
  {
    id: "boarding",
    name: "Boarding & Catering Operations",
    icon: "utensils",
    category: "Non-Teaching Support",
    teaching: false,
    location: "Kibuli Main Dining Complex",
    attendanceRate: 95.8,
    absenceKind: "Leave",
    absenceTone: "neutral",
  },
  {
    id: "transport",
    name: "Transport & Fleet Management",
    icon: "bus",
    category: "Drivers & Mechanical Technicians",
    teaching: false,
    location: "Consolidated Transport Depot",
    attendanceRate: 97.7,
    absenceKind: "Training",
    absenceTone: "info",
  },
  {
    id: "admin",
    name: "Administration & Executive Support",
    icon: "briefcase",
    category: "Administrative & Clerical",
    teaching: false,
    location: "Kibuli Main Administrative Block",
    attendanceRate: 93.8,
    absenceKind: "Leave/Field",
    absenceTone: "warn",
  },
  {
    id: "facilities",
    name: "Facilities & Maintenance",
    icon: "wrench",
    category: "Technical, Security & Groundskeeping",
    teaching: false,
    location: "Multi-Campus Grounds",
    attendanceRate: 96.6,
    absenceKind: "Leave",
    absenceTone: "neutral",
  },
];

export const departmentOptions = [
  allDepartmentsLabel,
  ...departments.map((department) => department.name),
];

/*
 * Sample headcount and absences per campus. The three campuses add up to the
 * figures in the design reference: 205, 95, 45, 80 and 60 staff (485 in all)
 * and 4, 3, 1, 7 and 3 absences. A department that does not work on a campus
 * has no entry for it.
 */
const figuresByCampus: Record<
  CampusKey,
  Partial<Record<string, DepartmentFigures>>
> = {
  kibuli: {
    academic: { headcount: 120, absent: 2 },
    boarding: { headcount: 95, absent: 3 },
    transport: { headcount: 25, absent: 1 },
    admin: { headcount: 80, absent: 7 },
    facilities: { headcount: 30, absent: 2 },
  },
  buwaate: {
    academic: { headcount: 65, absent: 1 },
    transport: { headcount: 15, absent: 0 },
    facilities: { headcount: 20, absent: 1 },
  },
  annex: {
    academic: { headcount: 20, absent: 1 },
    transport: { headcount: 5, absent: 0 },
    facilities: { headcount: 10, absent: 0 },
  },
};

/* Workforce attendance per campus, in percent (sample). */
const attendanceByCampus: Record<CampusKey, number> = {
  kibuli: 96.6,
  buwaate: 96.0,
  annex: 95.0,
};

export const formatNumber = (value: number) => value.toLocaleString("en-US");

const round1 = (value: number) => Math.round(value * 10) / 10;

const selectedKeys = (label: string): CampusKey[] => {
  const match = campuses.find((campus) => campus.label === label);

  return match ? [match.key] : campuses.map((campus) => campus.key);
};

/** Every department that works on the campus, with its figures added up. */
function campusRows(label: string): DepartmentRow[] {
  const keys = selectedKeys(label);

  return departments.flatMap((department) => {
    const parts = keys
      .map((key) => figuresByCampus[key][department.id])
      .filter((part): part is DepartmentFigures => part !== undefined);

    if (parts.length === 0) {
      return [];
    }

    return [
      {
        ...department,
        headcount: parts.reduce((sum, part) => sum + part.headcount, 0),
        absent: parts.reduce((sum, part) => sum + part.absent, 0),
      },
    ];
  });
}

/** The table rows for a campus, narrowed to one department when chosen. */
export function rowsFor(
  campusLabel: string,
  departmentName: string = allDepartmentsLabel,
): DepartmentRow[] {
  const rows = campusRows(campusLabel);

  return departmentName === allDepartmentsLabel
    ? rows
    : rows.filter((row) => row.name === departmentName);
}

/** The three headline cards for a campus (not narrowed by department). */
export function summaryFor(campusLabel: string): WorkforceSummary {
  const rows = campusRows(campusLabel);
  const keys = selectedKeys(campusLabel);

  const totalStaff = rows.reduce((sum, row) => sum + row.headcount, 0);
  const teaching = rows
    .filter((row) => row.teaching)
    .reduce((sum, row) => sum + row.headcount, 0);

  const staffOn = (key: CampusKey) =>
    Object.values(figuresByCampus[key]).reduce(
      (sum, figures) => sum + (figures?.headcount ?? 0),
      0,
    );

  const attendance =
    keys.reduce((sum, key) => sum + attendanceByCampus[key] * staffOn(key), 0) /
    keys.reduce((sum, key) => sum + staffOn(key), 0);

  return {
    totalStaff,
    ratio:
      teaching === 0 ? "—" : `1:${((totalStaff - teaching) / teaching).toFixed(1)}`,
    attendance: round1(attendance),
  };
}

/** "4 on Leave", or "No absences" when nobody is away. */
export function absenceLabel(row: DepartmentRow): string {
  return row.absent === 0 ? "No absences" : `${row.absent} on ${row.absenceKind}`;
}

/** "98.0% Present". */
export const attendanceLabel = (rate: number) => `${rate.toFixed(1)}% Present`;
