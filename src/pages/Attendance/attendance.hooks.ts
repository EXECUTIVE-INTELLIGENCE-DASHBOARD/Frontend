import { useEffect, useMemo, useState } from "react";
import { getAttendance } from "./attendance.api";
import type { AttendanceSource } from "./attendance.api";
import { buildRows } from "./attendance.data";
import type { AttendanceFilters, AttendanceRow } from "./attendance.types";

const NOTES: Record<AttendanceSource, string | null> = {
  api: null,
  empty: null,
  offline: "The attendance server could not be reached. Showing sample data.",
};

export function useAttendance(filters: AttendanceFilters) {
  const [apiRows, setApiRows] = useState<AttendanceRow[]>([]);
  const [source, setSource] = useState<AttendanceSource>("api");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    getAttendance()
      .then((r) => {
        if (!live) return;
        setApiRows(r.rows);
        setSource(r.source);
      })
      .catch(() => {
        if (!live) return;
        setSource("offline");
      })
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  const { campus, section, term, year } = filters;

  // Real data when the backend has some, sample data otherwise.
  const rows = useMemo(
    () =>
      source === "api"
        ? apiRows
        : buildRows({ campus, section, term, year }),
    [source, apiRows, campus, section, term, year],
  );

  return { rows, loading, error, note: NOTES[source] };
}