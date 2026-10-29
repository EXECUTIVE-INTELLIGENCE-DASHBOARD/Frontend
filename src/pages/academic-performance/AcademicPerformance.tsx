import { useState } from "react";

import { AcademicFilters } from "../../components/filters/AcademicFilters";
import { AcademicSummary } from "../../components/academic-performance/AcademicSummary";
import { AcademicAnalytics } from "../../components/academic-performance/AcademicAnalytics";
import { AcademicDetails } from "../../components/academic-performance/AcademicDetails";

import type { AcademicFilterValues } from "../../components/filters/academicFilters.types";

import "./AcademicPerformance.css";

const initialFilters: AcademicFilterValues = {
  school: "",
  campus: "",
  section: "",
  term: "",
  year: "",
};

export default function AcademicPerformance() {
  const [filters, setFilters] = useState<AcademicFilterValues>(initialFilters);

  return (
    <main className="academic-performance">
      <AcademicFilters values={filters} onChange={setFilters} />
      <div className="academic-performance__content">
        <AcademicSummary filters={filters} />
        <AcademicAnalytics filters={filters} />
        <AcademicDetails filters={filters} />
      </div>
    </main>
  );
}
