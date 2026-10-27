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

    expect(screen.getByText(/average of the 6 schools ·/i)).toBeInTheDocument();

    drillIntoSchool(kibuliSecondary);

    expect(screen.queryByText(/average of the 6 schools/i)).toBeNull();
    expect(
      within(
        screen.getByRole("region", { name: "Enrolment summary" }),
      ).getByText("Total students"),
    ).toBeInTheDocument();
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
    drillIntoSchool(/Greenhill Academy Nursery – Kibuli.*Drill down/i);

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

  it("switches the learner profile dimension", () => {
    render(<AdmissionsEnrollment />);

    const group = screen.getByRole("group", {
      name: "Learner profile dimension",
    });

    expect(within(group).getByRole("button", { name: "Gender" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(within(group).getByRole("button", { name: "Faith" }));

    expect(within(group).getByRole("button", { name: "Faith" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(within(group).getByRole("button", { name: "Gender" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows the admissions funnel alongside enrolment", () => {
    render(<AdmissionsEnrollment />);

    expect(
      screen.getByRole("heading", { name: "Admissions funnel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Who the learners are" }),
    ).toBeInTheDocument();
  });

  it("keeps the authorised export available for the filtered scope", () => {
    render(<AdmissionsEnrollment />);

    fireEvent.click(screen.getByRole("button", { name: "Quick actions" }));

    expect(screen.getByRole("menuitem", { name: /Export/ })).toBeEnabled();
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
