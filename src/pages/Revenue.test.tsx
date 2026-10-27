import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Revenue } from "./Revenue";
import {
  getSchoolFees,
  getSchools,
  getStartedTerms,
  type SchoolFeesDashboard,
} from "./schoolFees/schoolFees.api";

vi.mock("./schoolFees/schoolFees.api", () => ({
  getSchoolFees: vi.fn(),
  getSchools: vi.fn(),
  getStartedTerms: vi.fn(),
}));

const row = (id: number | null, name: string, day: number, boarding: number | null,
  enrolled: number, paid: number) => ({
  id, name, revenue: day + (boarding ?? 0), day_revenue: day, boarding_revenue: boarding,
  enrolled, paid, not_paid: enrolled - paid,
  paid_rate: Math.round((paid * 1000) / enrolled) / 10, fees_not_received: (enrolled - paid) * 100_000,
});

const allSchools: SchoolFeesDashboard = {
  term: { id: 6, label: "Term 3, 2026" },
  school: null,
  has_boarding: true,
  summary: row(null, "", 280_000_000, 70_000_000, 1000, 900),
  sections: [
    { section: "day", section_display: "Day", students: 900, revenue: 280_000_000, fee_per_student: 311_111 },
    { section: "boarding", section_display: "Boarding", students: 100, revenue: 70_000_000, fee_per_student: 700_000 },
  ],
  breakdown_by: "school",
  breakdown: [
    row(1, "GreenHill Academy Primary Kibuli", 80_000_000, 70_000_000, 500, 480),
    row(2, "Greenhill International School", 200_000_000, null, 500, 420),
  ],
};

const gis: SchoolFeesDashboard = {
  ...allSchools,
  school: { id: 2, name: "Greenhill International School", has_boarding: false },
  has_boarding: false,
  summary: row(null, "", 200_000_000, null, 500, 420),
  sections: [{ section: "day", section_display: "Day", students: 500, revenue: 200_000_000, fee_per_student: 400_000 }],
  breakdown_by: "class",
  breakdown: [row(null, "P1", 100_000_000, null, 250, 210), row(null, "P2", 100_000_000, null, 250, 210)],
};

describe("Revenue", () => {
  beforeEach(() => {
    vi.mocked(getSchools).mockResolvedValue([
      { id: 1, name: "GreenHill Academy Primary Kibuli", campus: "kibuli", level: "primary" },
      { id: 2, name: "Greenhill International School", campus: "gis", level: "primary" },
    ]);
    vi.mocked(getStartedTerms).mockResolvedValue([
      { id: 6, academic_year: "2026", number: 3, start_date: "2026-09-01" },
    ]);
    vi.mocked(getSchoolFees).mockReset();
  });

  it("compares the schools, with day and boarding", async () => {
    vi.mocked(getSchoolFees).mockResolvedValue(allSchools);
    render(<Revenue />);

    expect(await screen.findByRole("article", { name: "Revenue per school" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Day vs boarding" })).toBeInTheDocument();
    for (const label of ["School fee revenue", "Day", "Boarding", "Students paid"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
    const payments = screen.getByRole("article", { name: "Students paying vs students enrolled" });
    expect(within(payments).getByText("Kibuli Primary")).toBeInTheDocument();
    expect(within(payments).getByText("84%").closest("td")).toHaveClass("is-red");
  });

  it("shows one day-only school by class, with no boarding figures", async () => {
    vi.mocked(getSchoolFees).mockResolvedValueOnce(allSchools).mockResolvedValue(gis);
    render(<Revenue />);

    await screen.findByRole("article", { name: "Revenue per school" });
    fireEvent.change(await screen.findByLabelText("School"), { target: { value: "2" } });

    expect(await screen.findByRole("article", { name: "Revenue per class" })).toBeInTheDocument();
    expect(getSchoolFees).toHaveBeenLastCalledWith({ school: 2, term: undefined });
    expect(screen.queryByRole("article", { name: "Day vs boarding" })).not.toBeInTheDocument();
    expect(screen.queryByText("Boarding")).not.toBeInTheDocument();
    expect(screen.queryByText("Day")).not.toBeInTheDocument();
    expect(screen.getByText("this term, GIS")).toBeInTheDocument();
    expect(screen.getByText("Class")).toBeInTheDocument();
  });

  it("says so when the server cannot be reached", async () => {
    vi.mocked(getSchoolFees).mockRejectedValue(new Error("network"));
    render(<Revenue />);

    expect(await screen.findByText("The finance server could not be reached.")).toBeInTheDocument();
  });
});
