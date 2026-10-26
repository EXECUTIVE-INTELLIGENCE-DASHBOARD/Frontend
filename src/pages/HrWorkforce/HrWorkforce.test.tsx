import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HrWorkforce } from "./HrWorkforce";
import { getHrWorkforceDashboard } from "./hrWorkforce.api";
import type { HrWorkforceDashboard } from "./hrWorkforce.api";
import {
  absenceLabel,
  allCampusesLabel,
  campuses,
  departments,
  rowsFor,
  summaryFor,
} from "./hrWorkforce.data";

vi.mock("./hrWorkforce.api", () => ({
  getHrWorkforceDashboard: vi.fn(),
}));

const dashboardResponse: HrWorkforceDashboard = {
  start: "2026-10-01",
  end: "2026-10-26",
  summary: {
    total_staff: 10,
    teaching_staff: 8,
    non_teaching_staff: 2,
    staffing_ratio: 10,
    staffing_ratio_display: "1:10",
    workforce_attendance_rate: 95,
  },
  units: [
    {
      id: 1,
      name: "Academic & Curriculum Instruction",
      staff_category: "teaching",
      staff_category_display: "Teaching Staff",
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
    },
  ],
};

const buwaateDashboard: HrWorkforceDashboard = {
  start: "2026-10-01",
  end: "2026-10-26",
  summary: {
    total_staff: 4,
    teaching_staff: 3,
    non_teaching_staff: 1,
    staffing_ratio: 5,
    staffing_ratio_display: "1:5",
    workforce_attendance_rate: 90,
  },
  units: [
    {
      id: 2,
      name: "Buwaate Teaching Unit",
      staff_category: "teaching",
      staff_category_display: "Teaching Staff",
      campus: "buwaate",
      location: "Buwaate Campus",
      headcount: 4,
      attendance_rate: 90,
      absences: {
        absent: 1,
        on_leave: 0,
        on_training: 0,
        on_field: 0,
      },
    },
  ],
};

const chooseCampus = (from: string, to: string) => {
  const campusSelect = screen.getByRole("combobox", {
    name: "Campus",
  });

  expect(campusSelect).toHaveValue(from);

  fireEvent.change(campusSelect, {
    target: { value: to },
  });
};

const getMetricValue = (label: string) => {
  const metricLabel = screen.getByText(label);
  const metricCard = metricLabel.closest(".hw-metric");

  if (!metricCard) {
    throw new Error(`Could not find the metric card for "${label}".`);
  }

  const metricValue = metricCard.querySelector(".hw-metric__value");

  if (!metricValue) {
    throw new Error(`Could not find the value for "${label}".`);
  }

  return metricValue;
};

