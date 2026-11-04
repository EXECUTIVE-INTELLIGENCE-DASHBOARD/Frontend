import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  academicsApi,
  type CoCurricularDashboardData,
} from "../../api/academics.api";
import api from "../../api/axios";
import { CoCurricularActivities } from "./CoCurricularActivities";
import { categoryAxisLines } from "./EngagementBreakdowns";
import { buildCsv, csvFileName } from "./exportCsv";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../../api/academics.api", () => ({
  academicsApi: {
    getCoCurricularDashboard: vi.fn(),
  },
}));

const dashboardResponse: CoCurricularDashboardData = {
  term: { id: 1, label: "Term 1" },
  summary: {
    total_clubs: 3,
    events_held: 6,
    activities_offered: 2,
    participation_records: 40,
    unique_participants: 30,
    active_learners: 50,
    participation_rate: 60,
    activities_per_participant: 1.3,
  },
  activities: [
    {
      id: 1,
      name: "Debate Club",
      category: "humanities",
      category_display: "Humanities",
      school: "Main School",
      girls: 12,
      boys: 8,
      participants: 20,
    },
    {
      id: 2,
      name: "Robotics Club",
      category: "science",
      category_display: "Science",
      school: "Main School",
      girls: 4,
      boys: 6,
      participants: 10,
    },
  ],
  by_category: [
    { category: "humanities", label: "Humanities", participants: 20, records: 24 },
    { category: "science", label: "Science", participants: 10, records: 16 },
    {
      category: "performing-arts",
      label: "Performing and visual arts",
      participants: 8,
      records: 10,
    },
  ],
  by_class: [
    {
      class_level: "Primary 5",
      stream: "East",
      active_learners: 25,
      participants: 15,
      participation_rate: 60,
    },
    {
      class_level: "S3",
      stream: "North",
      active_learners: 20,
      participants: 12,
      participation_rate: 60,
    },
    {
      class_level: "Baby Class",
      stream: "A",
      active_learners: 18,
      participants: 10,
      participation_rate: 55.6,
    },
    {
      class_level: "Middle",
      stream: "A",
      active_learners: 16,
      participants: 8,
      participation_rate: 50,
    },
    {
      class_level: "Top",
      stream: "A",
      active_learners: 15,
      participants: 9,
      participation_rate: 60,
    },
    {
      class_level: "P7",
      stream: "West",
      active_learners: 22,
      participants: 14,
      participation_rate: 63.6,
    },
    {
      class_level: "S1",
      stream: "South",
      active_learners: 24,
      participants: 16,
      participation_rate: 66.7,
    },
  ],
};

const cellsOf = (row: HTMLElement) =>
  within(row)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

beforeEach(() => {
  vi.mocked(academicsApi.getCoCurricularDashboard).mockResolvedValue(
    dashboardResponse,
  );
  vi.mocked(api.get).mockImplementation(async (url) => {
    if (url === "/academics/schools/") {
      return {
        data: [
          {
            id: 1,
            name: "Kibuli Secondary School",
            campus: "kibuli",
            campus_display: "Kibuli Main Campus",
            level: "secondary",
          },
        ],
      };
    }

    if (url === "/academics/terms/") {
      return {
        data: [
          {
            id: 7,
            academic_year: "2026",
            number: 1,
            start_date: "2026-01-01",
            end_date: "2026-04-30",
          },
        ],
      };
    }

    throw new Error(`Unexpected API endpoint: ${url}`);
  });
});

