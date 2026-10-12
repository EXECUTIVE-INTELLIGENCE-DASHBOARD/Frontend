import { useState } from "react";
import { ChevronDown } from "lucide-react";
import "./CampusFilter.css";

export type CampusOption =
  | "All Campuses"
  | "Kibuli Main Campus"
  | "Buwaate Campus"
  | "Annex / Preschool Branch";

interface CampusFilterProps {
  onCampusChange?: (campus: CampusOption) => void;
}

const campuses: CampusOption[] = [
  "All Campuses",
  "Kibuli Main Campus",
  "Buwaate Campus",
  "Annex / Preschool Branch",
];

export function CampusFilter({
  onCampusChange,
}: CampusFilterProps) {
  const [selectedCampus, setSelectedCampus] =
    useState<CampusOption>("All Campuses");

  const [isOpen, setIsOpen] = useState(false);

  function handleSelect(campus: CampusOption) {
    setSelectedCampus(campus);
    setIsOpen(false);
    onCampusChange?.(campus);
  }

  return (
    <div className="campus-filter">
      <button
        type="button"
        className={`campus-filter__trigger ${
          isOpen ? "campus-filter__trigger--open" : ""
        }`}
        aria-label={`Campus: ${selectedCampus}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selectedCampus}</span>

        <ChevronDown
          size={15}
          strokeWidth={1.8}
          className={`campus-filter__chevron ${
            isOpen ? "campus-filter__chevron--open" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul
          className="campus-filter__options"
          role="listbox"
          aria-label="Choose campus"
        >
          {campuses.map((campus) => (
            <li
              key={campus}
              role="option"
              aria-selected={selectedCampus === campus}
            >
              <button
                type="button"
                className={`campus-filter__option ${
                  selectedCampus === campus
                    ? "campus-filter__option--selected"
                    : ""
                }`}
                onClick={() => handleSelect(campus)}
              >
                {campus}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}