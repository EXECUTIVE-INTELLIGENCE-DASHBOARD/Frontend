import { buildRows } from "./attendance.data";
import type { AttendanceFilters, AttendanceRow } from "./attendance.types";

/**
 * TODO: replace with the real endpoint, e.g. through src/lib/api/academics.ts:
 *   GET /academics/attendance?campus=&section=&term=&year=
 * It should return one row per class and stream with learners, days, present
 * and absent, plus the agreed target. Assessment scores need their own endpoint.
 */
export async function getAttendance(filters: AttendanceFilters): Promise<AttendanceRow[]> {
  return buildRows(filters);
}
