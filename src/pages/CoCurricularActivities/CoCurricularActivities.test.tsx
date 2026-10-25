import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  academicsApi,
  type CoCurricularDashboardData,
} from "../../api/academics.api";
import { CoCurricularActivities } from "./CoCurricularActivities";
import { buildCsv, csvFileName } from "./exportCsv";

vi.mock("../../api/academics.api", () => ({
  academicsApi: {
    getCoCurricularDashboard: vi.fn(),
  },
}));

const dashboardResponse: CoCurricularDashboardData = {
  term: { id: 1, label: "Term 1" },
  summary: {
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
      participants: 20,
    },
    {
      id: 2,
      name: "Robotics Club",
      category: "science",
      category_display: "Science",
      school: "Main School",
      participants: 10,
    },
  ],
  by_category: [],
  by_class: [],
};

const cellsOf = (row: HTMLElement) =>
  within(row)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

beforeEach(() => {
  vi.mocked(academicsApi.getCoCurricularDashboard).mockResolvedValue(
    dashboardResponse,
  );
});

describe("CoCurricularActivities", () => {
  it("renders dashboard summary and activity rows", async () => {
    render(<CoCurricularActivities />);

    expect(await screen.findByText("Debate Club")).toBeInTheDocument();

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(3);

    expect(within(cards[0]).getByText("Participation Rate")).toBeInTheDocument();
    expect(within(cards[0]).getByText("60.0%")).toBeInTheDocument();

    expect(within(cards[1]).getByText("Activities Offered")).toBeInTheDocument();
    expect(within(cards[1]).getByText("2")).toBeInTheDocument();

    expect(within(cards[2]).getByText("Unique Participants")).toBeInTheDocument();
    expect(within(cards[2]).getByText("30")).toBeInTheDocument();

    const row = screen.getByRole("row", { name: /Debate Club/ });
    expect(cellsOf(row)).toEqual([
      "Debate Club",
      "Humanities",
      "Main School",
      "20",
    ]);
    expect(screen.getAllByRole("row")).toHaveLength(3);
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
    await screen.findByText("Debate Club");

    fireEvent.change(screen.getByRole("combobox", { name: "Campus" }), {
      target: { value: "Kibuli Main Campus" },
    });

    expect(await screen.findByText("Debate Club")).toBeInTheDocument();
    expect(academicsApi.getCoCurricularDashboard).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(AbortSignal),
    );
  });

  // Enable once the page passes the selected campus to the API request.
  it.todo("sends the selected campus to the dashboard request");
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