describe("CoCurricularActivities", () => {
  it("renders four headline metrics, compact breakdowns, and activity table", async () => {
    render(<CoCurricularActivities />);

    expect(
      await screen.findByRole("heading", { name: "Activities" }),
    ).toBeInTheDocument();

    const summary = screen.getByRole("region", {
      name: "Co-curricular summary",
    });
    const cards = within(summary).getAllByRole("article");
    expect(cards).toHaveLength(4);

    expect(within(cards[0]).getByText("Total Clubs")).toBeInTheDocument();
    expect(within(cards[0]).getByText("3")).toBeInTheDocument();

    expect(within(cards[1]).getByText("Total Activities")).toBeInTheDocument();
    expect(within(cards[1]).getByText("2")).toBeInTheDocument();

    expect(within(cards[2]).getByText("Total Events Held")).toBeInTheDocument();
    expect(within(cards[2]).getByText("6")).toBeInTheDocument();
    expect(within(cards[3]).getByText("Participation Rate")).toBeInTheDocument();
    expect(within(cards[3]).getByText("60.0%")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Participation by Category" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Participation by Class & Stream",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Participation records")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Participation by category bar chart"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Activity" })).not.toBeInTheDocument();

    const activitySection = screen
      .getByRole("heading", { name: "Activities" })
      .closest("section") as HTMLElement;
    const row = within(activitySection).getByRole("row", { name: /Debate Club/ });
    expect(cellsOf(row)).toEqual([
      "Debate Club",
      "Humanities",
      "12",
      "8",
      "20",
    ]);
    expect(
      cellsOf(within(activitySection).getByRole("row", { name: /Robotics Club/ })),
    ).toEqual(["Robotics Club", "Science", "4", "6", "10"]);
    expect(
      within(activitySection).queryByRole("columnheader", { name: "School" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("table")).toHaveLength(2);
    expect(
      screen.getAllByRole("table")[0].querySelector("tbody tr")?.textContent,
    ).toContain("Debate Club");

    const classSection = screen
      .getByRole("heading", { name: "Participation by Class & Stream" })
      .closest("section") as HTMLElement;
    const classTable = within(classSection).getByRole("table") as HTMLTableElement;
    const classBody = within(classTable.tBodies[0]).getAllByRole("row");
    expect(
      within(classTable).getByRole("columnheader", { name: "Active learners" }),
    ).toBeInTheDocument();
    expect(
      within(classTable).getByRole("columnheader", { name: "Participation rate" }),
    ).toBeInTheDocument();
    expect(
      within(classTable).queryByRole("columnheader", { name: "Participants" }),
    ).not.toBeInTheDocument();
    expect(classBody.map((row) => row.textContent?.trim())).toEqual([
      "Primary",
      "Baby ClassA1855.6%",
      "MiddleA1650.0%",
      "TopA1560.0%",
      "Primary 5East2560.0%",
      "P7West2263.6%",
      "Secondary / GIS",
      "S1South2466.7%",
      "S3North2060.0%",
    ]);
  });

  it("explains when the dashboard has no activity records", async () => {
    vi.mocked(academicsApi.getCoCurricularDashboard).mockResolvedValue({
      ...dashboardResponse,
      activities: [],
    });

    render(<CoCurricularActivities />);

    expect(
      await screen.findByText("No activity data is available."),
    ).toBeInTheDocument();
  });

  it("keeps the dashboard loaded when a campus is selected", async () => {
    render(<CoCurricularActivities />);
    await screen.findByRole("heading", { name: "Activities" });

    fireEvent.change(screen.getByRole("combobox", { name: "Campus" }), {
      target: { value: "Kibuli Main Campus" },
    });

    await screen.findByRole("heading", { name: "Activities" });
    expect(academicsApi.getCoCurricularDashboard).toHaveBeenLastCalledWith(
      expect.objectContaining({ campus: "kibuli" }),
      expect.any(AbortSignal),
    );
  });

  it("refreshes class and stream rows from the selected filter response", async () => {
    const filteredResponse: CoCurricularDashboardData = {
      ...dashboardResponse,
      by_class: [
        {
          class_level: "P1",
          stream: "",
          active_learners: 151,
          participants: 0,
          participation_rate: 0,
        },
      ],
    };

    vi.mocked(academicsApi.getCoCurricularDashboard).mockImplementation(
      async (filters) =>
        filters?.campus ? filteredResponse : dashboardResponse,
    );

    render(<CoCurricularActivities />);
    await screen.findByRole("heading", { name: "Activities" });
    expect(screen.getByText("Baby Class")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Campus" }), {
      target: { value: "Kibuli Main Campus" },
    });

    const unassignedStream = await screen.findByText("Unassigned");
    const filteredRow = unassignedStream.closest("tr");
    expect(filteredRow?.textContent).toBe("P1Unassigned1510.0%");
  });

  it("keeps the shared academic filters and sends supported filters", async () => {
    render(<CoCurricularActivities />);
    await screen.findByRole("heading", { name: "Activities" });
    await screen.findByRole("option", { name: "Kibuli Main" });
    await screen.findByRole("option", { name: "Term 1" });
    expect(screen.getByRole("combobox", { name: "Academic Year" })).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "School" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Campus" }), {
      target: { value: "Kibuli Main Campus" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "School section" }), {
      target: { value: "Secondary" },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Term" }), {
      target: { value: "7" },
    });

    await waitFor(() => {
      expect(academicsApi.getCoCurricularDashboard).toHaveBeenLastCalledWith(
        { campus: "kibuli", level: "secondary", term: 7 },
        expect.any(AbortSignal),
      );
    });
    expect(
      vi.mocked(academicsApi.getCoCurricularDashboard).mock.calls[
        vi.mocked(academicsApi.getCoCurricularDashboard).mock.calls.length - 1
        ]?.[0],
    ).not.toHaveProperty("academic_year");
  });

});

describe("categoryAxisLines", () => {
  it("wraps Performing and visual arts across two lines", () => {
    expect(categoryAxisLines("Performing and visual arts")).toEqual([
      "Performing and",
      "visual arts",
    ]);
  });
});

describe("buildCsv", () => {
  it("writes a header and one line per activity", () => {
    const lines = buildCsv(dashboardResponse.activities).split("\r\n");

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("Activity,Category,School,Participants");
    expect(lines[1]).toBe("Debate Club,Humanities,Main School,20");
  });

  it("quotes activity names that contain commas or quotes", () => {
    const [row] = dashboardResponse.activities;

    const csv = buildCsv([{ ...row, name: 'Debate, "Open"' }]);

    expect(csv).toContain('"Debate, ""Open"""');
  });

  it("builds a file name from the campus", () => {
    expect(csvFileName("Annex / Preschool Branch")).toBe(
      "co-curricular-engagement-annex-preschool-branch.csv",
    );
  });
});