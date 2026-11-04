import { describe, expect, it } from "vitest";

import { shouldShowExternalExams } from "./AcademicSummary";

describe("shouldShowExternalExams", () => {
  const allSchoolsAndSections = {
    school: "",
    campus: "",
    section: "",
  };
  const terms = [
    { id: 21, number: 1, academic_year: 2025 },
    { id: 22, number: 2, academic_year: 2025 },
    { id: 23, number: 3, academic_year: 2025 },
  ];

  it("hides external examinations for Terms 1 and 2", () => {
    expect(shouldShowExternalExams("21", terms, allSchoolsAndSections)).toBe(false);
    expect(shouldShowExternalExams("22", terms, allSchoolsAndSections)).toBe(false);
  });

  it("shows external examinations for Term 3 with all schools, campuses, and sections", () => {
    expect(shouldShowExternalExams("23", terms, allSchoolsAndSections)).toBe(true);
  });

  it("recognizes explicit All selections as the all-campus view", () => {
    expect(
      shouldShowExternalExams("23", terms, {
        school: "All Schools",
        campus: "All Campuses",
        section: "All Sections",
      }),
    ).toBe(true);
  });

  it.each([
    ["a school", { ...allSchoolsAndSections, school: "gis" }],
    ["a campus", { ...allSchoolsAndSections, campus: "kibuli" }],
    ["a section", { ...allSchoolsAndSections, section: "primary" }],
  ])("hides external examinations when filtering to %s", (_label, filters) => {
    expect(shouldShowExternalExams("23", terms, filters)).toBe(false);
  });

  it("hides the examination history when no term is selected", () => {
    expect(shouldShowExternalExams("", terms, allSchoolsAndSections)).toBe(false);
  });

  it("hides the examination history for an unknown term", () => {
    expect(shouldShowExternalExams("99", terms, allSchoolsAndSections)).toBe(false);
  });
});
