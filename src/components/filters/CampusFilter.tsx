
import { useState } from "react";
import "./CampusFilter.css";

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

interface CampusFilterProps {
  onCampusChange?: (campus: CampusOption) => void;
  onSectionChange?: (section: SectionOption) => void;
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

const campuses = Object.keys(
  sectionsByCampus,
) as CampusOption[];

export function CampusFilter({
  onCampusChange,
  onSectionChange,
}: CampusFilterProps) {
  const [selectedCampus, setSelectedCampus] =
    useState<CampusOption>("All Campuses");

  const [selectedSection, setSelectedSection] =
    useState<SectionOption>("All Sections");

  const availableSections = sectionsByCampus[selectedCampus];

  function handleCampusChange(campus: CampusOption) {
    setSelectedCampus(campus);
    setSelectedSection("All Sections");

    onCampusChange?.(campus);
    onSectionChange?.("All Sections");
  }

  function handleSectionChange(section: SectionOption) {
    setSelectedSection(section);
    onSectionChange?.(section);
  }

  return (
    <div
      className="campus-filter__scope"
      aria-label="Campus and section filters"
    >
      <label className="campus-filter__field">
        <span className="campus-filter__sr-only">Campus</span>
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

      <label className="campus-filter__field">
        <span className="campus-filter__sr-only">
          School section
        </span>
        <select
          value={selectedSection}
          onChange={(event) =>
            handleSectionChange(event.target.value as SectionOption)
          }
          aria-label="School section"
        >
          {availableSections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
