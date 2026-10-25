export interface AcademicFilterValues {
  school: string;
  campus: string;
  section: string;
  term: string;
  year: string;
}

export interface AcademicFiltersProps {
  values: AcademicFilterValues;
  onChange: (values: AcademicFilterValues) => void;
}