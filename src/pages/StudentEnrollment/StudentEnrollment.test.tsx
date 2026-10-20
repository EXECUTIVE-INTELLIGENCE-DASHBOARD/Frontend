import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { StudentEnrollment } from "./StudentEnrollment";
import {
  allCampusesLabel,
  axisFor,
  campuses,
  summaryFor,
} from "./studentEnrollment.data";

afterEach(() => {
  cleanup();
});

describe("StudentEnrollment", () => {
  it("renders the three headline cards for all campuses", () => {
    render(<StudentEnrollment />);

    expect(screen.getByText("Total Active Enrolment")).toBeInTheDocument();
    expect(screen.getAllByText("2,800").length).toBeGreaterThan(0);
    expect(screen.getByText("Admissions Conversion")).toBeInTheDocument();
    expect(screen.getByText("84.5%")).toBeInTheDocument();
    expect(screen.getByText("Capacity Utilization")).toBeInTheDocument();
    expect(screen.getByText("91.2%")).toBeInTheDocument();
  });

  it("shows boys and girls for each campus", () => {
    render(<StudentEnrollment />);

    expect(
      screen.getByRole("group", { name: "Kibuli Main: 640 boys, 610 girls" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Buwaate: 430 boys, 420 girls" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", {
        name: "Annex Preschool: 360 boys, 340 girls",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Total: 1,250")).toBeInTheDocument();
    expect(screen.getByText(/51\.1% Boys \(1,430\)/)).toBeInTheDocument();
    expect(screen.getByText(/48\.9% Girls \(1,370\)/)).toBeInTheDocument();
    expect(screen.getByText("Aggregate 2,800 students")).toBeInTheDocument();
  });

  it("shows enrolment by educational tier", () => {
    render(<StudentEnrollment />);

    expect(
      screen.getByRole("group", {
        name: "Annex Preschool: 360 boys, 340 girls",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", {
        name: "Kibuli Main: 640 boys, 610 girls",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Application conversion funnel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Enrollment & Pipeline" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Enrollment & Pipeline" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", { name: "Application conversion funnel" }),
    ).toBeInTheDocument();
  });

  it("offers the four campus options", () => {
    render(<StudentEnrollment />);

    expect(screen.getByLabelText("Select Campus")).toHaveValue(
      allCampusesLabel,
    );

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["All Campuses", "Kibuli Main", "Buwaate", "Annex Preschool"]);
  });

  it("changes every figure when a campus is selected", () => {
    render(<StudentEnrollment />);

    fireEvent.change(screen.getByLabelText("Select Campus"), {
      target: { value: "Kibuli Main" },
    });

    expect(screen.getAllByText("1,250").length).toBeGreaterThan(0);
    expect(screen.getByText("85.8%")).toBeInTheDocument();
    expect(screen.getByText("93.3%")).toBeInTheDocument();
    expect(screen.getByText("Kibuli Main 1,250 students")).toBeInTheDocument();

    expect(
      screen.getByRole("group", { name: "Kibuli Main: 640 boys, 610 girls" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: /Buwaate/ }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("group", {
        name: "Kibuli Main: 640 boys, 610 girls",
      }),
    ).toBeInTheDocument();
  });
});

describe("enrolment data", () => {
  it("adds up to the design's 2,800 students", () => {
    const summary = summaryFor(allCampusesLabel);

    expect(summary.total).toBe(2800);
    expect(summary.boys).toBe(1430);
    expect(summary.girls).toBe(1370);
  });

  it("matches the design's tier counts", () => {
    expect(
      summaryFor(allCampusesLabel).tiers.map((tier) => tier.value),
    ).toEqual([450, 1450, 650, 250]);
  });

  it("splits every campus across the tiers without losing anyone", () => {
    for (const campus of campuses) {
      const tierTotal = Object.values(campus.tiers).reduce(
        (total, value) => total + value,
        0,
      );

      expect(tierTotal).toBe(campus.boys + campus.girls);
    }
  });

  it("picks chart axes like the design", () => {
    expect(axisFor(640).top).toBe(800);
    expect(axisFor(640).ticks).toEqual([0, 200, 400, 600, 800]);
    expect(axisFor(1450).top).toBe(1600);
    expect(axisFor(1450).ticks).toEqual([0, 400, 800, 1200, 1600]);
  });
});
