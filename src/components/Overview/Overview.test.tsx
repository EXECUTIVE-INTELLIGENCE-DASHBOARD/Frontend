import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OverviewCards } from "./OverviewCards";
import { OverviewCharts } from "./OverviewCharts";
import { OverviewInsights } from "./OverviewInsights";
import type { IncidentDashboardData } from "../../pages/operations/incidentSecurity.types";

const incidentData: IncidentDashboardData = {
  start: "2025-10-28",
  end: "2026-10-27",
  summary: {
    total: 6,
    open: 2,
    closed: 4,
    overdue: 0,
    escalated: 0,
    serious_open: 0,
    duplicates_left_out: 0,
  },
  by_campus: [],
  by_category: [
    { code: "safety", label: "Safety", incidents: 4 },
    { code: "injury", label: "Injury", incidents: 2 },
  ],
  by_severity: [],
  by_source: [],
  by_month: [],
  coverage: [],
  needs_attention: [],
};

describe("Executive overview widgets", () => {
  it("renders KPI values supplied by the live overview", () => {
    render(
      <OverviewCards enrolment={2_805} attendance={94.25} staffing={98} />,
    );

    expect(screen.getByText("2,805")).toBeInTheDocument();
    expect(screen.getByText("94.3%")).toBeInTheDocument();
    expect(screen.getByText("98.0%")).toBeInTheDocument();
  });

  it("renders live budget and exclusive admissions stage values", () => {
    render(
      <OverviewCharts
        budgetRows={[
          { id: "kibuli", label: "Kibuli", spent: 1_500_000, budget: 2_000_000 },
        ]}
        admissions={{
          total: 100,
          stages: [
            { id: "applied", label: "Applied", count: 40 },
            { id: "accepted", label: "Accepted", count: 60 },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("img", { name: /actual spending compared/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Kibuli").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("img", { name: "Admissions pipeline: 100 applications" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Accepted")).toBeInTheDocument();
  });

  it("renders backend incident categories and does not invent project progress", () => {
    render(<OverviewInsights incidents={incidentData} />);

    const incidentsPanel = screen
      .getByRole("heading", { name: "Incidents & Disciplinary Cases" })
      .closest("article") as HTMLElement;
    expect(within(incidentsPanel).getByText("Safety")).toBeInTheDocument();
    expect(within(incidentsPanel).getByText("Injury")).toBeInTheDocument();
    expect(
      within(incidentsPanel).queryByText("Academic Misconduct"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Capital project progress is not available from the backend."),
    ).toBeInTheDocument();
  });

  it("shows unavailable live values instead of sample figures", () => {
    render(<OverviewCards enrolment={null} attendance={null} staffing={null} />);

    expect(screen.getAllByText("—")).toHaveLength(3);
    expect(screen.queryByText("2,800")).not.toBeInTheDocument();
    expect(screen.queryByText("94.5%")).not.toBeInTheDocument();
    expect(screen.queryByText("98%")).not.toBeInTheDocument();
  });
});
