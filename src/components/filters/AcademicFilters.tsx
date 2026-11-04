import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import api from "../../api/axios";
import {
  CampusFilter,
  type CampusOption,
  type SectionOption,
} from "./CampusFilter";

import type {
  AcademicFilterValues,
  AcademicFiltersProps,
} from "./academicFilters.types";

import "./AcademicFilters.css";

interface School {
  id: number;
  name: string;
  campus: string;
  campus_display?: string;
  level: string;
}

interface Term {
  id: number;
  academic_year: string | number;
  number: number;
  start_date: string;
  end_date: string;
}

interface PaginatedResponse<T> {
  results: T[];
}

type ApiList<T> = T[] | PaginatedResponse<T>;

export function isInternationalSchool(school: Pick<School, "name" | "campus" | "campus_display">): boolean {
  const identity = [
    school.name,
    school.campus,
    school.campus_display,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    identity.includes("international") ||
    identity.includes("gis") ||
    identity.includes("kansanga")
  );
}

function getResults<T>(data: ApiList<T>): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  return data.results ?? [];
}

function campusOptionForValue(value: string): CampusOption {
  const campus = value.trim().toLowerCase();

  if (
    campus.includes("international") ||
    campus.includes("gis") ||
    campus.includes("kansanga") ||
    campus.includes("annex")
  ) {
    return "Annex / Preschool Branch";
  }
  if (campus.includes("buwaate")) {
    return "Buwaate Campus";
  }
  if (campus.includes("kibuli")) {
    return "Kibuli Main Campus";
  }
  return "All Campuses";
}

function campusValueForOption(campus: CampusOption): string {
  const values: Record<CampusOption, string> = {
    "All Campuses": "",
    "Kibuli Main Campus": "kibuli",
    "Buwaate Campus": "buwaate",
    "Annex / Preschool Branch": "gis_kansanga",
  };
  return values[campus];
}

function sectionOptionForValue(value: string): SectionOption {
  const section = value.trim().toLowerCase();

  if (section === "nursery") return "Nursery";
  if (section === "primary") return "Primary";
  if (section === "secondary") return "Secondary";
  return "All Sections";
}

function sortYearsDescending(a: string, b: string): number {
  return b.localeCompare(a, undefined, { numeric: true });
}

export function getAcademicYears(
  terms: Term[],
  currentYear = new Date().getFullYear(),
): string[] {
  const years = new Set<string>();

  for (let year = 2020; year <= currentYear; year += 1) {
    years.add(String(year));
  }

  terms.forEach((term) => {
    const year = String(term.academic_year);
    if (/^\d{4}$/.test(year) && Number(year) >= 2020) {
      years.add(year);
    }
  });

  return Array.from(years).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
}

export function sortAcademicTerms(terms: Term[]): Term[] {
  return terms
    .filter((term) => Number(term.academic_year) >= 2020)
    .sort((a, b) => {
      const yearComparison = sortYearsDescending(
        String(a.academic_year),
        String(b.academic_year),
      );

      return yearComparison || a.number - b.number;
    });
}

export function getAcademicTermOptions(
  terms: Term[],
  selectedYear: string,
  currentYear = new Date().getFullYear(),
): Array<{ value: string; number: number }> {
  const validTerms = sortAcademicTerms(terms);
  const targetYear =
    selectedYear ||
    (validTerms.some((term) => Number(term.academic_year) === currentYear)
      ? String(currentYear)
      : String(
          Math.max(
            currentYear,
            ...validTerms.map((term) => Number(term.academic_year)),
          ),
        ));
  const termsByNumber = new Map(
    validTerms
      .filter((term) => String(term.academic_year) === targetYear)
      .map((term) => [term.number, term]),
  );

  return [1, 2, 3].map((number) => ({
    value: String(termsByNumber.get(number)?.id ?? `term-number-${number}`),
    number,
  }));
}

