import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import api from "../../api/axios";
import { academicsApi } from "../../api/academics.api";
import AcademicPerformance from "./AcademicPerformance";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../../api/academics.api", () => ({
  academicsApi: {
    getPerformanceDashboard: vi.fn(),
  },
}));

const currentYear = new Date().getFullYear();

const mockSchools = [
  {
    id: 1,
    name: "Kibuli Main School",
    campus: "Kibuli Main Campus",
    campus_display: "Kibuli Main Campus",
    level: "secondary",
  },
  {
    id: 2,
    name: "Buwaate School",
    campus: "Buwaate Campus",
    campus_display: "Buwaate Campus",
    level: "secondary",
  },
  {
    id: 3,
    name: "Annex Preschool",
    campus: "Annex Preschool",
    campus_display: "Annex Preschool",
    level: "nursery",
  },
];

const mockTerms = [
  {
    id: 1,
    academic_year: currentYear,
    number: 1,
    start_date: `${currentYear}-01-01`,
    end_date: `${currentYear}-04-30`,
  },
  {
    id: 2,
    academic_year: currentYear,
    number: 2,
    start_date: `${currentYear}-05-01`,
    end_date: `${currentYear}-08-31`,
  },
  {
    id: 3,
    academic_year: currentYear,
    number: 3,
    start_date: `${currentYear}-09-01`,
    end_date: `${currentYear}-12-31`,
  },
  {
    id: 4,
    academic_year: currentYear - 1,
    number: 1,
    start_date: `${currentYear - 1}-01-01`,
    end_date: `${currentYear - 1}-04-30`,
  },
  {
    id: 5,
    academic_year: currentYear - 1,
    number: 2,
    start_date: `${currentYear - 1}-05-01`,
    end_date: `${currentYear - 1}-08-31`,
  },
  {
    id: 6,
    academic_year: currentYear - 1,
    number: 3,
    start_date: `${currentYear - 1}-09-01`,
    end_date: `${currentYear - 1}-12-31`,
  },
  {
    id: 7,
    academic_year: currentYear - 2,
    number: 1,
    start_date: `${currentYear - 2}-01-01`,
    end_date: `${currentYear - 2}-04-30`,
  },
  {
    id: 8,
    academic_year: currentYear - 3,
    number: 1,
    start_date: `${currentYear - 3}-01-01`,
    end_date: `${currentYear - 3}-04-30`,
  },
  {
    id: 9,
    academic_year: currentYear - 4,
    number: 1,
    start_date: `${currentYear - 4}-01-01`,
    end_date: `${currentYear - 4}-04-30`,
  },
];

const mockDashboard = {
  term: { id: 1, label: `Term 1, ${currentYear}` },
  compared_with: null,
  summary: {
    syllabus_coverage: 85,
    topics_covered: 85,
    topics_planned: 100,
    student_performance: 78,
    students_passing: 78,
    students_assessed: 100,
    average_mark: 72.5,
    average_grade: "B",
  },
  grade_distribution: [],
  national_exams: [],
  subjects: [],
  tests: [],
};

function renderAcademicPerformance() {
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
      <AcademicPerformance />
    </QueryClientProvider>,
  );
}

