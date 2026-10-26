import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import api from "../../api/axios";
import type { AcademicFilterValues } from "../filters/academicFilters.types";
import { AcademicDetails } from "./AcademicDetails";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const currentYear = new Date().getFullYear();

const dashboardResponse = {
  subjects: [
    {
      id: 1,
      subject: "Mathematics",
      level: "primary",
      level_display: "Primary",
      average_mark: 88,
      pass_rate: 92,
      previous_pass_rate: 85,
    },
    {
      id: 2,
      subject: "Physics",
      level: "o_level",
      level_display: "O Level",
      category: "science",
      average_mark: 88,
      pass_rate: 92,
      previous_pass_rate: 85,
    },
    {
      id: 3,
      subject: "Chemistry",
      level: "o_level",
      level_display: "O Level",
      category: "science",
      average_mark: 80,
      pass_rate: 86,
      previous_pass_rate: 82,
    },
    {
      id: 4,
      subject: "History",
      level: "o_level",
      level_display: "O Level",
      category: "arts",
      average_mark: 76,
      pass_rate: 80,
      previous_pass_rate: 75,
    },
    {
      id: 5,
      subject: "English",
      level: "o_level",
      level_display: "O Level",
      category: "arts",
      average_mark: 84,
      pass_rate: 88,
      previous_pass_rate: 81,
    },
    {
      id: 6,
      subject: "Biology",
      level: "a_level",
      level_display: "A Level",
      category: "science",
      average_mark: 90,
      pass_rate: 94,
      previous_pass_rate: 89,
    },
    {
      id: 7,
      subject: "Chemistry",
      level: "a_level",
      level_display: "A Level",
      category: "science",
      average_mark: 82,
      pass_rate: 88,
      previous_pass_rate: 80,
    },
    {
      id: 8,
      subject: "Literature",
      level: "a_level",
      level_display: "A Level",
      category: "arts",
      average_mark: 78,
      pass_rate: 84,
      previous_pass_rate: 79,
    },
    {
      id: 9,
      subject: "History",
      level: "a_level",
      level_display: "A Level",
      category: "arts",
      average_mark: 86,
      pass_rate: 90,
      previous_pass_rate: 83,
    },
  ],
  completion: [
    {
      level: "o_level",
      level_display: "O Level",
      campus: "kibuli",
      campus_display: "Kibuli Main Campus",
      completed: 398,
      completion_rate: 94.8,
    },
    {
      level: "a_level",
      level_display: "A Level",
      campus: "kibuli",
      campus_display: "Kibuli Main Campus",
      completed: 214,
      completion_rate: 92.5,
    },
  ],
};

let currentDashboardResponse: unknown = dashboardResponse;

function renderAcademicDetails(filters: Partial<AcademicFilterValues> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchInterval: false,
        refetchOnWindowFocus: false,
        gcTime: 0,
      },
    },
  });

  const completeFilters: AcademicFilterValues = {
    school: "",
    campus: "",
    section: "",
    term: "",
    year: String(currentYear),
    ...filters,
  };

  return render(
    <QueryClientProvider client={queryClient}>
      <AcademicDetails filters={completeFilters} />
    </QueryClientProvider>,
  );
}

function getCard(headingName: string): HTMLElement {
  const heading = screen.getByRole("heading", {
    name: headingName,
  });

  const card = heading.closest("article");

  if (!card) {
    throw new Error(`Could not find card: ${headingName}`);
  }

  return card;
}

