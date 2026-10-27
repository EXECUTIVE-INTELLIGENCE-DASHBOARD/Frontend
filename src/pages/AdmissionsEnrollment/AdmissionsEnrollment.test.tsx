import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import { AdmissionsEnrollment } from "./AdmissionsEnrollment";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

// The shared academic row reads its campuses and terms from the backend.
const mockSchools = [
  {
    id: 9,
    name: "Green Hill Academy Secondary School Kibuli",
    campus: "kibuli",
    campus_display: "Kibuli Main",
    level: "secondary",
  },
  {
    id: 11,
    name: "GreenHill Academy Primary Buwaate",
    campus: "buwaate",
    campus_display: "Buwaate",
    level: "primary",
  },
  {
    id: 24,
    name: "Annex Campus",
    campus: "gis",
    campus_display: "Greenhill International (GIS)",
    level: "nursery",
  },
];

const mockTerms = [1, 2, 3].map((number) => ({
  id: number + 5,
  academic_year: "2026",
  number,
  start_date: "2025-09-01",
  end_date: "2026-08-07",
}));

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(async (url) => {
    if (url === "/academics/schools/") {
      return { data: mockSchools };
    }

    if (url === "/academics/terms/") {
      return { data: mockTerms };
    }

    throw new Error(`Unexpected API endpoint: ${url}`);
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

const selectByName = (name: string) => screen.getByRole("combobox", { name });

const drillIntoSchool = (name: RegExp) => {
  fireEvent.click(screen.getByRole("button", { name }));
};

const kibuliSecondary = /Greenhill Academy Secondary – Kibuli.*Drill down/i;

const backToAllCampuses = () => {
  const trail = screen.getByRole("navigation", { name: "Drill-down path" });

  fireEvent.click(within(trail).getAllByRole("button")[0]);
};

describe("AdmissionsEnrollment", () => {
  it("renders the four headline KPI cards", () => {
    render(<AdmissionsEnrollment />);

    const kpis = screen.getByRole("region", { name: "Enrolment summary" });

    expect(within(kpis).getByText("Total students")).toBeInTheDocument();
    expect(within(kpis).getByText("Capacity")).toBeInTheDocument();
    expect(within(kpis).getByText("New students")).toBeInTheDocument();
    expect(within(kpis).getByText("Join rate")).toBeInTheDocument();
    expect(within(kpis).queryByText("Returning")).not.toBeInTheDocument();
  });

  it("offers the same filters as the other academic screens", async () => {
    render(<AdmissionsEnrollment />);

    expect(selectByName("Section")).toBeInTheDocument();
    expect(selectByName("Term")).toBeInTheDocument();
    expect(selectByName("Academic Year")).toBeInTheDocument();

    const campus = selectByName("Campus");

    await waitFor(() =>
      expect(
        within(campus)
          .getAllByRole("option")
          .map((option) => option.textContent),
      ).toEqual([
        "All Campuses",
        "Buwaate",
        "Greenhill International (GIS)",
        "Kibuli Main",
      ]),
    );
  });

  it("averages the six schools until a school is drilled into", () => {
    render(<AdmissionsEnrollment />);

    // Unscoped, the intake table counts every campus in scope.
    const inView = () => {
      const section = screen
        .getByRole("heading", { name: "Enrolment by school" })
        .closest("section") as HTMLElement;

      return within(section).getByText(/\bin view$/i).textContent ?? "";
    };
    const everywhere = inView();

    expect(selectByName("School")).toHaveValue("all");

    drillIntoSchool(kibuliSecondary);

    expect(selectByName("School")).toHaveValue("kibuli-secondary");
    expect(inView()).not.toBe(everywhere);
  });

  it("shows campus, section, term and year before a school is drilled into", () => {
    render(<AdmissionsEnrollment />);

    // The row is the same set of filters the academic screens share.
    expect(selectByName("Campus")).toHaveValue("");
    expect(selectByName("Section")).toHaveValue("");
    expect(selectByName("Term")).toBeInTheDocument();
    expect(selectByName("Academic Year")).toBeInTheDocument();

    // Class, stream and the learner search need a school to scope them.
    expect(screen.queryByRole("combobox", { name: "Class" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Stream" })).toBeNull();
    expect(screen.queryByLabelText("Find a learner")).toBeNull();

    drillIntoSchool(kibuliSecondary);

    expect(selectByName("Class")).toBeInTheDocument();
    expect(selectByName("Stream")).toBeInTheDocument();
    expect(screen.getByLabelText("Find a learner")).toBeInTheDocument();
  });

  it("narrows the class options to the levels a campus runs", () => {
    render(<AdmissionsEnrollment />);

    drillIntoSchool(kibuliSecondary);

    const secondary = selectByName("Class");

    expect(
      within(secondary).getByRole("option", { name: "S.4" }),
    ).toBeInTheDocument();
    expect(
      within(secondary).queryByRole("option", { name: "Top Class" }),
    ).not.toBeInTheDocument();

    backToAllCampuses();
    // Every campus in scope keeps a row, so the nursery is reachable straight
    // from the table even though it admits no S.1 learners.
    fireEvent.click(
      screen.getByRole("button", {
        name: /Greenhill Academy Nursery – Kibuli.*Drill down/i,
      }),
    );

    const nursery = selectByName("Class");

    expect(
      within(nursery).queryByRole("option", { name: "S.4" }),
    ).not.toBeInTheDocument();
    expect(
      within(nursery).getByRole("option", { name: "Top Class" }),
    ).toBeInTheDocument();
  });

  it("drills from schools to classes and then to streams", () => {
    render(<AdmissionsEnrollment />);

    expect(
      screen.getByRole("heading", { name: "Enrolment by school" }),
    ).toBeInTheDocument();

    drillIntoSchool(kibuliSecondary);

    expect(
      screen.getByRole("heading", { name: "Enrolment by class" }),
    ).toBeInTheDocument();
    expect(selectByName("Class")).toHaveValue("all");

    fireEvent.click(
      screen.getByRole("button", { name: /S\.4.*Drill down/i }),
    );

    expect(
      screen.getByRole("heading", { name: "Enrolment by stream" }),
    ).toBeInTheDocument();
    expect(selectByName("Class")).toHaveValue("s4");
  });

  it("walks back up the drill-down path from the breadcrumb", () => {
    render(<AdmissionsEnrollment />);

    drillIntoSchool(kibuliSecondary);
    fireEvent.change(selectByName("Class"), { target: { value: "s4" } });

    expect(
      screen.getByRole("heading", { name: "Enrolment by stream" }),
    ).toBeInTheDocument();

    backToAllCampuses();

    expect(screen.queryByRole("combobox", { name: "Class" })).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Enrolment by school" }),
    ).toBeInTheDocument();
  });

  it("lists learners once a stream is selected and opens a learner record", () => {
    render(<AdmissionsEnrollment />);

    drillIntoSchool(kibuliSecondary);
    fireEvent.change(selectByName("Class"), { target: { value: "s4" } });
    fireEvent.change(selectByName("Stream"), { target: { value: "A" } });

    const roster = screen.getByRole("table", {
      name: /Learners in the selected class and stream/,
    });

    expect(roster).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const rows = within(roster).getAllByRole("row").slice(1);

    fireEvent.click(rows[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the page with the admissions funnel beside the intake table", () => {
    render(<AdmissionsEnrollment />);

    const funnel = screen.getByRole("heading", { name: "Admissions funnel" });
    const intake = screen.getByRole("heading", { name: "Enrolment by school" });

    // Both panels share one row, so neither can drift below the other.
    expect(funnel.closest("section")?.parentElement).toBe(
      intake.closest("section")?.parentElement,
    );
  });

  it("uses the five pipeline stages the enrollment API records", () => {
    render(<AdmissionsEnrollment />);

    const funnel = screen.getByRole("heading", { name: "Admissions funnel" })
      .closest("section") as HTMLElement;
    const labels = Array.from(
      funnel.querySelectorAll(".ae-funnel__label"),
    ).map((node) => node.textContent);

    expect(labels).toEqual([
      "Applied",
      "Qualified",
      "Interviewed",
      "Accepted",
      "Enrolled",
    ]);
    expect(funnel.textContent).not.toMatch(/offers made/i);
  });

  it("reveals class, stream and learner filters as soon as a school is chosen", () => {
    render(<AdmissionsEnrollment />);

    const school = selectByName("School");

    expect(school).toHaveValue("all");
    expect(screen.queryByRole("combobox", { name: "Class" })).toBeNull();

    fireEvent.change(school, { target: { value: "kibuli-secondary" } });

    expect(selectByName("Class")).toBeInTheDocument();
    expect(selectByName("Stream")).toBeInTheDocument();
    expect(screen.getByLabelText("Find a learner")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Enrolment by class" }),
    ).toBeInTheDocument();
  });

  it("puts every campus in scope in the intake table", () => {
    render(<AdmissionsEnrollment />);

    const table = screen.getByRole("table", {
      name: /S\.1 enrolment by school, with gender, boarding, day, age/i,
    });

    // Six campuses plus the header row — a campus that does not admit S.1
    // keeps its row and shows a dash rather than disappearing.
    expect(within(table).getAllByRole("row")).toHaveLength(7);
    expect(
      within(table).getByRole("row", { name: /Kibuli Nursery/ }).textContent,
    ).toContain("—");
  });

  it("tabulates S.1 and S.5 intake by gender, boarding, age, faith and origin", () => {
    render(<AdmissionsEnrollment />);

    const table = screen.getByRole("table", {
      name: /S\.1 enrolment by school, with gender, boarding, day, age/i,
    });

    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual([
      "School",
      "Girls",
      "Boys",
      "Boarding",
      "Day",
      "Age",
      "Nationality",
      "Faith",
      "School of origin",
    ]);

    const secondary = within(table).getByRole("row", {
      name: /Kibuli Secondary/,
    });
    const cells = within(secondary).getAllByRole("cell");

    // Boarding and day split the same intake, so neither can exceed it.
    expect(Number(cells[2].textContent) + Number(cells[3].textContent)).toBe(
      Number(cells[0].textContent) + Number(cells[1].textContent),
    );
    expect(cells[4].textContent).toMatch(/yrs/);
    expect(cells[5].textContent).toMatch(/%/);
    expect(cells[6].textContent).toMatch(/%/);
    expect(cells[7].textContent).toMatch(/%/);

    const s5 = screen.getByRole("button", { name: "S.5", pressed: false });

    fireEvent.click(s5);

    expect(s5).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("table", { name: /S\.5 enrolment by school/i }),
    ).toBeInTheDocument();
  });

  it("keeps the intake table on screen after a school is drilled into", () => {
    render(<AdmissionsEnrollment />);

    drillIntoSchool(kibuliSecondary);

    // The S.1 / S.5 origin figures stay visible next to the class drill-down.
    expect(
      screen.getByRole("heading", { name: "Enrolment by class" }),
    ).toBeInTheDocument();

    const table = screen.getByRole("table", {
      name: /S\.1 enrolment by school/i,
    });

    expect(within(table).getAllByRole("row")).toHaveLength(2);

    const cells = within(
      within(table).getByRole("row", { name: /Kibuli Secondary/ }),
    ).getAllByRole("cell");

    expect(cells[7].textContent).toMatch(/%/);
  });

  it("keeps the authorised export available for the filtered scope", () => {
    render(<AdmissionsEnrollment />);

    fireEvent.click(screen.getByRole("button", { name: "Quick actions" }));

    expect(screen.getByRole("menuitem", { name: /Export/ })).toBeEnabled();
  });

  it("plots gender and new-entrant trends per term and per year", () => {
    render(<AdmissionsEnrollment />);

    expect(
      screen.getByRole("heading", { name: "Enrolment trends" }),
    ).toBeInTheDocument();

    const gender = screen.getByRole("img", {
      name: /girls and boys enrolled in each period/i,
    });
    const entrants = screen.getByRole("img", {
      name: /new entrants and continuing learners/i,
    });

    // Six trailing terms, ending on the term the KPI cards describe.
    expect(gender.querySelectorAll("rect.ae-trend__bar")).toHaveLength(12);
    expect(entrants.querySelectorAll("rect.ae-trend__bar")).toHaveLength(12);

    const byYear = screen.getByRole("button", { name: "By year" });
    fireEvent.click(byYear);

    expect(byYear).toHaveAttribute("aria-pressed", "true");
    expect(
      screen
        .getByRole("img", { name: /girls and boys enrolled in each period/i })
        .querySelectorAll("rect.ae-trend__bar"),
    ).toHaveLength(10);
  });

  it("raises a banner when a learner search is typed", () => {
    render(<AdmissionsEnrollment />);

    drillIntoSchool(kibuliSecondary);

    fireEvent.change(screen.getByLabelText("Find a learner"), {
      target: { value: "Achieng Mercy" },
    });

    expect(screen.getByRole("status")).toHaveTextContent("Achieng Mercy");
  });
});
