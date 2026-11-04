import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import api from "../../api/axios";

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

interface CampusOption {
  value: string;
  label: string;
}

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

const sections = [
  { value: "nursery", label: "Nursery" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
];

function getResults<T>(data: ApiList<T>): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  return data.results ?? [];
}

function getCampusLabel(school: School): string {
  return school.campus_display?.trim() || school.campus.trim();
}

function getTermLabel(term: Term): string {
  return `Term ${term.number}`;
}

function sortYearsDescending(a: string, b: string): number {
  return b.localeCompare(a, undefined, { numeric: true });
}

export function AcademicFilters({
  values,
  onChange,
  showCampusFilter = true,
  showSchoolFilter = false,
  showAcademicYearFilter = true,
}: AcademicFiltersProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  const [loadingSchools, setLoadingSchools] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(true);

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
      } finally {
        if (active) {
          setLoadingTerms(false);
        }
      }
    }

    void loadSchools();
    void loadTerms();

    return () => {
      active = false;
    };
  }, []);

  const campuses = useMemo<CampusOption[]>(() => {
    const campusMap = new Map<string, string>();

    schools.forEach((school) => {
      const value = school.campus?.trim();

      if (!value) {
        return;
      }

      const label = getCampusLabel(school);

      if (!campusMap.has(value)) {
        campusMap.set(value, label);
      }
    });

    return Array.from(campusMap, ([value, label]) => ({
      value,
      label,
    })).sort((a, b) => a.label.localeCompare(b.label));
  }, [schools]);

  const academicYears = useMemo(() => {
    return Array.from(
      new Set(terms.map((term) => String(term.academic_year))),
    ).sort(sortYearsDescending);
  }, [terms]);

  const filteredTerms = useMemo(() => {
    return terms
      .filter(
        (term) => !values.year || String(term.academic_year) === values.year,
      )
      .sort((a, b) => {
        const yearComparison = sortYearsDescending(
          String(a.academic_year),
          String(b.academic_year),
        );

        return yearComparison || b.number - a.number;
      });
  }, [terms, values.year]);

  const selectedSchool = schools.find(
    (school) => String(school.id) === values.school,
  );
  const internationalSchool =
    Boolean(selectedSchool && isInternationalSchool(selectedSchool)) ||
    isInternationalSchool({
      name: "",
      campus: values.campus,
      campus_display: "",
    });

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

  return (
    <section
      className="academic-performance__filters"
      aria-label="Academic performance filters"
    >
      {showSchoolFilter && (
        <label className="academic-performance__filter">
          <span className="academic-performance__filter-label">School</span>

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

      {showCampusFilter && (
        <label className="academic-performance__filter">
          <span className="academic-performance__filter-label">Campus</span>

          <div className="academic-performance__select-wrapper">
            <select
              name="campus"
              aria-label="Campus"
              value={values.campus}
              onChange={(event) => updateFilter("campus", event.target.value)}
            >
              <option value="">
                {loadingSchools
                  ? "Loading campuses..."
                  : schoolsError
                    ? "All Campuses (campus list unavailable)"
                    : "All Campuses"}
              </option>

              {campuses.map((campus) => (
                <option key={campus.value} value={campus.value}>
                  {campus.label}
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

      {/* SECTION DROPDOWN */}
      <label className="academic-performance__filter">
        <span className="academic-performance__filter-label">Section</span>

        <div className="academic-performance__select-wrapper">
          <select
            name="section"
            aria-label="Section"
            value={values.section}
            disabled={internationalSchool}
            onChange={(event) => updateFilter("section", event.target.value)}
          >
            <option value="">All Sections</option>

            {sections.map((section) => (
              <option key={section.value} value={section.value}>
                {section.label}
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

      {/* TERM DROPDOWN */}
      <label className="academic-performance__filter">
        <span className="academic-performance__filter-label">Term</span>

        <div className="academic-performance__select-wrapper">
          <select
            name="term"
            aria-label="Term"
            value={values.term}
            disabled={loadingTerms || termsError}
            onChange={(event) => updateFilter("term", event.target.value)}
          >
            <option value="">
              {loadingTerms ? "Loading terms..." : "All Terms"}
            </option>

            {filteredTerms.map((term) => (
              <option key={term.id} value={String(term.id)}>
                {getTermLabel(term)} · {term.academic_year}
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
          <span className="academic-performance__filter-label">
            Academic Year
          </span>

          <div className="academic-performance__select-wrapper">
            <select
              name="year"
              aria-label="Academic Year"
              value={values.year}
              disabled={loadingTerms || termsError}
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
      {schoolsError && (
        <p className="academic-performance__filter-message" role="alert">
          Could not load campuses. Check your connection and try again.
        </p>
      )}

      {termsError && (
        <p className="academic-performance__filter-message" role="alert">
          Could not load terms and academic years. Check your connection
          and try again.
        </p>
      )}

      {!loadingSchools && !schoolsError && campuses.length === 0 && (
        <p className="academic-performance__filter-message" role="status">
          No campuses were returned by the backend.
        </p>
      )}
    </section>
  );
}
