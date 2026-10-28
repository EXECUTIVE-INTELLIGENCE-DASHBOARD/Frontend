import { useEffect, useState } from "react";
import { getAttendance } from "./attendance.api";
import type { AttendanceSource } from "./attendance.api";
import type { AttendanceRow } from "./attendance.types";

const NOTES: Record<AttendanceSource, string | null> = {
  api: null,
  empty: "No attendance records on the server yet.",
  offline: "The attendance server could not be reached.",
};

/**
 * The backend attendance records have no campus, section, term or year fields yet,
 * so none of the page filters are sent to the server.
 */
export function useAttendance() {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
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
        setRows(r.rows);
        setSource(r.source);
      })
      .catch(() => live && setError("Attendance data could not be loaded."))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  return { rows, loading, error, note: NOTES[source] };
}