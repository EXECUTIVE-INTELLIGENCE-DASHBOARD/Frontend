// src/pages/AttendanceRates/AttendanceRates.tsx

import { useState } from "react";

import {
  CampusFilter,
  type CampusOption,
} from "../../components/filters/CampusFilter";

import { AttendanceSummaryCards } from "../../components/attendance-rates/AttendanceSummaryCards";
import { AttendanceGraph } from "../../components/attendance-rates/AttendanceGraph";
import { AttendanceTable } from "../../components/attendance-rates/AttendanceTable";

import "./AttendanceRates.css";

export function AttendanceRates() {
  const [selectedCampus, setSelectedCampus] =
    useState<CampusOption>("All Campuses");

  return (
    <main className="attendance-rates">
      <header className="attendance-rates__header">
        <div className="attendance-rates__filter">
          <CampusFilter onCampusChange={setSelectedCampus} />
        </div>
      </header>

      <AttendanceSummaryCards />

      <AttendanceGraph />

      <AttendanceTable />
    </main>
  );
}
