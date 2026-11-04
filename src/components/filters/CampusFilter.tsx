
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
  onScopeChange?: (
    campus: CampusOption,
    section: SectionOption,
  ) => void;
  selectedCampus?: CampusOption;
  selectedSection?: SectionOption;
  showCampus?: boolean;
  showSection?: boolean;
  campusOptions?: readonly {
    value: CampusOption;
    label: string;
    sections?: readonly SectionOption[];
  }[];
  showLabels?: boolean;
}

export const sectionsByCampus: Record<CampusOption, SectionOption[]> = {
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

export const campuses = Object.keys(
  sectionsByCampus,
) as CampusOption[];

export function CampusFilter({
  onCampusChange,
  onSectionChange,
  onScopeChange,
  selectedCampus: controlledCampus,
  selectedSection: controlledSection,
  showCampus = true,
  showSection = true,
  campusOptions,
  showLabels = false,
}: CampusFilterProps) {
  const [internalCampus, setInternalCampus] =
    useState<CampusOption>("All Campuses");

  const [internalSection, setInternalSection] =
    useState<SectionOption>("All Sections");
  const selectedCampus = controlledCampus ?? internalCampus;
  const selectedSection = controlledSection ?? internalSection;

  const options: readonly {
    value: CampusOption;
    label: string;
    sections?: readonly SectionOption[];
  }[] =
    campusOptions ??
    campuses.map((campus) => ({
      value: campus,
      label: campus,
    }));
  const availableSections =
    options.find((option) => option.value === selectedCampus)?.sections ??
    sectionsByCampus[selectedCampus];

  function handleCampusChange(campus: CampusOption) {
    if (controlledCampus === undefined) {
      setInternalCampus(campus);
    }

    if (controlledSection === undefined) {
      setInternalSection("All Sections");
    }

    if (onScopeChange) {
      onScopeChange(campus, "All Sections");
    } else {
      onCampusChange?.(campus);
      onSectionChange?.("All Sections");
    }
  }

  function handleSectionChange(section: SectionOption) {
    if (controlledSection === undefined) {
      setInternalSection(section);
    }

    if (onScopeChange) {
      onScopeChange(selectedCampus, section);
    } else {
      onSectionChange?.(section);
    }
  }

  return (
    <div
      className="campus-filter__scope"
      aria-label="Campus and section filters"
    >
      {showCampus && (
        <label className="campus-filter__field">
          <span className={showLabels ? "campus-filter__label" : "campus-filter__sr-only"}>
            Campus
          </span>
          <select
            name="campus"
            value={selectedCampus}
            onChange={(event) =>
              handleCampusChange(event.target.value as CampusOption)
            }
            aria-label="Campus"
          >
            {options.map((campus) => (
              <option key={campus.value} value={campus.value}>
                {campus.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {showSection && (
        <label className="campus-filter__field">
          <span className={showLabels ? "campus-filter__label" : "campus-filter__sr-only"}>
            Section
          </span>
          <select
            name="section"
            value={selectedSection}
            onChange={(event) =>
              handleSectionChange(event.target.value as SectionOption)
            }
            aria-label="School section"
            disabled={availableSections.length === 1}
          >
            {availableSections.map((section) => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
