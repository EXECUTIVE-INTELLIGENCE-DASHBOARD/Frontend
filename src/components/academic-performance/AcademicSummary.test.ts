import { describe, expect, it } from "vitest";

import { shouldShowExternalExams } from "./AcademicSummary";

describe("shouldShowExternalExams", () => {
  const terms = [
    { id: 21, number: 1, academic_year: 2025 },
    { id: 22, number: 2, academic_year: 2025 },
    { id: 23, number: 3, academic_year: 2025 },
  ];

  it("hides external examinations for Terms 1 and 2", () => {
    expect(shouldShowExternalExams("21", terms)).toBe(false);
    expect(shouldShowExternalExams("22", terms)).toBe(false);
  });

  it("shows external examinations for Term 3", () => {
    expect(shouldShowExternalExams("23", terms)).toBe(true);
  });

  it("shows the examination history when no term is selected", () => {
    expect(shouldShowExternalExams("", terms)).toBe(true);
  });
});