describe("HrWorkforce", () => {
  beforeEach(() => {
    vi.mocked(getHrWorkforceDashboard).mockImplementation(
      async (filters = {}) => {
        if (filters.campus === "buwaate") {
          return buwaateDashboard;
        }

        if (filters.campus === "annex") {
          return {
            ...dashboardResponse,
            summary: {
              ...dashboardResponse.summary,
              total_staff: 0,
              teaching_staff: 0,
              non_teaching_staff: 0,
              staffing_ratio: null,
              staffing_ratio_display: null,
              workforce_attendance_rate: null,
            },
            units: [],
          };
        }

        return dashboardResponse;
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the reporting period and displays the campus filter", async () => {
    render(<HrWorkforce />);

    expect(
      await screen.findByText("01 Oct 2026 – 26 Oct 2026"),
    ).toBeInTheDocument();

    expect(screen.getByRole("combobox", { name: "Campus" })).toHaveValue(
      "All Campuses",
    );

    expect(getHrWorkforceDashboard).toHaveBeenCalled();
  });

  it("renders the headline metrics from the API response", async () => {
    render(<HrWorkforce />);

    expect(await screen.findByText("Total Staff")).toBeInTheDocument();

    expect(getMetricValue("Total Staff")).toHaveTextContent("10");
    expect(getMetricValue("Staffing Ratio")).toHaveTextContent("1:10");
    expect(getMetricValue("Workforce Attendance")).toHaveTextContent("95.0%");
  });

  it("renders workforce units returned by the API", async () => {
    render(<HrWorkforce />);

    const table = await screen.findByRole("table");

    expect(
      await within(table).findByText("Academic & Curriculum Instruction"),
    ).toBeInTheDocument();

    expect(within(table).getByText("Teaching Staff")).toBeInTheDocument();

    expect(within(table).getByText("Kibuli Main Campus")).toBeInTheDocument();

    expect(
      within(table).getByText("10", { selector: "strong" }),
    ).toBeInTheDocument();

    expect(within(table).getByText("Staff")).toBeInTheDocument();
  });

  it("requests new dashboard data when the campus changes", async () => {
    render(<HrWorkforce />);

    await waitFor(() => {
      expect(
        within(screen.getByRole("table")).getByText(
          "Academic & Curriculum Instruction",
        ),
      ).toBeInTheDocument();
    });

    chooseCampus("All Campuses", "Buwaate Campus");

    await waitFor(() => {
      expect(getHrWorkforceDashboard).toHaveBeenLastCalledWith({
        campus: "buwaate",
      });
    });

    await waitFor(() => {
      expect(
        within(screen.getByRole("table")).getByText("Buwaate Teaching Unit"),
      ).toBeInTheDocument();
    });

    expect(getMetricValue("Staffing Ratio")).toHaveTextContent("1:5");
    expect(getMetricValue("Workforce Attendance")).toHaveTextContent("90.0%");
  });

  it("passes no campus filter when all campuses are selected", async () => {
    render(<HrWorkforce />);

    await waitFor(() => {
      expect(getHrWorkforceDashboard).toHaveBeenCalledWith({
        campus: undefined,
      });
    });

    expect(
      await within(screen.getByRole("table")).findByText(
        "Academic & Curriculum Instruction",
      ),
    ).toBeInTheDocument();
  });

  it("shows a retry option when the API request fails", async () => {
    vi.mocked(getHrWorkforceDashboard)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(dashboardResponse);

    render(<HrWorkforce />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load workforce data.",
    );

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(getHrWorkforceDashboard).toHaveBeenCalledTimes(2);
    });

    const table = await screen.findByRole("table");

    expect(
      await within(table).findByText("Academic & Curriculum Instruction"),
    ).toBeInTheDocument();
  });
  it("shows a dash when the API returns null attendance and staffing ratio", async () => {
    vi.mocked(getHrWorkforceDashboard).mockResolvedValue({
      ...dashboardResponse,
      summary: {
        ...dashboardResponse.summary,
        staffing_ratio: null,
        staffing_ratio_display: null,
        workforce_attendance_rate: null,
      },
    });

    render(<HrWorkforce />);

    expect(await screen.findByText("Total Staff")).toBeInTheDocument();

    expect(getMetricValue("Staffing Ratio")).toHaveTextContent("—");
    expect(getMetricValue("Workforce Attendance")).toHaveTextContent("—");
  });

  it("exports the workforce report", async () => {
    const createObjectURL = vi.fn(() => "blob:test-url");
    const revokeObjectURL = vi.fn();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectURL,
    });

    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: revokeObjectURL,
    });

    render(<HrWorkforce />);

    const table = await screen.findByRole("table");

    expect(
      within(table).getByText("Academic & Curriculum Instruction"),
    ).toBeInTheDocument();
    // Export the report.
    fireEvent.click(screen.getByRole("button", { name: /Export Report/i }));

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
  });
});

describe("hr workforce legacy data helpers", () => {
  it("matches the reference for all campuses", () => {
    const rows = rowsFor(allCampusesLabel);

    expect(rows.map((row) => row.headcount)).toEqual([205, 95, 45, 80, 60]);
    expect(rows.map((row) => row.absent)).toEqual([4, 3, 1, 7, 3]);

    expect(rows.map(absenceLabel)).toEqual([
      "4 on Leave",
      "3 on Leave",
      "1 on Training",
      "7 on Leave/Field",
      "3 on Leave",
    ]);

    expect(summaryFor(allCampusesLabel)).toEqual({
      totalStaff: 485,
      ratio: "1:1.4",
      attendance: 96.4,
    });
  });

  it("adds the campuses up to the all-campuses figures", () => {
    const all = rowsFor(allCampusesLabel);
    const perCampus = campuses.map((campus) => rowsFor(campus.label));

    all.forEach((row) => {
      const parts = perCampus.flatMap((rows) =>
        rows.filter((part) => part.id === row.id),
      );

      expect(parts.reduce((sum, part) => sum + part.headcount, 0)).toBe(
        row.headcount,
      );

      expect(parts.reduce((sum, part) => sum + part.absent, 0)).toBe(
        row.absent,
      );
    });

    expect(
      campuses.reduce(
        (sum, campus) => sum + summaryFor(campus.label).totalStaff,
        0,
      ),
    ).toBe(485);
  });

  it("works out the staffing ratio for each campus", () => {
    expect(summaryFor("Kibuli Main Campus").ratio).toBe("1:1.9");
    expect(summaryFor("Buwaate Campus").ratio).toBe("1:0.5");
    expect(summaryFor("Annex / Preschool Branch").ratio).toBe("1:0.8");
  });

  it("has five legacy departments", () => {
    expect(departments).toHaveLength(5);
  });
});
