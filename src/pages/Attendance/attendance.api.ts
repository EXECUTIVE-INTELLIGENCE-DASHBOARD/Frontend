import { academicsApi } from "../../lib/api/academics";
import type { AttendanceRecord } from "../../lib/api/types";
import { hash, targetFor } from "./attendance.data";
import type { AttendanceRow } from "./attendance.types";

/**
 * Where the rows came from:
 *   "api"     built from attendance records returned by the backend
 *   "empty"   the backend answered but has no usable attendance records yet
 *   "offline" the backend could not be reached
 * For "empty" and "offline" there are no rows.
 */
export type AttendanceSource = "api" | "empty" | "offline";

export interface AttendanceResult {
  rows: AttendanceRow[];
  source: AttendanceSource;
}

/** Share of a day present (0-100) read from the backend's text field, or null if unreadable. */
function presence(value: string): number | null {
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return null;
  if (/^\d+(\.\d+)?%?$/.test(v)) return Math.min(100, Math.max(0, Number.parseFloat(v)));
  if (/^(n[/]a|na|none|-+)$/.test(v)) return null;
  if (/^(p|present|y|yes|t|true)(?![a-z])/.test(v)) return 100;
  if (/^(a|absent|n|no|f|false)(?![a-z])/.test(v)) return 0;
  return null;
}

/** The list endpoint may return a plain array or a paginated { results } object. */
function asList(data: unknown): AttendanceRecord[] {
  if (Array.isArray(data)) return data as AttendanceRecord[];
  const results = (data as { results?: unknown } | null)?.results;
  return Array.isArray(results) ? (results as AttendanceRecord[]) : [];
}

/**
 * Student-level records -> one row per class (the record has no stream, campus
 * or term, so the whole class is one row). Records whose value cannot be read
 * as present/absent or a percentage are skipped.
 */
export function recordsToRows(records: AttendanceRecord[]): AttendanceRow[] {
  const byClass = new Map<string, { students: Map<number, number>; present: number; counted: number }>();
  for (const r of records) {
    const share = presence(r.student_attendance);
    const cls = String(r.grade ?? "").trim();
    if (share === null || !cls) continue;
    const g = byClass.get(cls) ?? { students: new Map<number, number>(), present: 0, counted: 0 };
    g.students.set(r.name, (g.students.get(r.name) ?? 0) + 1);
    g.present += share / 100;
    g.counted += 1;
    byClass.set(cls, g);
  }
  return Array.from(byClass.entries())
    .map(([cls, g]) => {
      const present = Math.round(g.present);
      return {
        cls,
        stream: "All",
        learners: g.students.size,
        days: Math.max(...Array.from(g.students.values())),
        present,
        absent: g.counted - present,
        rate: Math.round((g.present / g.counted) * 1000) / 10,
        target: targetFor(cls),
        seed: hash(cls),
      };
    })
    .sort((a, b) => a.cls.localeCompare(b.cls, undefined, { numeric: true }));
}

export async function getAttendance(): Promise<AttendanceResult> {
  try {
    const rows = recordsToRows(asList(await academicsApi.attendance.list({})));
    return { rows, source: rows.length ? "api" : "empty" };
  } catch {
    return { rows: [], source: "offline" };
  }
}