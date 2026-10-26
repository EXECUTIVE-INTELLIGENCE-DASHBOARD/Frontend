import type {
  AttendanceFilters,
  AttendanceRow,
  ClassGroup,
  ResultsPoint,
  Section,
  Totals,
} from "./attendance.types";

/* Sample data. Replace buildRows() with the real endpoint in attendance.api.ts. */

export const CAMPUSES = ["All Campuses", "Kibuli", "Buwaate", "Greenhill International (GIS)"];
export const SECTIONS: { value: Section; label: string }[] = [
  { value: "", label: "All Sections" },
  { value: "Primary", label: "Primary" },
  { value: "Secondary", label: "Secondary" },
];
export const TERMS = [
  { value: 1, label: "Term 1", days: 58 },
  { value: 2, label: "Term 2", days: 62 },
  { value: 3, label: "Term 3", days: 55 },
];
export const YEARS = ["2026", "2025"];
export const STREAMS = ["East", "West"];
export const SUBJECTS = ["Mathematics", "English", "Science"];
export const WEEKS = 8;
export const DEFAULT_TARGET = 92;

const isGis = (campus: string) => campus.includes("GIS");

/** GIS follows Cambridge year groups; the other schools use the Ugandan class names. */
export function classesFor(campus: string, section: Section): string[] {
  const gis = isGis(campus);
  const primary = gis ? ["Year 5", "Year 6"] : ["Primary 5", "Primary 6", "Primary 7"];
  const secondary = gis ? ["Year 9", "Year 10 (IGCSE)", "Year 12 (AS Level)"] : ["Senior 1", "Senior 2"];
  if (section === "Primary") return primary;
  if (section === "Secondary") return secondary;
  return [...primary, ...secondary];
}

export const targetFor = (cls: string) => (/^Senior|^Year (9|1[0-3])/.test(cls) ? 90 : 92);

export function hash(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function buildRows(f: AttendanceFilters): AttendanceRow[] {
  const days = TERMS.find((t) => t.value === f.term)?.days ?? 55;
  const rows: AttendanceRow[] = [];
  classesFor(f.campus, f.section).forEach((cls) =>
    STREAMS.forEach((stream) => {
      const seed = hash(`${f.year}${f.campus}${days}${cls}${stream}`);
      const learners = 26 + (seed % 22);
      const total = learners * days;
      const present = Math.round((total * (85 + (seed % 135) / 10)) / 100);
      rows.push({
        cls,
        stream,
        learners,
        days,
        present,
        absent: total - present,
        rate: (present / total) * 100,
        target: targetFor(cls),
        seed,
      });
    }),
  );
  return rows;
}

export function summarise(rows: AttendanceRow[]): Totals {
  const t = { learners: 0, present: 0, absent: 0, below: 0 };
  rows.forEach((r) => {
    t.learners += r.learners;
    t.present += r.present;
    t.absent += r.absent;
    if (r.rate < r.target) t.below += 1;
  });
  return { ...t, rate: (t.present / (t.present + t.absent || 1)) * 100 };
}

export function groupByClass(rows: AttendanceRow[]): ClassGroup[] {
  const by = new Map<string, AttendanceRow[]>();
  rows.forEach((r) => by.set(r.cls, [...(by.get(r.cls) ?? []), r]));
  return [...by.entries()].map(([cls, rs]) => ({ cls, rate: summarise(rs).rate, target: targetFor(cls) }));
}

/** Weekly attendance for one class (or all classes when cls is empty). */
export function weeklyAttendance(rows: AttendanceRow[], cls: string) {
  const sel = rows.filter((r) => !cls || r.cls === cls);
  if (!sel.length) return null;
  const base = summarise(sel).rate;
  const seed = sel.reduce((a, r) => a ^ r.seed, 0) >>> 0;
  const points = Array.from({ length: WEEKS }, (_, i) => clamp(base + (((seed >>> i) % 9) - 4) * 1.1, 70, 100));
  return { points, target: cls ? targetFor(cls) : DEFAULT_TARGET };
}

/** Attendance beside average assessment score for the same weeks. */
export function weeklyResults(
  f: AttendanceFilters,
  subject: string,
  cls: string,
  stream: string,
  rate: number,
): ResultsPoint[] {
  const seed = hash(`${f.year}${f.campus}${subject}${f.term}${cls}${stream}`);
  return Array.from({ length: WEEKS }, (_, i) => {
    const attendance = Math.min(99, rate + (((seed >>> i) % 7) - 3) * 1.2);
    const missing = (seed >>> (i + 3)) % 9 === 0;
    const score = missing ? null : Math.min(95, 40 + (attendance - 85) * 1.6 + (((seed >>> (i + 1)) % 5) - 2) * 2);
    return { week: i + 1, attendance, score };
  });
}
