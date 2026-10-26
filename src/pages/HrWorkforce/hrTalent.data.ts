
import type { EmployerFilter } from "./hrTalent.types";

/** The Workforce page opens on the schools' view. */
export const defaultEmployer: EmployerFilter = "schools";

export const employerOptions: Array<{
  value: EmployerFilter;
  label: string;
}> = [
  { value: "all", label: "All Employment" },
  { value: "schools", label: "Greenhill Schools" },
  { value: "gsl", label: "GSL – Services & Head Office" },
];

export const employerLabel = (value: EmployerFilter): string =>
  employerOptions.find((option) => option.value === value)?.label ??
  "All Employment";
