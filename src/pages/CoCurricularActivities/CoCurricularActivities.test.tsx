import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  academicsApi,
  type CoCurricularDashboardData,
} from "../../api/academics.api";
import api from "../../api/axios";
import { CoCurricularActivities } from "./CoCurricularActivities";
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
    total_clubs: 2,
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
  by_category: [],
  by_class: [
    {
      class_level: "Primary 5",
      stream: "East",
      active_learners: 25,
      participants: 15,
      participation_rate: 60,
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
      return { data: [] };
    }

    throw new Error(`Unexpected API endpoint: ${url}`);
  });
});

describe("CoCurricularActivities", () => {
  it("renders the three backend summary metrics and the activity table", async () => {
    render(<CoCurricularActivities />);

    expect(
      await screen.findByRole("heading", { name: "Activities & Categories" }),
    ).toBeInTheDocument();

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(3);

    expect(within(cards[0]).getByText("Total Clubs")).toBeInTheDocument();
    expect(within(cards[0]).getByText("2")).toBeInTheDocument();

    expect(
      within(cards[1]).getByText("Total Activities"),
    ).toBeInTheDocument();
    expect(within(cards[1]).getByText("2")).toBeInTheDocument();

    expect(within(cards[2]).getByText("Participation Rate")).toBeInTheDocument();
    expect(within(cards[2]).getByText("60.0%")).toBeInTheDocument();

    const activitySection = screen
      .getByRole("heading", { name: "Activities & Categories" })
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
    expect(screen.getAllByRole("table")).toHaveLength(1);
    expect(
      screen.queryByRole("heading", { name: "Participation by Class & Stream" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: "Learner Progress & Activity Achievements",
      }),
    ).not.toBeInTheDocument();
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
    await screen.findByRole("heading", { name: "Activities & Categories" });

    fireEvent.change(screen.getByRole("combobox", { name: "Campus" }), {
      target: { value: "kibuli" },
    });

    await screen.findByRole("heading", { name: "Activities & Categories" });
    expect(academicsApi.getCoCurricularDashboard).toHaveBeenLastCalledWith(
      expect.objectContaining({ campus: "kibuli" }),
      expect.any(AbortSignal),
    );
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