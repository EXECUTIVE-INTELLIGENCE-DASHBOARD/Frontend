import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import api from "../../api/axios";
import type { AcademicFilterValues } from "../filters/academicFilters.types";
import { AcademicAnalytics } from "./AcademicAnalytics";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const testFilters: AcademicFilterValues = {
  school: "",
  campus: "",
  section: "",
  term: "",
  year: "",
};

const mockDashboard = {
  grade_distribution: [
    {
      level: "o_level",
      level_display: "O Level",
      students: 400,
      grades: [
        { grade: "A", students: 42, share: 10.5 },
        { grade: "B", students: 86, share: 21.5 },
        { grade: "C", students: 124, share: 31 },
        { grade: "D", students: 98, share: 24.5 },
        { grade: "E", students: 38, share: 9.5 },
        { grade: "U", students: 12, share: 3 },
      ],
    },
    {
      level: "a_level",
      level_display: "A Level",
      students: 226,
      grades: [
        { grade: "A", students: 28, share: 12.4 },
        { grade: "B", students: 56, share: 24.8 },
        { grade: "C", students: 74, share: 32.7 },
        { grade: "D", students: 42, share: 18.6 },
        { grade: "E", students: 18, share: 8 },
        { grade: "O", students: 8, share: 3.5 },
      ],
    },
  ],
};

const mockSchools = [
  {
    id: 1,
    name: "Buwaate Secondary School",
    campus: "buwaate",
    campus_display: "Buwaate",
    level: "secondary",
  },
  {
    id: 2,
    name: "Kibuli Secondary School",
    campus: "kibuli",
    campus_display: "Kibuli Main",
    level: "secondary",
  },
];

const mockExamResults = [
  {
    id: 1,
    school: 1,
    exam: "ple" as const,
    year: 2025,
    division: "Division 1",
    division_display: "Division 1",
    aggregate: 8,
    passed: true,
  },
  {
    id: 2,
    school: 1,
    exam: "ple" as const,
    year: 2025,
    division: "Division 2",
    division_display: "Division 2",
    aggregate: 12,
    passed: true,
  },
  {
    id: 3,
    school: 1,
    exam: "ple" as const,
    year: 2025,
    division: "Division 3",
    division_display: "Division 3",
    aggregate: 18,
    passed: false,
  },
  {
    id: 4,
    school: 2,
    exam: "uce" as const,
    year: 2025,
    division: "Division 1",
    division_display: "Division 1",
    passed: true,
  },
  {
    id: 5,
    school: 2,
    exam: "uace" as const,
    year: 2025,
    principal_passes: 2,
    points: 15,
    passed: true,
  },
];

function mockApiResponses() {
  vi.mocked(api.get).mockImplementation((url) => {
    if (url === "/academics/performance/dashboard/") {
      return Promise.resolve({ data: mockDashboard });
    }

    if (url === "/academics/schools/") {
      return Promise.resolve({ data: mockSchools });
    }

    if (url === "/academics/national-exam-results/") {
      return Promise.resolve({ data: mockExamResults });
    }

    return Promise.reject(new Error(`Unexpected API endpoint: ${url}`));
  });
}

function renderAnalytics(filters = testFilters) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchInterval: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AcademicAnalytics filters={filters} />
    </QueryClientProvider>,
  );
}

