import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getIncidentDashboard } from "./incidentSecurity.api";
import type { IncidentDashboardData } from "./incidentSecurity.types";
import { defaultDateRange, IncidentSecurity } from "./IncidentSecurity";

vi.mock("./incidentSecurity.api", () => ({
  getIncidentDashboard: vi.fn(),
}));

const dashboard: IncidentDashboardData = {
  start: "2025-10-01",
  end: "2026-09-30",
  summary: {
    total: 12,
    open: 5,
    closed: 7,
    overdue: 2,
    escalated: 1,
    serious_open: 3,
    duplicates_left_out: 0,
  },
  by_campus: [
    { code: "kibuli", label: "Kibuli", incidents: 12 },
    { code: "buwaate", label: "Buwaate Campus", incidents: 0 },
    { code: "gis", label: "Greenhill International (GIS)", incidents: 0 },
  ],
  by_category: [
    { code: "safety", label: "Safety", incidents: 12 },
    { code: "injury", label: "Injury or accident", incidents: 0 },
  ],
  by_severity: [{ code: "high", label: "High", incidents: 5 }],
  by_source: [{ code: "staff", label: "Staff", incidents: 12 }],
  by_month: [{ month: "2026-09", incidents: 2 }],
  coverage: [
    {
      campus: "kibuli",
      label: "Kibuli Main Campus",
      months_with_records: 1,
      months_without_records: [],
    },
  ],
  needs_attention: [
    {
      id: 1,
      reference: "INC-001",
      campus: "gis",
      category: "injury",
      severity: "high",
      status: "open",
      owner: "Campus team",
      follow_up_action: "Review entrance access",
      follow_up_due: "2026-09-30",
      overdue: true,
      escalated_to: null,
      reasons: ["overdue", "serious"],
    },
  ],
};

const mockGetIncidentDashboard = vi.mocked(getIncidentDashboard);

describe("IncidentSecurity", () => {
  beforeEach(() => {
    mockGetIncidentDashboard.mockReset();
    mockGetIncidentDashboard.mockResolvedValue(dashboard);
  });

  it("shows incident metrics and attention data from the dashboard API", async () => {
    render(<IncidentSecurity />);

    expect(await screen.findByText("Incidents Recorded")).toBeInTheDocument();
    expect(
      within(screen.getByLabelText("Incident summary")).getByText("12"),
    ).toBeInTheDocument();
    expect(screen.getByText("Serious Open")).toBeInTheDocument();
    const attentionTable = screen.getByRole("table", {
      name: "Open incidents requiring follow-up",
    });
    expect(
      within(attentionTable).getByText("Greenhill International (GIS)"),
    ).toBeInTheDocument();
    expect(
      within(attentionTable).getByText("Injury or accident"),
    ).toBeInTheDocument();
    expect(screen.queryByText("kibuli")).not.toBeInTheDocument();
    expect(screen.queryByText("injury")).not.toBeInTheDocument();
    expect(screen.queryByText("High / Critical Open")).not.toBeInTheDocument();
    expect(screen.queryByText("5 total open incidents")).not.toBeInTheDocument();
    expect(screen.queryByText("2025-10-01 to 2026-09-30")).not.toBeInTheDocument();
    expect(screen.queryByText(/escalated incidents/)).not.toBeInTheDocument();
    expect(screen.getByText("INC-001")).toBeInTheDocument();
    expect(screen.queryByText(/incidents · .*months with records/)).not.toBeInTheDocument();
    expect(screen.queryByText("Review entrance access")).not.toBeInTheDocument();
    expect(screen.queryByText(/Duplicate entries excluded from totals:/)).not.toBeInTheDocument();
    expect(screen.getByText("Incident Type & Source Analysis")).toBeInTheDocument();
    expect(screen.getByText("Incidents by Type")).toBeInTheDocument();
    expect(screen.getByText("Incidents by Source")).toBeInTheDocument();
    expect(screen.queryByText("At risk")).not.toBeInTheDocument();
    expect(attentionTable).toBeInTheDocument();
    expect(screen.getByLabelText("Incidents by source pie chart")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Reference" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Follow-up / due" })).not.toBeInTheDocument();
    expect(screen.getByText("Incidents Against Period")).toBeInTheDocument();
    expect(screen.getByLabelText("Incident filters")).toHaveClass(
      "incident-security-filters",
    );
    expect(screen.getByText("Date Range").parentElement).toHaveClass(
      "academic-performance__filter",
    );
    expect(screen.getByLabelText("Start date").closest(".incident-security-date-range"))
      .toBe(screen.getByLabelText("End date").closest(".incident-security-date-range"));
  });

  it("defaults to the same inclusive 365-day window as the backend", () => {
    expect(defaultDateRange(new Date(2026, 9, 27, 12))).toEqual({
      start: "2025-10-28",
      end: "2026-10-27",
    });
  });

  it("sends campus and date filters to the dashboard endpoint", async () => {
    render(<IncidentSecurity />);
    await screen.findByText("Incidents Recorded");

    fireEvent.change(screen.getByRole("combobox", { name: "Campus" }), {
      target: { value: "buwaate" },
    });

    await waitFor(() => {
      const filteredCalls = mockGetIncidentDashboard.mock.calls.filter(
        ([params]) => params?.campus === "buwaate",
      );
      expect(filteredCalls).toHaveLength(1);
      expect(filteredCalls[0][0]).toEqual(
        expect.objectContaining({
          campus: "buwaate",
          start: expect.any(String),
          end: expect.any(String),
        }),
      );
    });
  });

  it("sends incident type and date range filters to the backend", async () => {
    render(<IncidentSecurity />);
    await screen.findByText("Incidents Recorded");

    fireEvent.change(screen.getByRole("combobox", { name: "Incident type" }), {
      target: { value: "safety" },
    });
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2026-01-01" },
    });

    await waitFor(() => {
      expect(
        mockGetIncidentDashboard.mock.calls.some(
          ([params]) =>
            params?.category === "safety" &&
            params.start === "2026-01-01" &&
            typeof params.end === "string",
        ),
      ).toBe(true);
    });
  });

  it("renders zero incident totals without extra coverage messaging", async () => {
    mockGetIncidentDashboard.mockResolvedValue({
      ...dashboard,
      summary: {
        total: 0,
        open: 0,
        closed: 0,
        overdue: 0,
        escalated: 0,
        serious_open: 0,
        duplicates_left_out: 0,
      },
      by_campus: [
        { code: "kibuli", label: "Kibuli Main Campus", incidents: 0 },
      ],
      by_category: [{ code: "safety", label: "Safety", incidents: 0 }],
      by_severity: [{ code: "high", label: "High", incidents: 0 }],
      by_source: [{ code: "staff", label: "Staff", incidents: 0 }],
      by_month: [],
      coverage: [
        {
          campus: "kibuli",
          label: "Kibuli Main Campus",
          months_with_records: 0,
          months_without_records: ["2026-09"],
        },
      ],
      needs_attention: [],
    });

    render(<IncidentSecurity />);

    expect(await screen.findByText("Incidents Recorded")).toBeInTheDocument();
    expect(
      within(screen.getByLabelText("Incident summary")).getAllByText("0"),
    ).toHaveLength(3);
    expect(
      screen.queryByText(/source coverage is unknown/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/reporting coverage is unknown/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Normal")).not.toBeInTheDocument();
  });
});
