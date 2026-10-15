import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { defaultAcademicYear } from "../../lib/organisation";
import { StudentEnrollment } from "./StudentEnrollment";
import {
  allCampusesLabel,
  campusRowsFor,
  campuses,
  niceScale,
  summaryFor,
  tierRowsFor,
} from "./studentEnrollment.data";

const chooseCampus = (from: string, to: string) => {
  fireEvent.click(screen.getByRole("button", { name: `Campus: ${from}` }));
  fireEvent.click(within(screen.getByRole("listbox")).getByText(to));
};

const sectionFor = (name: string) =>
  screen.getByRole("heading", { name }).closest("section") as HTMLElement;

describe("StudentEnrollment", () => {
  it("shows the academic year and the shared campus filter", () => {
    render(<StudentEnrollment />);

    expect(screen.getByText(defaultAcademicYear)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Campus: All Campuses" }),
    ).toBeInTheDocument();
  });

  it("renders the three headline cards for all campuses", () => {
    render(<StudentEnrollment />);

    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(3);

    const expected: Array<[string, string]> = [
      ["Total Active Enrolment", "2,800"],
      ["Admissions Conversion", "84.5%"],
      ["Capacity Utilization", "91.2%"],
    ];

    expected.forEach(([label, value], index) => {
      expect(within(cards[index]).getByText(label)).toBeInTheDocument();
      expect(within(cards[index]).getByText(value)).toBeInTheDocument();
    });

    expect(within(cards[0]).getByText("Students")).toBeInTheDocument();
  });

  it("shows enrolment and gender for each campus", () => {
    render(<StudentEnrollment />);

    const card = sectionFor("Campus Enrolment & Gender Breakdown");

    expect(
      within(card).getByRole("img", {
        name: "Boys and girls enrolled at each campus",
      }),
    ).toBeInTheDocument();

    ["Kibuli Main", "Buwaate", "Annex Preschool"].forEach((name) =>
      expect(within(card).getByText(name)).toBeInTheDocument(),
    );

    ["Total: 1,250", "Total: 850", "Total: 700"].forEach((text) =>
      expect(within(card).getByText(text)).toBeInTheDocument(),
    );

    expect(within(card).getByText("640")).toBeInTheDocument();
    expect(within(card).getByText("610")).toBeInTheDocument();

    expect(card).toHaveTextContent("51.1% Boys (1,430)");
    expect(card).toHaveTextContent("48.9% Girls (1,370)");
    expect(within(card).getByText(/Aggregate 2,800 students/i)).toBeInTheDocument();
  });

  it("shows enrolment by educational tier with shares", () => {
    render(<StudentEnrollment />);

    const card = sectionFor("Enrolment by Educational Tier");

    ["Nursery", "Primary", "O-Level", "A-Level"].forEach((name) =>
      expect(within(card).getAllByText(name).length).toBeGreaterThan(0),
    );

    ["1,450", "51.8%", "650", "23.2%", "450", "16.1%", "250", "8.9%"].forEach(
      (text) => expect(within(card).getByText(text)).toBeInTheDocument(),
    );

    ["Core (Primary)", "Secondary / Prep", "Sixth Form (A-L)"].forEach((text) =>
      expect(within(card).getByText(text)).toBeInTheDocument(),
    );
  });

  it("changes every figure when a campus is selected", () => {
    render(<StudentEnrollment />);

    chooseCampus("All Campuses", "Kibuli Main Campus");

    const cards = screen.getAllByRole("article");

    expect(within(cards[0]).getByText("1,250")).toBeInTheDocument();
    expect(within(cards[1]).getByText("86.0%")).toBeInTheDocument();
    expect(within(cards[2]).getByText("93.5%")).toBeInTheDocument();

    const campusCard = sectionFor("Campus Enrolment & Gender Breakdown");

    expect(within(campusCard).getByText("Kibuli Main")).toBeInTheDocument();
    expect(within(campusCard).queryByText("Buwaate")).not.toBeInTheDocument();
    expect(campusCard).toHaveTextContent("51.2% Boys (640)");
    expect(campusCard).toHaveTextContent("48.8% Girls (610)");

    const tierCard = sectionFor("Enrolment by Educational Tier");

    expect(within(tierCard).getByText("580")).toBeInTheDocument();
    expect(within(tierCard).getByText("46.4%")).toBeInTheDocument();

    chooseCampus("Kibuli Main Campus", "All Campuses");

    expect(
      within(screen.getAllByRole("article")[0]).getByText("2,800"),
    ).toBeInTheDocument();
  });
});

describe("student enrollment data", () => {
  it("matches the reference totals", () => {
    const summary = summaryFor(allCampusesLabel);

    expect(summary.total).toBe(2800);
    expect(summary.boys).toBe(1430);
    expect(summary.girls).toBe(1370);
    expect(summary.conversion).toBe(84.5);
    expect(summary.capacity).toBe(91.2);

    expect(campusRowsFor(allCampusesLabel).map((row) => row.total)).toEqual([
      1250, 850, 700,
    ]);

    expect(tierRowsFor(allCampusesLabel).map((row) => row.value)).toEqual([
      450, 1450, 650, 250,
    ]);
  });

  it("adds up the tiers to each campus total", () => {
    campuses.forEach((campus) => {
      const tierTotal = tierRowsFor(campus.label).reduce(
        (sum, tier) => sum + tier.value,
        0,
      );

      expect(tierTotal).toBe(summaryFor(campus.label).total);
    });
  });

  it("picks a chart scale with four steps", () => {
    expect(niceScale(640)).toEqual({ step: 200, top: 800 });
    expect(niceScale(1450)).toEqual({ step: 400, top: 1600 });
    expect(niceScale(360)).toEqual({ step: 100, top: 400 });
  });
});
