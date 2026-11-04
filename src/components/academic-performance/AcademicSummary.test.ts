import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import { AcademicSummary, getLearnersAssessed, shouldShowExternalExams } from "./AcademicSummary";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderSummary(filters: {
  school: string;
  campus: string;
  section: string;
  term: string;
  year: string;
}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(AcademicSummary, { filters }),
    ),
  );
}

const terms = [
  { id: 8, number: 3, academic_year: "2026" },
  { id: 7, number: 2, academic_year: "2026" },
];

const learnerTrend = {
  current_academic_year: "2026",
  previous_academic_year: "2025",
  years: [
    {
      academic_year: "2026",
      total_learners_assessed: 571,
      terms: [
        { term: { id: 7, label: "Term 2, 2026" }, learners_assessed: 271 },
        { term: { id: 8, label: "Term 3, 2026" }, learners_assessed: 300 },
      ],
    },
    {
      academic_year: "2025",
      total_learners_assessed: 400,
      terms: [
        { term: { id: 5, label: "Term 3, 2025" }, learners_assessed: 250 },
      ],
    },
  ],
};

describe("getLearnersAssessed", () => {
  it("uses the selected term count from its academic-year bucket", () => {
    expect(getLearnersAssessed(learnerTrend, terms, "8", "2026")).toBe(300);
  });

  it("uses the backend year total when no term is selected", () => {
    expect(getLearnersAssessed(learnerTrend, terms, "", "2025")).toBe(400);
  });

  it("does not substitute counts from a different year", () => {
    expect(getLearnersAssessed(learnerTrend, terms, "", "2024")).toBeNull();
  });
});

describe("AcademicSummary backend metrics", () => {
  it("loads internal marks and learner counts with the selected filters", async () => {
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === "/academics/terms/") return { data: terms };
      if (url === "/academics/performance/internal/") {
        return {
          data: {
            term: { id: 8, label: "Term 3, 2026" },
            schools: [
              {
                school_id: 8,
                school: "GreenHill Academy Primary Kibuli",
                average_mark: 62.9,
                pass_rate: 79.3,
                previous_average_mark: 60.3,
                previous_pass_rate: 75.6,
                average_mark_change: 2.6,
                pass_rate_change: 3.7,
              },
            ],
          },
        };
      }
      if (url === "/academics/performance/learners-trend/") {
        return { data: learnerTrend };
      }
      throw new Error(`Unexpected API endpoint: ${url}`);
    });

    renderSummary({
      school: "8",
      campus: "kibuli",
      section: "primary",
      term: "8",
      year: "2026",
    });

    expect(await screen.findByText("62.9%")).toBeInTheDocument();
    expect(screen.getByText("79.3%")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/academics/performance/internal/",
        expect.objectContaining({
          params: {
            school: 8,
            campus: "kibuli",
            level: "primary",
            term: 8,
          },
        }),
      );
      expect(api.get).toHaveBeenCalledWith(
        "/academics/performance/learners-trend/",
        expect.objectContaining({
          params: { school: 8, campus: "kibuli", level: "primary" },
        }),
      );
    });
  });
});

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
