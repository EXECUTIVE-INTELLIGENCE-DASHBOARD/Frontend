
import { useState } from "react";
import "./sectionFilters.css";

export type CampusOption =
  | "All Campuses"
  | "Kibuli Main Campus"
  | "Buwaate Campus"
  | "Annex / Preschool Branch";

export type SectionOption =
  | "All Sections"
  | "Nursery"
  | "Primary"
  | "Secondary"
  | "Preschool";

export type TermOption = "Term 1" | "Term 2" | "Term 3";

export type AcademicYearOption = string;

interface SectionFilterProps {
  onCampusChange?: (campus: CampusOption) => void;
  onSectionChange?: (section: SectionOption) => void;
  onTermChange?: (term: TermOption) => void;
  onAcademicYearChange?: (year: AcademicYearOption) => void;
}

const sectionsByCampus: Record<CampusOption, SectionOption[]> = {
  "All Campuses": [
    "All Sections",
    "Nursery",
    "Primary",
    "Secondary",
    "Preschool",
  ],
  "Kibuli Main Campus": [
    "All Sections",
    "Nursery",
    "Primary",
    "Secondary",
  ],
  "Buwaate Campus": [
    "All Sections",
    "Nursery",
    "Primary",
  ],
  "Annex / Preschool Branch": [
    "All Sections",
    "Preschool",
  ],
};

const campuses = Object.keys(sectionsByCampus) as CampusOption[];

const terms: TermOption[] = ["Term 1", "Term 2", "Term 3"];

const currentYear = new Date().getFullYear();

const academicYears = Array.from(
  { length: 5 },
  (_, index) => String(currentYear - 2 + index),
);

export function SectionFilter({
  onCampusChange,
  onSectionChange,
  onTermChange,
  onAcademicYearChange,
}: SectionFilterProps) {
  const [selectedCampus, setSelectedCampus] =
    useState<CampusOption>("All Campuses");

  const [selectedSection, setSelectedSection] =
    useState<SectionOption>("Secondary");

  const [selectedTerm, setSelectedTerm] =
    useState<TermOption>("Term 1");

  const [selectedYear, setSelectedYear] =
    useState<AcademicYearOption>(String(currentYear));

  const availableSections = sectionsByCampus[selectedCampus];

  function handleCampusChange(campus: CampusOption) {
    setSelectedCampus(campus);

    const nextSection = availableSectionsForCampus(campus).includes(
      selectedSection,
    )
      ? selectedSection
      : "All Sections";

    setSelectedSection(nextSection);

    onCampusChange?.(campus);
    onSectionChange?.(nextSection);
  }

  function availableSectionsForCampus(
    campus: CampusOption,
  ): SectionOption[] {
    return sectionsByCampus[campus];
  }

  function handleSectionChange(section: SectionOption) {
    setSelectedSection(section);
    onSectionChange?.(section);
  }

  function handleTermChange(term: TermOption) {
    setSelectedTerm(term);
    onTermChange?.(term);
  }

  function handleYearChange(year: AcademicYearOption) {
    setSelectedYear(year);
    onAcademicYearChange?.(year);
  }

  return (
    <div
      className="academic-filters"
      role="group"
      aria-label="Academic dashboard filters"
    >
      <label className="academic-filters__field">
        <span>Campus</span>
        <select
          value={selectedCampus}
          onChange={(event) =>
            handleCampusChange(event.target.value as CampusOption)
          }
          aria-label="Campus"
        >
          {campuses.map((campus) => (
            <option key={campus} value={campus}>
              {campus}
            </option>
          ))}
        </select>
      </label>

      <label className="academic-filters__field">
        <span>Section</span>
        <select
          value={selectedSection}
          onChange={(event) =>
            handleSectionChange(event.target.value as SectionOption)
          }
          aria-label="Section"
        >
          {availableSections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
      </label>

      <label className="academic-filters__field">
        <span>Term</span>
        <select
          value={selectedTerm}
          onChange={(event) =>
            handleTermChange(event.target.value as TermOption)
          }
          aria-label="Term"
        >
          {terms.map((term) => (
            <option key={term} value={term}>
              {term}
            </option>
          ))}
        </select>
      </label>

      <label className="academic-filters__field">
        <span>Academic Year</span>
        <select
          value={selectedYear}
          onChange={(event) => handleYearChange(event.target.value)}
          aria-label="Academic Year"
        >
          {academicYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default SectionFilter;
