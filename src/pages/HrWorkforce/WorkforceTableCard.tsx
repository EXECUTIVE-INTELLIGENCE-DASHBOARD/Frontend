import { useMemo, useState } from "react";
import {
  BookOpen,
  Briefcase,
  Bus,
  ChevronDown,
  Download,
  SlidersHorizontal,
  Utensils,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { buildCsv, csvFileName, downloadCsv } from "../../lib/csv";
import type { HrWorkforceUnit } from "./hrWorkforce.api";
import { formatNumber } from "./hrWorkforce.data";
import type { DepartmentIcon } from "./hrWorkforce.types";

const ICONS: Record<DepartmentIcon, LucideIcon> = {
  book: BookOpen,
  utensils: Utensils,
  bus: Bus,
  briefcase: Briefcase,
  wrench: Wrench,
};

const ALL_DEPARTMENTS = "All Departments";

function iconForUnit(unit: HrWorkforceUnit): DepartmentIcon {
  switch (unit.staff_category) {
    case "teaching":
      return "book";
    case "non_teaching_support":
      return "utensils";
    case "drivers_technicians":
      return "bus";
    case "administrative":
      return "briefcase";
    case "technical_security":
      return "wrench";
    default:
      return "briefcase";
  }
}

interface WorkforceTableCardProps {
  units: HrWorkforceUnit[];
}

export function WorkforceTableCard({ units }: WorkforceTableCardProps) {
  const [department, setDepartment] = useState(ALL_DEPARTMENTS);

  const departments = useMemo(
    () => [...new Set(units.map((unit) => unit.name))],
    [units],
  );

  const rows = useMemo(
    () =>
      department === ALL_DEPARTMENTS
        ? units
        : units.filter((unit) => unit.name === department),
    [department, units],
  );

  const handleExport = () => {
    const csv = buildCsv(
      [
        "Department / Unit",
        "Nature / Staff Category",
        "Location & Campus",
        "Total Headcount",
        "Attendance Rate",
        "On Leave",
        "Absences",
      ],
      rows.map((unit) => [
        unit.name,
        unit.staff_category_display,
        unit.location,
        unit.headcount,
        unit.attendance_rate == null
          ? "—"
          : `${unit.attendance_rate.toFixed(1)}%`,
        unit.absences?.on_leave ?? 0,
        Object.keys(unit.absences).length ? JSON.stringify(unit.absences) : "—",
      ]),
    );

    downloadCsv(csvFileName("hr-workforce", "All Campuses"), csv);
  };

  return (
    <section className="hw-card">
      <div className="hw-card__header">
        <h2 className="hw-card__title">
          <span className="hw-card__dot" aria-hidden="true" />
          Consolidated Workforce Distribution &amp; Attendance Register
        </h2>

        <div className="hw-card__actions">
          <div className="hw-select">
            <SlidersHorizontal size={14} aria-hidden="true" />

            <select
              aria-label="Filter department"
              className="hw-select__field"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
            >
              <option value={ALL_DEPARTMENTS}>{ALL_DEPARTMENTS}</option>
              {departments.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <ChevronDown size={14} aria-hidden="true" />
          </div>

          <button
            type="button"
            className="hw-button hw-button--primary"
            onClick={handleExport}
          >
            <Download size={14} aria-hidden="true" />
            Export Report
          </button>
        </div>
      </div>

      <div className="hw-table-wrap">
        <table className="hw-table">
          <thead>
            <tr>
              <th scope="col">Department / Unit</th>
              <th scope="col">Nature / Staff Category</th>
              <th scope="col">Location &amp; Campus</th>
              <th scope="col">Total Headcount</th>
              <th scope="col">Attendance Rate</th>
              <th scope="col">On Leave</th>
              <th scope="col">Absences</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="hw-empty">
                  No workforce units are available for this selection.
                </td>
              </tr>
            ) : (
              rows.map((unit) => {
                const Icon = ICONS[iconForUnit(unit)];

                return (
                  <tr key={unit.id}>
                    <td>
                      <span className="hw-department">
                        <span
                          className={`hw-department__icon hw-department__icon--${iconForUnit(unit)}`}
                          aria-hidden="true"
                        >
                          <Icon size={15} />
                        </span>
                        <span className="hw-department__name">{unit.name}</span>
                      </span>
                    </td>

                    <td>
                      <span
                        className={`hw-tag ${
                          unit.staff_category === "teaching"
                            ? "hw-tag--teaching"
                            : ""
                        }`}
                      >
                        {unit.staff_category_display}
                      </span>
                    </td>

                    <td className="hw-muted">{unit.location || "—"}</td>

                    <td>
                      <span className="hw-headcount">
                        <strong>{formatNumber(unit.headcount)}</strong>{" "}
                        <span>Staff</span>
                      </span>
                    </td>

                    <td>
                      <span className="hw-pill">
                        {unit.attendance_rate == null
                          ? "—"
                          : `${unit.attendance_rate.toFixed(1)}%`}
                      </span>
                    </td>

                    <td>{unit.absences?.on_leave ?? 0}</td>

                    <td>
                      {Object.keys(unit.absences).length
                        ? Object.entries(unit.absences)
                            .map(([name, count]) => `${name}: ${count}`)
                            .join(", ")
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
