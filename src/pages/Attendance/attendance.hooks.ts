import { useEffect, useState } from "react";
import { getAttendance } from "./attendance.api";
import type { AttendanceSource } from "./attendance.api";
import type { AttendanceFilters, AttendanceRow } from "./attendance.types";

const NOTES: Record<AttendanceSource, string | null> = {
  api: null,
  empty: "No attendance records on the server yet, so sample data is shown.",
  offline: "The attendance server could not be reached, so sample data is shown.",
};

export function useAttendance(filters: AttendanceFilters) {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [source, setSource] = useState<AttendanceSource>("api");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { campus, section, term, year } = filters;

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    getAttendance({ campus, section, term, year })
      .then((r) => {
        if (!live) return;
        setRows(r.rows);
        setSource(r.source);
      })
      .catch(() => live && setError("Attendance data could not be loaded."))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [campus, section, term, year]);

  return { rows, loading, error, note: NOTES[source] };
}
