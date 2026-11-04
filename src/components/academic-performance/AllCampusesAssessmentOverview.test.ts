import { describe, expect, it } from "vitest";

import type { AcademicFilterValues } from "../filters/academicFilters.types";
import { isAllCampusAndSectionSelection } from "./AllCampusesAssessmentOverview";

const allFilters: AcademicFilterValues = {
  school: "",
  campus: "",
  section: "",
  term: "23",
  year: "",
};

describe("isAllCampusAndSectionSelection", () => {
  it("matches all campuses and all sections for a selected term", () => {
    expect(isAllCampusAndSectionSelection(allFilters)).toBe(true);
    expect(
      isAllCampusAndSectionSelection({
        ...allFilters,
        school: "All Schools",
        campus: "All Campuses",
        section: "All Sections",
      }),
    ).toBe(true);
  });

  it.each([
    ["a school", { ...allFilters, school: "12" }],
    ["a campus", { ...allFilters, campus: "kibuli" }],
    ["a section", { ...allFilters, section: "primary" }],
    ["all terms", { ...allFilters, term: "" }],
  ])("does not match when %s is selected", (_label, filters) => {
    expect(isAllCampusAndSectionSelection(filters)).toBe(false);
  });
});
