import { useEffect, useState } from "react";
import { getAttendance } from "./attendance.api";
import type { AttendanceFilters, AttendanceRow } from "./attendance.types";

export function useAttendance(filters: AttendanceFilters) {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { campus, section, term, year } = filters;

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    getAttendance({ campus, section, term, year })
      .then((r) => live && setRows(r))
      .catch(() => live && setError("Attendance data could not be loaded."))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [campus, section, term, year]);

  return { rows, loading, error };
}