describe("AcademicAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiResponses();
  });

  it("renders the academic analytics section", async () => {
    renderAnalytics();

    expect(
      await screen.findByRole("region", {
        name: "Academic analytics",
      }),
    ).toBeInTheDocument();
  });

  it("renders the Grade Distribution and National Examination Results cards", async () => {
    renderAnalytics();

    expect(
      await screen.findByRole("heading", {
        name: "Grade Distribution",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "National Examination Results",
      }),
    ).toBeInTheDocument();
  });

  it("renders the current card descriptions", async () => {
    renderAnalytics();

    expect(
      await screen.findByRole("heading", {
        name: "Grade Distribution",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "National Examination Results",
      }),
    ).toBeInTheDocument();
  });

  it("renders O Level and A Level grade distributions from the API", async () => {
    renderAnalytics();

    expect(
      await screen.findByRole("heading", { name: "O Level" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "A Level" }),
    ).toBeInTheDocument();

    expect(screen.getByText("400 students")).toBeInTheDocument();
    expect(screen.getByText("226 students")).toBeInTheDocument();
  });

  it("renders the grades returned by the API", async () => {
    renderAnalytics();

    await screen.findByRole("heading", { name: "Grade Distribution" });

    const oLevel = screen
      .getByRole("heading", { name: "O Level" })
      .closest(".acad-analytics__grade-level");

    const aLevel = screen
      .getByRole("heading", { name: "A Level" })
      .closest(".acad-analytics__grade-level");

    expect(oLevel).not.toBeNull();
    expect(aLevel).not.toBeNull();

    for (const grade of ["A", "B", "C", "D", "E", "U"]) {
      expect(
        within(oLevel as HTMLElement).getAllByText(grade).length,
      ).toBeGreaterThan(0);
    }

    for (const grade of ["A", "B", "C", "D", "E", "O"]) {
      expect(
        within(aLevel as HTMLElement).getAllByText(grade).length,
      ).toBeGreaterThan(0);
    }
  });

  it("renders every grade count returned by the API", async () => {
    renderAnalytics();

    await screen.findByRole("heading", { name: "Grade Distribution" });

    const gradeCounts = document.querySelectorAll(
      ".acad-analytics__grade-count",
    );

    expect(
      Array.from(gradeCounts).map((element) => element.textContent),
    ).toEqual([
      "42",
      "86",
      "124",
      "98",
      "38",
      "12",
      "28",
      "56",
      "74",
      "42",
      "18",
      "8",
    ]);
  });

  it("renders accessible grade progress bars", async () => {
    renderAnalytics();

    const gradeBar = await screen.findByRole("progressbar", {
      name: "O Level grade A",
    });

    expect(gradeBar).toHaveAttribute("aria-valuenow", "42");
    expect(gradeBar).toHaveAttribute(
      "aria-valuetext",
      "42 students, 10.5%",
    );
    expect(screen.getByText("42 students · 10.5%")).toBeInTheDocument();

    expect(
      screen.getByRole("progressbar", {
        name: "A Level grade C",
      }),
    ).toHaveAttribute("aria-valuenow", "74");
  });

  it("renders national examination summaries as pass-rate cards", async () => {
    renderAnalytics();

    const passRate = await screen.findByRole("progressbar", {
      name: "Buwaate PLE 2025 pass rate",
    });

    expect(Number(passRate.getAttribute("aria-valuenow"))).toBeCloseTo(66.67);
  });

  it("renders national examination results grouped by campus, exam, and year", async () => {
    renderAnalytics();

    await screen.findByRole("heading", {
      name: "National Examination Results",
    });

    expect(screen.getByText("Buwaate")).toBeInTheDocument();
    expect(screen.getAllByText("Kibuli Main")).toHaveLength(2);
    expect(screen.getByText("PLE · 2025")).toBeInTheDocument();
    expect(screen.getByText("UCE · 2025")).toBeInTheDocument();
    expect(screen.getByText("UACE · 2025")).toBeInTheDocument();
  });

  it("calculates candidates, passed, failed, and pass rate for each group", async () => {
    renderAnalytics();

    const result = await screen.findByRole("img", {
      name: "2 passed and 1 failed out of 3 candidates",
    });
    const resultCard = result.closest(".acad-exams__result");

    expect(resultCard).not.toBeNull();
    expect(
      within(resultCard as HTMLElement).getByText("3 candidates"),
    ).toBeInTheDocument();
    expect(
      within(resultCard as HTMLElement).getByText("2 passed"),
    ).toBeInTheDocument();
    expect(
      within(resultCard as HTMLElement).getByText("1 failed"),
    ).toBeInTheDocument();
    expect(
      within(resultCard as HTMLElement).getByText("66.7%"),
    ).toBeInTheDocument();
  });

  it("requests the dashboard using the selected campus, section, school, and term", async () => {
    renderAnalytics({
      school: "12",
      campus: "kibuli",
      section: "secondary",
      term: "7",
      year: "",
    });

    await screen.findByRole("heading", {
      name: "National Examination Results",
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/academics/performance/dashboard/",
        expect.objectContaining({
          params: {
            school: 12,
            campus: "kibuli",
            level: "secondary",
            term: 7,
          },
          signal: expect.anything(),
        }),
      );
    });
  });

  it("requests national examination results using the selected filters", async () => {
    renderAnalytics({
      school: "2",
      campus: "kibuli",
      section: "secondary",
      term: "1",
      year: "2025",
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/academics/national-exam-results/",
        expect.objectContaining({
          params: {
            school: "2",
            campus: "kibuli",
            level: "secondary",
            year: "2025",
          },
          signal: expect.anything(),
        }),
      );
    });
  });

  it("does not include a term parameter in national examination requests", async () => {
    renderAnalytics({
      ...testFilters,
      term: "2",
    });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        "/academics/national-exam-results/",
        expect.objectContaining({
          params: {},
          signal: expect.anything(),
        }),
      );
    });
  });

  it("shows a message when no grade distribution data is available", async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === "/academics/performance/dashboard/") {
        return Promise.resolve({ data: { grade_distribution: [] } });
      }

      if (url === "/academics/schools/") {
        return Promise.resolve({ data: mockSchools });
      }

      if (url === "/academics/national-exam-results/") {
        return Promise.resolve({ data: mockExamResults });
      }

      return Promise.reject(new Error(`Unexpected API endpoint: ${url}`));
    });

    renderAnalytics();

    expect(
      await screen.findByText(
        "No grade distribution data is available for these filters.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a message when no national examination results are available", async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === "/academics/performance/dashboard/") {
        return Promise.resolve({ data: mockDashboard });
      }

      if (url === "/academics/schools/") {
        return Promise.resolve({ data: mockSchools });
      }

      if (url === "/academics/national-exam-results/") {
        return Promise.resolve({ data: [] });
      }

      return Promise.reject(new Error(`Unexpected API endpoint: ${url}`));
    });

    renderAnalytics();

    expect(
      await screen.findByText(
        "No national examination results are available for the selected filters.",
      ),
    ).toBeInTheDocument();
  });

  it("shows an error when the dashboard API request fails", async () => {
    vi.mocked(api.get).mockRejectedValue(new Error("Request failed"));

    renderAnalytics();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load academic analytics. Please try again.",
    );
  });

  it("shows an error when national examination requests fail", async () => {
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === "/academics/performance/dashboard/") {
        return Promise.resolve({ data: mockDashboard });
      }

      return Promise.reject(new Error("Request failed"));
    });

    renderAnalytics();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load national examination results. Please try again.",
    );
  });
});
