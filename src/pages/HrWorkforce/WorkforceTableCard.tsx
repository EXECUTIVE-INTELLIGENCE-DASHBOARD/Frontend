import { useState } from "react";
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
import {
  absenceLabel,
  allDepartmentsLabel,
  attendanceLabel,
  attendanceTarget,
  departmentOptions,
  formatNumber,
  rowsFor,
} from "./hrWorkforce.data";
import type { DepartmentIcon } from "./hrWorkforce.types";

const ICONS: Record<DepartmentIcon, LucideIcon> = {
  book: BookOpen,
  utensils: Utensils,
  bus: Bus,
  briefcase: Briefcase,
  wrench: Wrench,
};

interface WorkforceTableCardProps {
  campusLabel: string;
}

export function WorkforceTableCard({ campusLabel }: WorkforceTableCardProps) {
  const [department, setDepartment] = useState(allDepartmentsLabel);

  const rows = rowsFor(campusLabel, department);

  const handleExport = () => {
    const csv = buildCsv(
      [
        "Department / Unit",
        "Nature / Staff Category",
        "Location & Campus",
        "Total Headcount",
        "Attendance Rate",
        "Absent",
      ],
      rows.map((row) => [
        row.name,
        row.category,
        row.location,
        row.headcount,
        `${row.attendanceRate.toFixed(1)}%`,
        absenceLabel(row),
      ]),
    );

    downloadCsv(csvFileName("hr-workforce", campusLabel), csv);
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
              {departmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
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
              <th scope="col">Absent Rate</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="hw-empty">
                  No staff are recorded for this selection.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const Icon = ICONS[row.icon];

                return (
                  <tr key={row.id}>
                    <td>
                      <span className="hw-department">
                        <span
                          className={`hw-department__icon hw-department__icon--${row.icon}`}
                          aria-hidden="true"
                        >
                          <Icon size={15} />
                        </span>

                        <span className="hw-department__name">{row.name}</span>
                      </span>
                    </td>
                    <td>
                      <span
                        className={`hw-tag ${row.teaching ? "hw-tag--teaching" : ""}`}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td className="hw-muted">{row.location}</td>
                    <td>
                      <span className="hw-headcount">
                        <strong>{formatNumber(row.headcount)}</strong>{" "}
                        <span>Staff</span>
                      </span>
                    </td>
                    <td>
                      <span
                        className={`hw-pill ${
                          row.attendanceRate >= attendanceTarget
                            ? "hw-pill--good"
                            : "hw-pill--warn"
                        }`}
                      >
                        <span className="hw-pill__dot" aria-hidden="true" />
                        {attendanceLabel(row.attendanceRate)}
                      </span>
                    </td>
                    <td>
                      <span className={`hw-absence hw-absence--${row.absenceTone}`}>
                        {absenceLabel(row)}
                      </span>
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
