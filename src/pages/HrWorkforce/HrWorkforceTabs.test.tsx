import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getHrEstablishment,
  getHrExits,
  getHrWorkforceDashboard,
} from "./hrWorkforce.api";
import { HrWorkforce } from "./HrWorkforce";

vi.mock("./hrWorkforce.api", () => ({
  getHrWorkforceDashboard: vi.fn(),
  getHrEstablishment: vi.fn(),
  getHrExits: vi.fn(),
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

const establishmentDepartments = [
  {
    id: 1,
    department: "Academic & Curriculum Instruction",
    staff_category: "teaching",
    staff_category_display: "Teaching Staff (Full-Time & Contract)",
    filled_positions: 205,
    vacant_positions: null,
    approved_posts: null,
    over_establishment: 0,
  },
  {
    id: 2,
    department: "Boarding & Catering Operations",
    staff_category: "non_teaching_support",
    staff_category_display: "Non-Teaching Support",
    filled_positions: 95,
    vacant_positions: null,
    approved_posts: null,
    over_establishment: 0,
  },
  {
    id: 3,
    department: "Transport & Fleet Management",
    staff_category: "drivers_technicians",
    staff_category_display: "Drivers & Mechanical Technicians",
    filled_positions: 45,
    vacant_positions: null,
    approved_posts: null,
    over_establishment: 0,
  },
  {
    id: 4,
    department: "Administration & Executive Support",
    staff_category: "administrative",
    staff_category_display: "Administrative & Clerical",
    filled_positions: 80,
    vacant_positions: null,
    approved_posts: null,
    over_establishment: 0,
  },
  {
    id: 5,
    department: "Facilities & Maintenance",
    staff_category: "technical_security",
    staff_category_display: "Technical, Security & Groundskeeping",
    filled_positions: 60,
    vacant_positions: null,
    approved_posts: null,
    over_establishment: 0,
  },
  {
    id: 12,
    department: "Teaching Unit 1",
    staff_category: "teaching",
    staff_category_display: "Teaching Staff (Full-Time & Contract)",
    filled_positions: 1,
    vacant_positions: null,
    approved_posts: null,
    over_establishment: 0,
  },
  {
    id: 13,
    department: "Teaching Unit 2",
    staff_category: "teaching",
    staff_category_display: "Teaching Staff (Full-Time & Contract)",
    filled_positions: 1,
    vacant_positions: null,
    approved_posts: null,
    over_establishment: 0,
  },
  {
    id: 14,
    department: "Teaching Unit 3",
    staff_category: "teaching",
    staff_category_display: "Teaching Staff (Full-Time & Contract)",
    filled_positions: 1,
    vacant_positions: null,
    approved_posts: null,
    over_establishment: 0,
  },
];

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

const mockEstablishment = () => {
  vi.mocked(getHrEstablishment).mockResolvedValue({
    date: "2026-10-26",
    summary: {
      approved_posts: 0,
      filled_positions: 488,
      vacant_positions: 0,
      vacancy_rate: null,
      departments_without_approved_posts: 8,
    },
    departments: establishmentDepartments,
  });
};

const mockExits = () => {
  vi.mocked(getHrExits).mockResolvedValue({
    start: "2025-10-27",
    end: "2026-10-26",
    total_exits: 0,
    summary: {
      staff_exits: 0,
      voluntary_exits: 0,
      average_headcount: 487.5,
      turnover_rate: 0,
      voluntary_rate: 0,
    },
    departments: [],
    by_reason: [],
    by_campus: [],
    by_month: [],
    completeness: {
      with_reason: 0,
      without_reason: 0,
      leavers_without_exit_date: 6,
    },
  });
};

describe("HrWorkforce tabs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDashboard();
    mockEstablishment();
    mockExits();
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
  it("shows establishment figures and department positions from the API", async () => {
    render(<HrWorkforce />);

    openTab("Establishment");

    expect(
      await screen.findByText("Approved vs Filled Positions"),
    ).toBeTruthy();

    expect(screen.getByText("488")).toBeTruthy();

    for (const department of establishmentDepartments) {
      expect(screen.getByText(department.department)).toBeTruthy();
    }

    expect(screen.getAllByText("Approval data unavailable")).toHaveLength(8);

    expect(screen.getAllByText("—").length).toBeGreaterThan(0);

    expect(screen.queryByText("Teaching – Sciences")).toBeNull();
    expect(screen.queryByText("Minimart")).toBeNull();

    expect(getHrEstablishment).toHaveBeenCalledTimes(1);
  });

  it("switches between exits, contracts and ratings without fabricated records", async () => {
    render(<HrWorkforce />);

    openTab("Talent");

    expect(await screen.findByText("Staff Exits & Turnover")).toBeTruthy();
    expect(screen.getByText("Staff Exits")).toBeTruthy();
    expect(screen.getByText("Turnover Rate")).toBeTruthy();
    expect(screen.getByText("Voluntary Exits")).toBeTruthy();

    openTab("Contracts");

    expect(
      screen.getByText("Senior Contract End Dates & Renewals"),
    ).toBeTruthy();

    expect(
      screen.getByText(
        /Contract end dates and renewal statuses are not provided/i,
      ),
    ).toBeTruthy();

    expect(screen.queryByText("Dr. Peter Ssemakula")).toBeNull();

    openTab("Ratings");

    expect(
      screen.getByText("Performance Ratings – Board-Appointed Senior Staff"),
    ).toBeTruthy();

    expect(
      screen.getByText(
        /Performance ratings and review dates are not provided/i,
      ),
    ).toBeTruthy();

    expect(screen.queryByText("Needs improvement")).toBeNull();
  });

  it("loads the exits summary when all employment is chosen", async () => {
    render(<HrWorkforce />);

    openTab("Talent");
    chooseEmployer("all");

    expect(await screen.findByText("Staff Exits & Turnover")).toBeTruthy();
    expect(screen.getByText("Voluntary Exits")).toBeTruthy();
    expect(getHrExits).toHaveBeenCalled();
  });

  it("downloads the visible establishment rows when Export Report is clicked", async () => {
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();

    Object.assign(URL, {
      createObjectURL,
      revokeObjectURL,
    });

    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<HrWorkforce />);

    openTab("Establishment");

    await screen.findByText("Approved vs Filled Positions");

    fireEvent.click(screen.getByRole("button", { name: /Export Report/i }));

    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(click).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
    });
  });
});
