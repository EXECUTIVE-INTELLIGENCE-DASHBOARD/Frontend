import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import type { EnrollmentDashboardData } from "../../api/academics.api";
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

const mockEnrollmentDashboard: EnrollmentDashboardData = {
  term: null,
  summary: {
    total_active_enrolment: 240,
    new_students: 30,
    continuing_students: 210,
    admissions_conversion: 62.5,
    capacity: 300,
    capacity_utilisation: 80,
  },
  gender: {
    boys: 120,
    girls: 120,
    boys_pct: 50,
    girls_pct: 50,
  },
  campuses: [],
  schools: [],
  pipeline: [
    { stage: "applied", label: "Applied", count: 100, rate: null },
    { stage: "qualified", label: "Qualified", count: 80, rate: 80 },
    { stage: "interviewed", label: "Interviewed", count: 70, rate: 87.5 },
    { stage: "accepted", label: "Accepted", count: 65, rate: 92.9 },
    { stage: "enrolled", label: "Enrolled", count: 60, rate: 92.3 },
  ],
};

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(async (url) => {
    if (url === "/academics/schools/") {
      return { data: mockSchools };
    }

    if (url === "/academics/terms/") {
      return { data: mockTerms };
    }

    if (url === "/academics/enrollment/dashboard/") {
      return { data: mockEnrollmentDashboard };
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

  it("requests enrollment data for the selected campus and term", async () => {
    render(<AdmissionsEnrollment />);

    await waitFor(() => {
      expect(selectByName("Campus")).toHaveValue("");
      expect(selectByName("Term")).toHaveValue("");
    });

    fireEvent.change(selectByName("Campus"), {
      target: { value: "kibuli" },
    });
    fireEvent.change(selectByName("Term"), {
      target: { value: "6" },
    });

    await waitFor(() => {
      const requests = vi
        .mocked(api.get)
        .mock.calls.filter(
          ([url]) => url === "/academics/enrollment/dashboard/",
        );
      const latestRequest = requests[requests.length - 1];

      expect(latestRequest?.[1]?.params).toEqual({
        campus: "kibuli",
        term: 6,
      });
    });
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

    // The shared row already filters by campus, so the page must not add a
    // second "all schools" picker of its own.
    expect(screen.queryByRole("combobox", { name: "School" })).toBeNull();

    drillIntoSchool(kibuliSecondary);

    // The campus's own classes are offered on the table itself.
    expect(
      within(selectByName("Class")).queryByRole("option", {
        name: "Top Class",
      }),
    ).toBeNull();
    expect(inView()).not.toBe(everywhere);
  });

  it("keeps the class and stream pickers on the table, not the filter row", () => {
    render(<AdmissionsEnrollment />);

    // The row is the same set of filters the academic screens share.
    expect(selectByName("Campus")).toHaveValue("");
    expect(selectByName("Section")).toHaveValue("");
    expect(selectByName("Term")).toBeInTheDocument();
    expect(selectByName("Academic Year")).toBeInTheDocument();

    // Class and stream belong to the enrolment table, so they are offered
    // before any campus is chosen. The learner search still needs a school.
    const table = screen
      .getByRole("heading", { name: "Enrolment by school" })
      .closest("section") as HTMLElement;

    expect(
      within(table).getByRole("combobox", { name: "Class" }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole("combobox", { name: "Stream" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Find a learner")).toBeNull();

    drillIntoSchool(kibuliSecondary);

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

  it("leaves class and stream to the pickers on the table itself", () => {
    render(<AdmissionsEnrollment />);

    expect(
      screen.getByRole("heading", { name: "Enrolment by school" }),
    ).toBeInTheDocument();

    drillIntoSchool(kibuliSecondary);

    // The table already narrows by class and stream, so the page must not add
    // a second "Enrolment by class" or "Enrolment by stream" list.
    expect(
      screen.queryByRole("heading", { name: "Enrolment by class" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Enrolment by stream" }),
    ).not.toBeInTheDocument();
    expect(selectByName("Class")).toBeInTheDocument();
    expect(selectByName("Stream")).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("navigation", { name: "Drill-down path" }),
      ).getByText(/Kibuli/),
    ).toBeInTheDocument();
  });

  it("walks back to every campus from the breadcrumb", () => {
    render(<AdmissionsEnrollment />);

    drillIntoSchool(kibuliSecondary);

    const trail = screen.getByRole("navigation", { name: "Drill-down path" });

    expect(within(trail).getByText("All campuses")).toBeInTheDocument();

    backToAllCampuses();

    expect(
      screen.getByRole("heading", { name: "Enrolment by school" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Drill-down path" }),
    ).not.toBeInTheDocument();
  });

  it("lists the learners a search matches and opens a learner record", () => {
    render(<AdmissionsEnrollment />);

    drillIntoSchool(kibuliSecondary);

    // Every admission number starts with GH, so this matches the whole roll.
    fireEvent.change(screen.getByLabelText("Find a learner"), {
      target: { value: "GH" },
    });

    const roster = screen.getByRole("table", {
      name: /Learners matching the search/,
    });

    expect(roster).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const rows = within(roster).getAllByRole("row").slice(1);

    fireEvent.click(rows[0]);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("places the admissions funnel beside the gender trend and keeps the table full width", () => {
    render(<AdmissionsEnrollment />);

    const funnel = screen.getByRole("heading", { name: "Admissions funnel" });
    const intake = screen.getByRole("heading", { name: "Enrolment by school" });
    const gender = screen.getByRole("heading", { name: "Girls vs boys" });

    expect(funnel.closest(".ae-analysis-row")).toBe(
      gender.closest(".ae-analysis-row"),
    );
    expect(intake.closest(".ae-analysis-row")).toBeNull();
  });

  it("renders the five pipeline counts returned by the enrollment API", async () => {
    render(<AdmissionsEnrollment />);

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: "Enrolment summary" }),
      ).toHaveTextContent("240");
    });

    const funnel = screen.getByRole("heading", { name: "Admissions funnel" })
      .closest("section") as HTMLElement;
    const labels = Array.from(
      funnel.querySelectorAll(".ae-funnel__label"),
    ).map((node) => node.textContent);
    const counts = Array.from(
      funnel.querySelectorAll(".ae-funnel__bar"),
    ).map((node) => node.textContent);

    expect(labels).toEqual([
      "Applied",
      "Qualified",
      "Interviewed",
      "Accepted",
      "Enrolled",
    ]);
    expect(counts).toEqual(["100", "80", "70", "65", "60"]);
    expect(funnel.textContent).not.toMatch(/offers made/i);
    expect(funnel).toHaveTextContent("From applying to enrolling");
    expect(funnel).toHaveTextContent(
      "Each percentage compares the stage with the one above it.",
    );
  });

  it("puts the class and stream pickers on the enrolment table", () => {
    render(<AdmissionsEnrollment />);

    // Unscoped, the table offers every class the group runs.
    expect(
      within(selectByName("Class")).getByRole("option", { name: "S.4" }),
    ).toBeInTheDocument();
    expect(
      within(selectByName("Class")).getByRole("option", {
        name: "Top Class",
      }),
    ).toBeInTheDocument();

    drillIntoSchool(kibuliSecondary);

    // Choosing a campus rescopes the picker to the classes that campus runs.
    expect(
      within(selectByName("Class")).getByRole("option", { name: "S.4" }),
    ).toBeInTheDocument();
    expect(
      within(selectByName("Class")).queryByRole("option", {
        name: "Top Class",
      }),
    ).toBeNull();

    expect(screen.getByLabelText("Find a learner")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Enrolment by class" }),
    ).not.toBeInTheDocument();
  });

  it("puts every campus in scope in the enrolment table", () => {
    render(<AdmissionsEnrollment />);

    const table = screen.getByRole("table", {
      name: /Total enrolment by school, with gender, boarding, day and age/i,
    });

    // Six campuses plus the header row — every campus keeps its row whatever
    // classes it takes.
    expect(within(table).getAllByRole("row")).toHaveLength(7);
    expect(
      within(table).getByRole("row", { name: /Kibuli Nursery/ }),
    ).toBeInTheDocument();
  });

  it("tabulates the whole roll by the remaining intake fields", () => {
    render(<AdmissionsEnrollment />);

    const table = screen.getByRole("table", {
      name: /Total enrolment by school, with gender, boarding, day and age/i,
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

    const classPicker = selectByName("Class");

    fireEvent.change(classPicker, { target: { value: "s5" } });

    expect(classPicker).toHaveValue("s5");

    const s5Table = screen.getByRole("table", {
      name: /S\.5 enrolment by school/i,
    });

    // Only the campuses that actually run S.5 stay in the table.
    expect(within(s5Table).getAllByRole("row")).toHaveLength(3);
    expect(
      within(s5Table).queryByRole("row", { name: /Kibuli Nursery/ }),
    ).toBeNull();
  });

  it("drops the campuses that do not run the class that is picked", () => {
    render(<AdmissionsEnrollment />);

    const classPicker = selectByName("Class");

    fireEvent.change(classPicker, { target: { value: "s1" } });

    const s1Table = screen.getByRole("table", {
      name: /S\.1 enrolment by school/i,
    });
    // The campus sits in the row header; the other cells name feeder schools,
    // some of which are primaries themselves, so only the campus column counts.
    const campuses = within(s1Table)
      .getAllByRole("rowheader")
      .map((cell) => cell.textContent ?? "");

    expect(campuses).toHaveLength(2);
    expect(campuses.join(" ")).toMatch(/Kibuli Secondary/);
    expect(campuses.join(" ")).toMatch(/GIS Kansanga/);
    expect(campuses.join(" ")).not.toMatch(/Nursery|Primary/);
  });

  it("keeps the intake table on screen after a school is drilled into", () => {
    render(<AdmissionsEnrollment />);

    drillIntoSchool(kibuliSecondary);

    // The intake table remains visible when a campus is selected.
    expect(
      screen.getByRole("heading", { name: "Enrolment by school" }),
    ).toBeInTheDocument();

    const table = screen.getByRole("table", {
      name: /Total enrolment by school/i,
    });

    expect(within(table).getAllByRole("row")).toHaveLength(2);

    expect(
      within(table).getByRole("row", { name: /Kibuli Secondary/ }),
    ).toBeInTheDocument();
  });

  it("keeps the authorised export available for the filtered scope", () => {
    render(<AdmissionsEnrollment />);

    fireEvent.click(screen.getByRole("button", { name: "Quick actions" }));

    expect(screen.getByRole("menuitem", { name: /Export/ })).toBeEnabled();
  });

  it("keeps the gender chart and funnel on admissions while moving the retention chart", () => {
    render(<AdmissionsEnrollment />);

    expect(
      screen.getByRole("region", { name: "Enrolment trends" }),
    ).toBeInTheDocument();

    const gender = screen.getByRole("img", {
      name: /girls and boys enrolled in each period/i,
    });
    // Six trailing terms, ending on the term the KPI cards describe.
    expect(gender.querySelectorAll("rect.ae-trend__bar")).toHaveLength(12);
    expect(
      screen.queryByRole("img", {
        name: /new entrants and continuing learners/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Admissions funnel" }),
    ).toBeInTheDocument();

    // The Term and Academic Year pickers sit in the filter row, so the charts
    // carry no period switch of their own.
    expect(screen.queryByRole("group", { name: "Trend period" })).toBeNull();
    expect(screen.queryByRole("button", { name: "By year" })).toBeNull();
    expect(screen.queryByRole("button", { name: "By term" })).toBeNull();
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