describe("AcademicDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentDashboardResponse = dashboardResponse;

    vi.mocked(api.get).mockImplementation(
      async () =>
        ({
          data: currentDashboardResponse,
        }) as never,
    );
  });

  it("renders the academic details region", () => {
    renderAcademicDetails();

    expect(
      screen.getByRole("region", {
        name: "Subject comparison and student completion rate",
      }),
    ).toBeInTheDocument();
  });

  it("renders the Subject Comparison and Student Completion Rate cards", () => {
    renderAcademicDetails();

    expect(
      screen.getByRole("heading", {
        name: "Subject Comparison",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Student Completion Rate",
      }),
    ).toBeInTheDocument();
  });

  it("renders the expected subject comparison table headings", async () => {
    renderAcademicDetails();

    const card = getCard("Subject Comparison");

    expect(
      await within(card).findByRole("columnheader", {
        name: "Subject / Category",
      }),
    ).toBeInTheDocument();

    expect(
      within(card).getByRole("columnheader", {
        name: "Level",
      }),
    ).toBeInTheDocument();

    expect(
      within(card).getByRole("columnheader", {
        name: "Average mark",
      }),
    ).toBeInTheDocument();

    expect(
      within(card).getByRole("columnheader", {
        name: "Pass rate",
      }),
    ).toBeInTheDocument();
  });

  it("groups Secondary subjects by level and category", async () => {
    renderAcademicDetails({
      section: "Secondary",
    });

    const card = getCard("Subject Comparison");

    expect(await within(card).findAllByText("Sciences")).toHaveLength(2);

    expect(within(card).getAllByText("Arts")).toHaveLength(2);
    expect(within(card).getAllByText("O Level")).toHaveLength(2);
    expect(within(card).getAllByText("A Level")).toHaveLength(2);

    expect(card.querySelectorAll("tbody tr")).toHaveLength(4);
  });

  it("calculates average marks and pass rates for grouped subjects", async () => {
    renderAcademicDetails({
      section: "Secondary",
    });

    const card = getCard("Subject Comparison");

    const table = await within(card).findByRole("table");

    const rows = Array.from(
      table.querySelectorAll<HTMLTableRowElement>("tbody tr"),
    );

    function expectRow(
      category: string,
      level: string,
      averageMark: string,
      passRate: string,
    ) {
      const row = rows.find(
        (candidate) =>
          candidate.cells[0]?.textContent?.trim() === category &&
          candidate.cells[1]?.textContent?.trim() === level,
      );

      expect(row).toBeDefined();

      if (!row) {
        throw new Error(`Missing ${category} row for ${level}`);
      }

      expect(row.cells[2]?.textContent?.trim()).toBe(averageMark);
      expect(row.cells[3]?.textContent?.trim()).toBe(passRate);
    }

    expectRow("Arts", "O Level", "80.0%", "84.0%");
    expectRow("Sciences", "O Level", "84.0%", "89.0%");
    expectRow("Arts", "A Level", "82.0%", "87.0%");
    expectRow("Sciences", "A Level", "86.0%", "91.0%");
  });

  it("shows the individual Mathematics subject for Primary", async () => {
    renderAcademicDetails({
      section: "Primary",
    });

    const card = getCard("Subject Comparison");

    expect(await within(card).findByText("Mathematics")).toBeInTheDocument();

    expect(within(card).queryByText("Sciences")).not.toBeInTheDocument();
    expect(within(card).queryByText("Arts")).not.toBeInTheDocument();

    expect(card.querySelectorAll("tbody tr")).toHaveLength(1);
  });

  it("shows only Secondary rows when Secondary is selected", async () => {
    renderAcademicDetails({
      section: "Secondary",
    });

    const card = getCard("Subject Comparison");

    await within(card).findAllByText("Sciences");

    const rows = card.querySelectorAll("tbody tr");

    expect(rows).toHaveLength(4);

    rows.forEach((row) => {
      expect(row.textContent).toMatch(/O Level|A Level/);
      expect(row.textContent).not.toContain("Mathematics");
    });
  });

  it("shows a message when no subject performance data is available", async () => {
    currentDashboardResponse = {
      subjects: [],
      completion: dashboardResponse.completion,
    };

    renderAcademicDetails();

    expect(
      await screen.findByText(
        "No subject performance data is available for the selected filters.",
      ),
    ).toBeInTheDocument();
  });

  it("renders completion rates, completed counts, and campus names", async () => {
    renderAcademicDetails();

    const card = getCard("Student Completion Rate");

    expect(await within(card).findByText("O Level")).toBeInTheDocument();

    expect(within(card).getByText("A Level")).toBeInTheDocument();
    expect(within(card).getByText("94.8%")).toBeInTheDocument();
    expect(within(card).getByText("92.5%")).toBeInTheDocument();

    expect(
      within(card).getByText("398 completed students"),
    ).toBeInTheDocument();

    expect(
      within(card).getByText("214 completed students"),
    ).toBeInTheDocument();

    expect(within(card).getAllByText("Kibuli Main Campus")).toHaveLength(2);
  });

  it("supports alternative completion field names from the API", async () => {
    currentDashboardResponse = {
      subjects: [],
      student_completion: [
        {
          level: "o_level",
          completed_students: 350,
          completion_percentage: 87.5,
        },
      ],
    };

    renderAcademicDetails();

    const card = getCard("Student Completion Rate");

    expect(await within(card).findByText("O Level")).toBeInTheDocument();

    expect(within(card).getByText("87.5%")).toBeInTheDocument();

    expect(
      within(card).getByText("350 completed students"),
    ).toBeInTheDocument();
  });

  it("shows a message when the API returns no completion records", async () => {
    currentDashboardResponse = {
      subjects: dashboardResponse.subjects,
      completion: [],
      student_completion: [],
      completion_rates: [],
    };

    renderAcademicDetails();

    expect(
      await screen.findByText(
        "No student-completion records were returned by the dashboard API.",
      ),
    ).toBeInTheDocument();
  });

  it("handles a missing completion rate", async () => {
    currentDashboardResponse = {
      subjects: [],
      completion: [
        {
          level: "o_level",
          completed: 120,
        },
      ],
    };

    renderAcademicDetails();

    const card = getCard("Student Completion Rate");

    expect(await within(card).findByText("O Level")).toBeInTheDocument();

    expect(within(card).getByText("—")).toBeInTheDocument();

    expect(
      within(card).getByText("120 completed students"),
    ).toBeInTheDocument();
  });

  it("shows the error message when the dashboard request fails", async () => {
    vi.mocked(api.get).mockRejectedValue({
      response: {
        status: 500,
      },
    });

    renderAcademicDetails();

    const card = getCard("Subject Comparison");

    expect(await within(card).findByRole("alert")).toHaveTextContent(
      "Unable to load data (HTTP 500).",
    );
  });

  it("requests the dashboard using the selected filters", async () => {
    renderAcademicDetails({
      school: "9",
      campus: "kibuli",
      section: "Secondary",
      term: "1",
      year: "2026",
    });

    await screen.findAllByText("398 completed students");

    expect(api.get).toHaveBeenCalledWith(
      "/academics/performance/dashboard/",
      expect.objectContaining({
        params: {
          school: "9",
          campus: "kibuli",
          term: "1",
          year: "2026",
        },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("sends the primary level when Primary is selected", async () => {
    renderAcademicDetails({
      school: "9",
      section: "Primary",
      term: "1",
    });

    await screen.findByText("Mathematics");

    expect(api.get).toHaveBeenCalledWith(
      "/academics/performance/dashboard/",
      expect.objectContaining({
        params: {
          school: "9",
          term: "1",
          year: String(currentYear),
          level: "primary",
        },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("omits school and campus when all schools and campuses are selected", async () => {
    renderAcademicDetails({
      school: "All Schools",
      campus: "All Campuses",
      section: "",
      term: "1",
      year: "2026",
    });

    await screen.findAllByText("398 completed students");

    expect(api.get).toHaveBeenCalledWith(
      "/academics/performance/dashboard/",
      expect.objectContaining({
        params: {
          term: "1",
          year: "2026",
        },
        signal: expect.any(AbortSignal),
      }),
    );
  });
});
