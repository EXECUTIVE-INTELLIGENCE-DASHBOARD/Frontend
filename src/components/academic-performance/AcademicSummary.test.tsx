import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import api from "../../api/axios";
import type { AcademicFilterValues } from "../filters/academicFilters.types";
import { AcademicSummary } from "./AcademicSummary";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const testFilters: AcademicFilterValues = {
  school: "9",
  campus: "kibuli",
  section: "secondary",
  term: "1",
  year: "2026",
};

const dashboardResponse = {
  term: {
    id: 1,
    label: "Term 1, 2026",
  },
  compared_with: null,
  summary: {
    syllabus_coverage: 75,
    topics_covered: 150,
    topics_planned: 200,
    student_performance: 82,
    students_passing: 820,
    students_assessed: 1000,
    average_mark: 78.5,
    average_grade: "B+",
  },
  grade_distribution: [],
  national_exams: [],
  subjects: [],
  tests: [],
};

function renderAcademicSummary(filters: AcademicFilterValues = testFilters) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchInterval: false,
        gcTime: 0,
      },
    },
  });

  return {
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <AcademicSummary filters={filters} />
      </QueryClientProvider>,
    ),
  };
}

describe("AcademicSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.get).mockResolvedValue({
      data: dashboardResponse,
    });
  });

  it("renders the academic performance summary section", async () => {
    renderAcademicSummary();

    expect(
      screen.getByRole("region", {
        name: "Academic performance summary",
      }),
    ).toBeInTheDocument();

    expect(await screen.findByText("Syllabus Coverage")).toBeInTheDocument();
  });

  it("renders all three summary metric cards", async () => {
    renderAcademicSummary();

    const summary = screen.getByRole("region", {
      name: "Academic performance summary",
    });

    expect(
      await within(summary).findByText("Syllabus Coverage"),
    ).toBeInTheDocument();

    expect(
      within(summary).getByText("Student Performance"),
    ).toBeInTheDocument();

    expect(within(summary).getByText("Average Grade")).toBeInTheDocument();
  });

  it("renders exactly three metric cards", async () => {
    renderAcademicSummary();

    const summary = screen.getByRole("region", {
      name: "Academic performance summary",
    });

    await within(summary).findByText("Syllabus Coverage");

    expect(within(summary).getAllByRole("article")).toHaveLength(3);
  });

  it("keeps decorative icons hidden from assistive technology", async () => {
    const { container } = renderAcademicSummary();

    await screen.findByText("150 of 200 topics covered");

    await waitFor(() => {
      const icons = container.querySelectorAll(
        ".acad-metric__icon[aria-hidden='true']",
      );

      expect(icons).toHaveLength(3);
    });
  });

  it("displays the syllabus coverage returned by the dashboard API", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        ...dashboardResponse,
        summary: {
          ...dashboardResponse.summary,
          syllabus_coverage: 75,
        },
      },
    });

    renderAcademicSummary();

    expect(await screen.findByText("75.0%")).toBeInTheDocument();

    expect(screen.getByText("150 of 200 topics covered")).toBeInTheDocument();
  });

  it("displays student performance and assessment details", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        ...dashboardResponse,
        summary: {
          ...dashboardResponse.summary,
          student_performance: 82,
          students_passing: 820,
          students_assessed: 1000,
        },
      },
    });

    renderAcademicSummary();

    expect(await screen.findByText("82.0%")).toBeInTheDocument();

    expect(
      screen.getByText("820 of 1,000 students passing"),
    ).toBeInTheDocument();
  });

  it("displays the average grade and average mark returned by the API", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        ...dashboardResponse,
        summary: {
          ...dashboardResponse.summary,
          average_grade: "B+",
          average_mark: 78.5,
        },
      },
    });

    renderAcademicSummary();

    expect(await screen.findByText("B+")).toBeInTheDocument();

    expect(screen.getByText("Average mark: 78.5%")).toBeInTheDocument();
  });

  it("displays a dash when syllabus coverage is unavailable", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        ...dashboardResponse,
        summary: {
          ...dashboardResponse.summary,
          syllabus_coverage: null,
        },
      },
    });

    renderAcademicSummary();

    const summary = screen.getByRole("region", {
      name: "Academic performance summary",
    });

    // Wait until the API response has finished rendering.
    await within(summary).findByText("150 of 200 topics covered");

    await waitFor(() => {
      const syllabusCard = within(summary)
        .getByText("Syllabus Coverage")
        .closest("article");

      expect(syllabusCard).not.toBeNull();
      expect(
        within(syllabusCard as HTMLElement).getByRole("heading", {
          name: "—",
        }),
      ).toBeInTheDocument();
    });
  });
  it("displays a dash when student performance is unavailable", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        ...dashboardResponse,
        summary: {
          ...dashboardResponse.summary,
          student_performance: null,
        },
      },
    });

    renderAcademicSummary();

    const summary = screen.getByRole("region", {
      name: "Academic performance summary",
    });

    // Wait until the API response has finished rendering.
    await within(summary).findByText("150 of 200 topics covered");

    await waitFor(() => {
      const performanceCard = within(summary)
        .getByText("Student Performance")
        .closest("article");

      expect(performanceCard).not.toBeNull();
      expect(
        within(performanceCard as HTMLElement).getByRole("heading", {
          name: "—",
        }),
      ).toBeInTheDocument();
    });
  });

  it("falls back to the average mark when no average grade is available", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        ...dashboardResponse,
        summary: {
          ...dashboardResponse.summary,
          average_grade: null,
          average_mark: 76.4,
        },
      },
    });

    renderAcademicSummary();

    expect(await screen.findByText("76.4")).toBeInTheDocument();

    expect(screen.getByText("Average assessment mark (%)")).toBeInTheDocument();
  });

  it("requests the dashboard using the selected school, campus, section, and term ID", async () => {
    renderAcademicSummary();

    await screen.findByText("150 of 200 topics covered");

    expect(api.get).toHaveBeenCalledWith(
      "/academics/performance/dashboard/",
      expect.objectContaining({
        params: {
          school: 9,
          campus: "kibuli",
          level: "secondary",
          term: 1,
        },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("does not send a school ID when All Schools is selected", async () => {
    const allSchoolsFilters: AcademicFilterValues = {
      school: "",
      campus: "",
      section: "",
      term: "1",
      year: "2026",
    };

    renderAcademicSummary(allSchoolsFilters);

    await screen.findByText("150 of 200 topics covered");

    expect(api.get).toHaveBeenCalledWith(
      "/academics/performance/dashboard/",
      expect.objectContaining({
        params: {
          term: 1,
        },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("does not send the term when the selected term is a display label instead of a database ID", async () => {
    const filtersWithDisplayLabel: AcademicFilterValues = {
      ...testFilters,
      term: "Term 1",
    };

    renderAcademicSummary(filtersWithDisplayLabel);

    await screen.findByText("150 of 200 topics covered");

    expect(api.get).toHaveBeenCalledWith(
      "/academics/performance/dashboard/",
      expect.objectContaining({
        params: {
          school: 9,
          campus: "kibuli",
          level: "secondary",
        },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("shows an error message when the dashboard request fails", async () => {
    vi.mocked(api.get).mockRejectedValue({
      response: { status: 500 },
    });

    renderAcademicSummary();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });

    expect(
      await screen.findByRole("alert", {}, { timeout: 7000 }),
    ).toHaveTextContent("Unable to load academic performance (HTTP 500).");
  });
  it("shows an error message when the API response has no summary", async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        ...dashboardResponse,
        summary: undefined,
      },
    });

    renderAcademicSummary();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "The dashboard returned no summary data for these filters.",
    );
  });
});
