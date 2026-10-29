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
        name: "Subject comparison",
      }),
    ).toBeInTheDocument();
  });

  it("renders the subject comparison visualization without a completion card", () => {
    renderAcademicDetails();

    expect(
      screen.getByRole("heading", {
        name: "Subject Comparison",
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Student Completion Rate",
      }),
    ).not.toBeInTheDocument();
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

    expect(card.querySelectorAll(".acad-details__subject-row")).toHaveLength(4);
  });

  it("visualizes average marks and pass rates for grouped subjects", async () => {
    renderAcademicDetails({
      section: "Secondary",
    });

    const card = getCard("Subject Comparison");
    expect(
      await within(card).findByRole("progressbar", {
        name: "Arts O Level Average mark",
      }),
    ).toHaveAttribute("aria-valuetext", "80.0%");
    expect(
      within(card).getByRole("progressbar", {
        name: "Arts O Level Pass rate",
      }),
    ).toHaveAttribute("aria-valuetext", "84.0%");
    expect(
      within(card).getByRole("progressbar", {
        name: "Sciences A Level Average mark",
      }),
    ).toHaveAttribute("aria-valuetext", "86.0%");
    expect(
      within(card).getByRole("progressbar", {
        name: "Sciences A Level Pass rate",
      }),
    ).toHaveAttribute("aria-valuetext", "91.0%");
    expect(
      within(card).getByText("Arts · O Level · Average mark: 80.0%"),
    ).toBeInTheDocument();
  });

  it("shows the individual Mathematics subject for Primary", async () => {
    renderAcademicDetails({
      section: "Primary",
    });

    const card = getCard("Subject Comparison");

    expect(await within(card).findByText("Mathematics")).toBeInTheDocument();

    expect(within(card).queryByText("Sciences")).not.toBeInTheDocument();
    expect(within(card).queryByText("Arts")).not.toBeInTheDocument();

    expect(card.querySelectorAll(".acad-details__subject-row")).toHaveLength(1);
  });

  it("shows only Secondary rows when Secondary is selected", async () => {
    renderAcademicDetails({
      section: "Secondary",
    });

    const card = getCard("Subject Comparison");

    await within(card).findAllByText("Sciences");

    const rows = card.querySelectorAll(".acad-details__subject-row");

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

    await screen.findByRole("progressbar", {
      name: "Arts O Level Average mark",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/academics/performance/dashboard/",
      expect.objectContaining({
        params: {
          school: 9,
          campus: "kibuli",
          level: "secondary",
          term: 1,
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
          school: 9,
          term: 1,
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

    await screen.findByText("Mathematics");

    expect(api.get).toHaveBeenCalledWith(
      "/academics/performance/dashboard/",
      expect.objectContaining({
        params: {
          term: 1,
          year: "2026",
        },
        signal: expect.any(AbortSignal),
      }),
    );
  });
});
