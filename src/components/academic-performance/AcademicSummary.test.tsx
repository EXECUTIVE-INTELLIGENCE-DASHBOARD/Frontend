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

interface DashboardSummaryMock {
  syllabus_coverage: number | null;
  topics_covered: number;
  topics_planned: number;
  student_performance: number | null;
  students_passing: number;
  students_assessed: number;
  average_mark: number | null;
  average_grade: string | null;
}

interface DashboardResponseMock {
  term: {
    id: number;
    label: string;
  } | null;
  compared_with: {
    id: number;
    label: string;
  } | null;
  summary: DashboardSummaryMock | undefined;
  grade_distribution: unknown[];
  national_exams: unknown[];
  subjects: unknown[];
  tests: unknown[];
}

const dashboardResponse: DashboardResponseMock = {
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

const assessmentsResponse = [
  {
    id: 1,
    kind: "test_1",
    term: 1,
    school: 9,
    class_level: "secondary",
  },
  {
    id: 2,
    kind: "test_2",
    term: 1,
    school: 9,
    class_level: "secondary",
  },
  {
    id: 3,
    kind: "end_of_term",
    term: 1,
    school: 9,
    class_level: "secondary",
  },
  {
    id: 4,
    kind: "test_1",
    term: 1,
    school: 9,
    class_level: "secondary",
  },
];

let currentDashboardResponse: DashboardResponseMock = dashboardResponse;
let currentAssessmentsResponse = assessmentsResponse;

function mockApiResponses() {
  vi.mocked(api.get).mockImplementation(async (url) => {
    if (url === "/academics/assessments/") {
      return {
        data: currentAssessmentsResponse,
      } as never;
    }

    return {
      data: currentDashboardResponse,
    } as never;
  });
}

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

async function waitForSummary() {
  await screen.findByText("Assessments Recorded");
  await screen.findByRole("heading", { name: "B+" });
}

describe("AcademicSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    currentDashboardResponse = dashboardResponse;
    currentAssessmentsResponse = assessmentsResponse;

    mockApiResponses();
  });

  it("renders the academic performance summary section", async () => {
    renderAcademicSummary();

    expect(
      screen.getByRole("region", {
        name: "Academic performance summary",
      }),
    ).toBeInTheDocument();

    await waitForSummary();
  });

  it("renders all three summary metric cards", async () => {
    renderAcademicSummary();

    const summary = screen.getByRole("region", {
      name: "Academic performance summary",
    });

    expect(
      await within(summary).findByText("Assessments Recorded"),
    ).toBeInTheDocument();

    expect(
      within(summary).getByText("Student Performance"),
    ).toBeInTheDocument();

    expect(within(summary).getByText("Average Grade")).toBeInTheDocument();
  });

  it("renders exactly three metric cards", async () => {
    renderAcademicSummary();

    await waitForSummary();

    const summary = screen.getByRole("region", {
      name: "Academic performance summary",
    });

    expect(within(summary).getAllByRole("article")).toHaveLength(3);
  });

  it("displays the assessment count returned by the assessments API", async () => {
    renderAcademicSummary();

    const summary = screen.getByRole("region", {
      name: "Academic performance summary",
    });

    await within(summary).findByText("Assessments Recorded");

    expect(
      await within(summary).findByRole("heading", {
        name: "4",
      }),
    ).toBeInTheDocument();
  });

  it("does not display description text under the Assessments Recorded value", async () => {
    renderAcademicSummary();

    await waitForSummary();

    const summary = screen.getByRole("region", {
      name: "Academic performance summary",
    });

    const assessmentCard = within(summary)
      .getByText("Assessments Recorded")
      .closest("article");

    expect(assessmentCard).not.toBeNull();

    expect(
      assessmentCard?.querySelector(".acad-metric__detail"),
    ).toBeEmptyDOMElement();
  });

  it("shows zero when the assessments API returns an empty list", async () => {
    currentAssessmentsResponse = [];

    renderAcademicSummary();

    await waitForSummary();

    const summary = screen.getByRole("region", {
      name: "Academic performance summary",
    });

    const assessmentCard = within(summary)
      .getByText("Assessments Recorded")
      .closest("article");

    expect(assessmentCard).not.toBeNull();

    expect(
      within(assessmentCard as HTMLElement).getByRole("heading", {
        name: "0",
      }),
    ).toBeInTheDocument();
  });

  it("keeps decorative icons hidden from assistive technology", async () => {
    const { container } = renderAcademicSummary();

    await waitForSummary();

    await waitFor(() => {
      expect(
        container.querySelectorAll(".acad-metric__icon[aria-hidden='true']"),
      ).toHaveLength(3);
    });
  });

  it("displays student performance and assessment details", async () => {
    currentDashboardResponse = {
      ...dashboardResponse,
      summary: {
        ...dashboardResponse.summary!,
        student_performance: 82,
        students_passing: 820,
        students_assessed: 1000,
      },
    };

    renderAcademicSummary();

    await waitForSummary();

    expect(
      await screen.findByRole("heading", { name: "82.0%" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("820 of 1,000 students passing"),
    ).toBeInTheDocument();
  });

  it("displays the average grade and average mark returned by the API", async () => {
    renderAcademicSummary();

    await waitForSummary();

    expect(screen.getByText("Average mark: 78.5%")).toBeInTheDocument();
  });

  it("displays a dash when student performance is unavailable", async () => {
    currentDashboardResponse = {
      ...dashboardResponse,
      summary: {
        ...dashboardResponse.summary!,
        student_performance: null,
      },
    };

    renderAcademicSummary();

    await screen.findByRole("heading", { name: "B+" });

    const summary = screen.getByRole("region", {
      name: "Academic performance summary",
    });

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

  it("falls back to the average mark when no average grade is available", async () => {
    currentDashboardResponse = {
      ...dashboardResponse,
      summary: {
        ...dashboardResponse.summary!,
        average_grade: null,
        average_mark: 76.4,
      },
    };

    renderAcademicSummary();

    expect(
      await screen.findByRole("heading", { name: "76.4" }),
    ).toBeInTheDocument();

    expect(screen.getByText("Average assessment mark (%)")).toBeInTheDocument();
  });

  it("requests the dashboard using the selected school, campus, section, and term ID", async () => {
    renderAcademicSummary();

    await waitForSummary();

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

  it("requests assessments using the selected filters", async () => {
    renderAcademicSummary();

    await waitForSummary();

    expect(api.get).toHaveBeenCalledWith(
      "/academics/assessments/",
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

    await waitForSummary();

    expect(api.get).toHaveBeenCalledWith(
      "/academics/performance/dashboard/",
      expect.objectContaining({
        params: {
          term: 1,
        },
        signal: expect.any(AbortSignal),
      }),
    );

    expect(api.get).toHaveBeenCalledWith(
      "/academics/assessments/",
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

    await waitForSummary();

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
      response: {
        status: 500,
      },
    });

    renderAcademicSummary();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load academic performance (HTTP 500).",
    );
  });

  it("shows an error message when the API response has no summary", async () => {
    currentDashboardResponse = {
      ...dashboardResponse,
      summary: undefined,
    };

    renderAcademicSummary();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The dashboard returned no summary data for these filters.",
    );
  });
});