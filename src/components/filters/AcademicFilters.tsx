import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

const sections = [
  { value: "nursery", label: "Nursery" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
];

const SCHOOL_LIST_REFRESH_INTERVAL = 30_000;

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
  showSchoolFilter = false,
  showAcademicYearFilter = true,
}: AcademicFiltersProps) {
  const [terms, setTerms] = useState<Term[]>([]);

  const [loadingTerms, setLoadingTerms] = useState(true);

  const [termsError, setTermsError] = useState(false);
  const schoolsQuery = useQuery({
    queryKey: ["academic-national-exam-schools"],
    queryFn: async ({ signal }) => {
      const response = await api.get<ApiList<School>>("/academics/schools/", {
        signal,
      });

      return getResults(response.data);
    },
    refetchInterval: SCHOOL_LIST_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
    retry: false,
  });
  const schools = schoolsQuery.data ?? [];
  const loadingSchools = schoolsQuery.isPending;
  const schoolsError = schoolsQuery.isError;

  useEffect(() => {
    let active = true;

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

  const filteredSchools = useMemo(
    () =>
      schools.filter(
        (school) =>
          (!values.campus || school.campus === values.campus) &&
          (!values.section || school.level === values.section),
      ),
    [schools, values.campus, values.section],
  );

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

    onChange(updatedFilters);
  }

  return (
    <section
      className="academic-performance__filters"
      aria-label="Academic performance filters"
    >
      {/* CAMPUS DROPDOWN */}
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

      {/* SECTION DROPDOWN */}
      <label className="academic-performance__filter">
        <span className="academic-performance__filter-label">Section</span>

        <div className="academic-performance__select-wrapper">
          <select
            name="section"
            aria-label="Section"
            value={values.section}
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

              {filteredSchools.map((school) => (
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
