import { useState } from "react";

import { AcademicSummary } from "../../components/academic-performance/AcademicSummary";

import { AcademicAnalytics } from "../../components/academic-performance/AcademicAnalytics";

import { AcademicDetails } from "../../components/academic-performance/AcademicDetails";

import "./AcademicPerformance.css";

const campuses = [
  "All Campuses",
  "Kibuli Main Campus",
  "Buwaate Campus",
  "Annex Preschool",
  "Secondary Campus",
  "Primary Campus",
];

const sections = ["Nursery", "Primary", "Secondary"];

const terms = ["Term 1", "Term 2", "Term 3"];

const currentYear = new Date().getFullYear();

const years = Array.from({ length: 5 }, (_, index) =>
  String(currentYear - index),
);

export function AcademicPerformance() {
  const [selectedCampus, setSelectedCampus] = useState("All Campuses");

  const [selectedSection, setSelectedSection] = useState("Secondary");

  const [selectedTerm, setSelectedTerm] = useState("Term 1");

  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  return (
    <main className="academic-performance">
      <section
        className="academic-performance__filters"
        aria-label="Academic performance filters"
      >
        <label className="academic-performance__filter">
          <span>Campus</span>

          <select
            value={selectedCampus}
            onChange={(event) => setSelectedCampus(event.target.value)}
          >
            {campuses.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
        </label>

        <label className="academic-performance__filter">
          <span>Section</span>

          <select
            value={selectedSection}
            onChange={(event) => setSelectedSection(event.target.value)}
          >
            {sections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        </label>

        <label className="academic-performance__filter">
          <span>Term</span>

          <select
            value={selectedTerm}
            onChange={(event) => setSelectedTerm(event.target.value)}
          >
            {terms.map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </select>
        </label>

        <label className="academic-performance__filter">
          <span>Academic Year</span>

          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="academic-performance__content">
        <AcademicSummary />

        <AcademicAnalytics />

        <AcademicDetails />
      </div>
    </main>
  );
}