describe("AcademicPerformance", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === "/academics/performance/dashboard/") {
        return { data: mockDashboard };
      }

      if (url === "/academics/assessments/") {
        return { data: [] };
      }

      if (url === "/academics/schools/") {
        return { data: mockSchools };
      }

      if (url === "/academics/terms/") {
        return { data: mockTerms };
      }

      if (url === "/academics/national-exam-results/") {
        return { data: [] };
      }

      throw new Error(`Unexpected API request: ${String(url)}`);
    });

    vi.mocked(academicsApi.getPerformanceDashboard).mockResolvedValue(
      mockDashboard as Awaited<
        ReturnType<typeof academicsApi.getPerformanceDashboard>
      >,
    );
  });

  it("renders the academic performance page", () => {
    renderAcademicPerformance();

    expect(
      screen.getByRole("main", { name: "" }),
    ).toBeInTheDocument();
  });

  it("renders all academic performance filters", () => {
    renderAcademicPerformance();

    expect(
      screen.getByRole("region", {
        name: "Academic performance filters",
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Campus")).toBeInTheDocument();
    expect(screen.getByLabelText("Section")).toBeInTheDocument();
    expect(screen.getByLabelText("Term")).toBeInTheDocument();
    expect(screen.getByLabelText("Academic Year")).toBeInTheDocument();
  });

  it("shares one live dashboard request across summary, grade, and subject charts", async () => {
    renderAcademicPerformance();

    await waitFor(() => {
      expect(
        vi.mocked(api.get).mock.calls.filter(
          ([url]) => url === "/academics/performance/dashboard/",
        ),
      ).toHaveLength(1);
    });
  });

  it("loads the campus options from the API", async () => {
    renderAcademicPerformance();

    const campusSelect = screen.getByLabelText("Campus");

    expect(
      await within(campusSelect).findByRole("option", {
        name: "Kibuli Main Campus",
      }),
    ).toBeInTheDocument();

    expect(
      within(campusSelect).getAllByRole("option"),
    ).toHaveLength(4);

    expect(api.get).toHaveBeenCalledWith(
      "/academics/schools/",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(
      vi.mocked(api.get).mock.calls.filter(
        ([url]) => url === "/academics/schools/",
      ),
    ).toHaveLength(1);
  });

  it("loads the section options", () => {
    renderAcademicPerformance();

    const sectionSelect = screen.getByLabelText("Section");

    expect(
      within(sectionSelect).getByRole("option", { name: "All Sections" }),
    ).toBeInTheDocument();

    for (const section of ["Nursery", "Primary", "Secondary"]) {
      expect(
        within(sectionSelect).getByRole("option", { name: section }),
      ).toBeInTheDocument();
    }
  });

  it("loads term options from the API", async () => {
    renderAcademicPerformance();

    const termSelect = screen.getByLabelText("Term");

    expect(
      await within(termSelect).findByRole("option", {
        name: `Term 1 · ${currentYear}`,
      }),
    ).toBeInTheDocument();

    expect(
      within(termSelect).getAllByRole("option"),
    ).toHaveLength(10);

    expect(api.get).toHaveBeenCalledWith("/academics/terms/");
  });

  it("loads academic year options from the returned terms", async () => {
    renderAcademicPerformance();

    const yearSelect = screen.getByLabelText("Academic Year");

    await waitFor(() => {
      expect(yearSelect).toBeEnabled();
      expect(within(yearSelect).getAllByRole("option")).toHaveLength(6);
    });

    for (let index = 0; index < 5; index += 1) {
      expect(
        within(yearSelect).getByRole("option", {
          name: String(currentYear - index),
        }),
      ).toBeInTheDocument();
    }
  });

  it("allows the user to change the campus", async () => {
    const user = userEvent.setup();

    renderAcademicPerformance();

    const campusSelect = screen.getByLabelText("Campus");

    await screen.findByRole("option", {
      name: "Kibuli Main Campus",
    });

    await user.selectOptions(campusSelect, "Kibuli Main Campus");

    expect(campusSelect).toHaveValue("Kibuli Main Campus");
  });

  it("allows the user to select all campuses", async () => {
    const user = userEvent.setup();

    renderAcademicPerformance();

    const campusSelect = screen.getByLabelText("Campus");

    await screen.findByRole("option", {
      name: "Kibuli Main Campus",
    });

    await user.selectOptions(campusSelect, "Kibuli Main Campus");
    await user.selectOptions(campusSelect, "");

    expect(campusSelect).toHaveValue("");
  });

  it("allows the user to change the section", async () => {
    const user = userEvent.setup();

    renderAcademicPerformance();

    const sectionSelect = screen.getByLabelText("Section");

    await user.selectOptions(sectionSelect, "primary");

    expect(sectionSelect).toHaveValue("primary");
  });

  it("allows the user to change the term", async () => {
    const user = userEvent.setup();

    renderAcademicPerformance();

    const termSelect = screen.getByLabelText("Term");

    await screen.findByRole("option", {
      name: `Term 2 · ${currentYear}`,
    });

    await user.selectOptions(termSelect, "2");

    expect(termSelect).toHaveValue("2");
  });

  it("allows the user to change the academic year", async () => {
    const user = userEvent.setup();

    renderAcademicPerformance();

    const yearSelect = screen.getByLabelText("Academic Year");
    const previousYear = String(currentYear - 1);

    await waitFor(() => expect(yearSelect).toBeEnabled());

    await user.selectOptions(yearSelect, previousYear);

    expect(yearSelect).toHaveValue(previousYear);
  });

  it("renders the academic summary region", async () => {
    renderAcademicPerformance();

    expect(
      await screen.findByRole("region", {
        name: "Academic performance summary",
      }),
    ).toBeInTheDocument();
  });

  it("renders the academic analytics section", () => {
    renderAcademicPerformance();

    expect(document.querySelector(".acad-analytics")).toBeInTheDocument();
  });

  it("renders the academic details section", () => {
    renderAcademicPerformance();

    expect(document.querySelector(".acad-details")).toBeInTheDocument();
  });

  it("keeps the academic summary visible after changing the campus", async () => {
    const user = userEvent.setup();

    renderAcademicPerformance();

    const campusSelect = screen.getByLabelText("Campus");

    await screen.findByRole("option", {
      name: "Kibuli Main Campus",
    });

    await user.selectOptions(campusSelect, "Kibuli Main Campus");

    expect(
      screen.getByRole("region", {
        name: "Academic performance summary",
      }),
    ).toBeInTheDocument();
  });
});