export function AcademicFilters({
  values,
  onChange,
  showCampusFilter = true,
  showSectionFilter = true,
  showSchoolFilter = false,
  showAcademicYearFilter = true,
  showFilterLabels = false,
}: AcademicFiltersProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  const [loadingSchools, setLoadingSchools] = useState(true);
  const [schoolsError, setSchoolsError] = useState(false);
  const [termsError, setTermsError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSchools() {
      try {
        const response = await api.get<ApiList<School>>("/academics/schools/");

        if (active) {
          setSchools(getResults(response.data));
          setSchoolsError(false);
        }
      } catch (error) {
        console.error("Failed to load academic campuses:", error);

        if (active) {
          setSchoolsError(true);
        }
      } finally {
        if (active) {
          setLoadingSchools(false);
        }
      }
    }

    async function loadTerms() {
      try {
        const response = await api.get<ApiList<Term>>("/academics/terms/");

        if (active) {
          setTerms(getResults(response.data));
          setTermsError(false);
        }
      } catch (error) {
        console.error("Failed to load academic terms:", error);

        if (active) {
          setTermsError(true);
        }
      }
    }

    void loadSchools();
    void loadTerms();

    return () => {
      active = false;
    };
  }, []);

  const academicYears = useMemo(() => {
    return getAcademicYears(terms);
  }, [terms]);

  const termOptions = useMemo(
    () => getAcademicTermOptions(terms, values.year),
    [terms, values.year],
  );
  const hasUnavailableTermOptions = termOptions.some(
    (term) => !/^\d+$/.test(term.value),
  );

  const filterLabelClass = showFilterLabels
    ? "academic-performance__filter-label"
    : "academic-performance__filter-label academic-performance__filter-label--sr-only";

  function updateFilter(field: keyof AcademicFilterValues, value: string) {
    const updatedFilters: AcademicFilterValues = {
      ...values,
      [field]: value,
    };

    if (field === "year") {
      updatedFilters.term = "";
    }

    if (field === "campus" || field === "section") {
      updatedFilters.school = "";
    }

    if (field === "campus") {
      updatedFilters.section = isInternationalSchool({
        name: "",
        campus: value,
        campus_display: "",
      })
        ? ""
        : updatedFilters.section;
    }

    if (field === "school" && value) {
      const school = schools.find(
        (school) => String(school.id) === value,
      );

      if (school) {
        updatedFilters.campus = school.campus;
        updatedFilters.section = isInternationalSchool(school)
          ? ""
          : school.level;
      }
    }

    if (field === "school" && !value) {
      updatedFilters.campus = "";
      updatedFilters.section = "";
    }

    onChange(updatedFilters);
  }

  function updateCampusAndSection(
    campus: CampusOption,
    section: SectionOption,
  ) {
    onChange({
      ...values,
      school: "",
      campus: campusValueForOption(campus),
      section: section === "All Sections" ? "" : section.toLowerCase(),
    });
  }

  return (
    <section
      className="academic-performance__filters"
      aria-label="Academic performance filters"
    >
      {showSchoolFilter && (
        <label className="academic-performance__filter">
          <span className={filterLabelClass}>School</span>

          <div className="academic-performance__select-wrapper">
            <select
              name="school"
              aria-label="School"
              value={values.school}
              disabled={loadingSchools || schoolsError}
              onChange={(event) => updateFilter("school", event.target.value)}
            >
              <option value="">
                {loadingSchools ? "Loading schools..." : "All Schools"}
              </option>

              {schools.map((school) => (
                <option key={school.id} value={String(school.id)}>
                  {school.name}
                </option>
              ))}
            </select>

            <ChevronDown
              className="academic-performance__select-icon"
              size={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
        </label>
      )}

      {(showCampusFilter || showSectionFilter) && (
        <CampusFilter
          selectedCampus={campusOptionForValue(values.campus)}
          selectedSection={sectionOptionForValue(values.section)}
          onScopeChange={updateCampusAndSection}
          showCampus={showCampusFilter}
          showSection={showSectionFilter}
          showLabels={showFilterLabels}
          campusOptions={[
            {
              value: "All Campuses",
              label: "All Campuses",
              sections: ["All Sections", "Nursery", "Primary", "Secondary"],
            },
            { value: "Kibuli Main Campus", label: "Kibuli Main" },
            { value: "Buwaate Campus", label: "Buwaate" },
            {
              value: "Annex / Preschool Branch",
              label: "Greenhill International (GIS)",
              sections: ["All Sections"],
            },
          ]}
        />
      )}

      {/* TERM DROPDOWN */}
      <label className="academic-performance__filter">
        <span className={filterLabelClass}>Term</span>

        <div className="academic-performance__select-wrapper">
          <select
            name="term"
            aria-label="Term"
            value={values.term}
            onChange={(event) => updateFilter("term", event.target.value)}
          >
            <option value="">All Terms</option>

            {termOptions.map((term) => (
              <option key={term.number} value={term.value}>
                Term {term.number}
              </option>
            ))}
          </select>

          <ChevronDown
            className="academic-performance__select-icon"
            size={18}
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
      </label>

      {/* ACADEMIC YEAR DROPDOWN */}
      {showAcademicYearFilter && (
        <label className="academic-performance__filter">
          <span className={filterLabelClass}>
            Academic Year
          </span>

          <div className="academic-performance__select-wrapper">
            <select
              name="year"
              aria-label="Academic Year"
              value={values.year}
              onChange={(event) => updateFilter("year", event.target.value)}
            >
              <option value="">All Years</option>

              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <ChevronDown
              className="academic-performance__select-icon"
              size={18}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
        </label>
      )}

      {/* ERROR AND EMPTY STATES */}
      {showSchoolFilter && schoolsError && (
        <p className="academic-performance__filter-message" role="alert">
          Could not load school options. Check your connection and try again.
        </p>
      )}

      {termsError && (
        <p className="academic-performance__filter-message" role="alert">
          Could not load term data. Term 1-3 are shown, but cannot filter results
          until term data is available.
        </p>
      )}

      {!termsError && hasUnavailableTermOptions && (
        <p className="academic-performance__filter-message" role="status">
          Term 1-3 are shown, but term filtering is unavailable for this year
          because no matching term records were returned.
        </p>
      )}

    </section>
  );
}
