import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getHrEmployees, getHrWorkforceDashboard } from "./hrWorkforce.api";
import { HrWorkforce } from "./HrWorkforce";

vi.mock("./hrWorkforce.api", () => ({
  getHrWorkforceDashboard: vi.fn(),
  getHrEmployees: vi.fn(),
}));

const openTab = (name: string) => {
  fireEvent.click(screen.getByRole("tab", { name }));
};

const chooseEmployer = (value: string) => {
  fireEvent.change(screen.getByLabelText("Employer"), {
    target: { value },
  });
};

const schoolUnit = {
  id: 1,
  name: "Academic & Curriculum Instruction",
  staff_category: "teaching",
  staff_category_display: "Teaching staff",
  campus: "kibuli",
  location: "Kibuli Main Campus",
  headcount: 10,
  attendance_rate: 95,
  absences: {
    absent: 0,
    on_leave: 1,
    on_training: 0,
    on_field: 0,
  },
};

const mockDashboard = () => {
  vi.mocked(getHrWorkforceDashboard).mockResolvedValue({
    start: "2026-10-01",
    end: "2026-10-31",
    summary: {
      total_staff: 10,
      teaching_staff: 8,
      non_teaching_staff: 2,
      staffing_ratio: 10,
      staffing_ratio_display: "1:10",
      workforce_attendance_rate: 95,
    },
    units: [schoolUnit],
  });
};

describe("HrWorkforce tabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboard();
    vi.mocked(getHrEmployees).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("opens on the Workforce tab with the three tabs available", async () => {
    render(<HrWorkforce />);

    expect(
      screen
        .getByRole("tab", { name: "Workforce" })
        .getAttribute("aria-selected"),
    ).toBe("true");

    expect(screen.getByRole("tab", { name: "Establishment" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Talent" })).toBeTruthy();

    expect(
      await screen.findByRole("cell", {
        name: "Academic & Curriculum Instruction",
      }),
    ).toBeTruthy();

    expect(screen.queryByText("GSL Head Office")).toBeNull();
  });

  it("shows an unavailable-data message for the GSL employer", () => {
    render(<HrWorkforce />);

    chooseEmployer("gsl");

    expect(
      screen.getByText(/GSL-specific workforce records are not available/i),
    ).toBeTruthy();

    expect(screen.queryByText("GSL Head Office")).toBeNull();
    expect(screen.queryByText("Café")).toBeNull();
    expect(screen.queryByText("Academic & Curriculum Instruction")).toBeNull();
  });
  it("shows school workforce data and an unavailable GSL message for all employment", async () => {
    render(<HrWorkforce />);

    chooseEmployer("all");

    expect(
      await screen.findByRole("cell", {
        name: "Academic & Curriculum Instruction",
      }),
    ).toBeTruthy();

    expect(
      screen.getByText(/GSL-specific workforce records are not available/i),
    ).toBeTruthy();

    expect(screen.queryByText("GSL Head Office")).toBeNull();
  });
  it("shows an empty state when the employee API returns no records", async () => {
    render(<HrWorkforce />);

    openTab("Establishment");

    expect(await screen.findByText("Employee Records")).toBeTruthy();

    expect(
      await screen.findByText("No employee records were returned by the API."),
    ).toBeTruthy();
  });

  it("switches between exits, contracts and ratings without fabricated records", async () => {
    render(<HrWorkforce />);

    openTab("Talent");

    expect(await screen.findByText("Staff Exits & Turnover")).toBeTruthy();

    expect(
      screen.getByText(
        /Individual staff exit dates, exit reasons, and turnover figures cannot be retrieved/i,
      ),
    ).toBeTruthy();

    openTab("Contracts");

    expect(screen.getByText("Contract End Dates & Renewals")).toBeTruthy();

    expect(
      screen.getByText(
        /Contract end dates and renewal statuses are not available/i,
      ),
    ).toBeTruthy();

    expect(screen.queryByText("Dr. Peter Ssemakula")).toBeNull();

    openTab("Ratings");

    expect(screen.getByText("Staff Performance Ratings")).toBeTruthy();

    expect(
      screen.getByText(
        /Employee performance ratings and review dates are not available/i,
      ),
    ).toBeTruthy();

    expect(screen.queryByText("Needs improvement")).toBeNull();
  });

  it("shows the unavailable exits message when all employment is chosen", async () => {
    render(<HrWorkforce />);

    openTab("Talent");
    chooseEmployer("all");

    expect(await screen.findByText("Staff Exits & Turnover")).toBeTruthy();

    expect(
      screen.getByText(
        /Individual staff exit dates, exit reasons, and turnover figures cannot be retrieved/i,
      ),
    ).toBeTruthy();
  });
  it("shows an empty state when there are no establishment rows to export", async () => {
    render(<HrWorkforce />);

    openTab("Establishment");

    expect(await screen.findByText("Employee Records")).toBeTruthy();

    expect(
      await screen.findByText("No employee records were returned by the API."),
    ).toBeTruthy();

    expect(screen.queryByRole("button", { name: /Export Report/i })).toBeNull();
  });
});
