import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdmissionsEnrollment } from "./AdmissionsEnrollment";

const selectByName = (name: string) => screen.getByRole("combobox", { name });

const chooseSchool = (schoolId: string) =>
  fireEvent.change(selectByName("School"), { target: { value: schoolId } });

describe("AdmissionsEnrollment", () => {
  it("renders the five headline KPI cards", () => {
    render(<AdmissionsEnrollment />);

    const kpis = screen.getByRole("region", { name: "Enrolment summary" });

    expect(within(kpis).getByText("Average learners")).toBeInTheDocument();
    expect(
      within(kpis).getByText("Average opening enrolment"),
    ).toBeInTheDocument();
    expect(within(kpis).getByText("Average new learners")).toBeInTheDocument();
    expect(
      within(kpis).getByText("Average continuing learners"),
    ).toBeInTheDocument();
    expect(within(kpis).getByText("Apply → report")).toBeInTheDocument();
  });

  it("offers every campus under all schools", () => {
    render(<AdmissionsEnrollment />);

    const options = within(selectByName("School")).getAllByRole("option");

    expect(options.map((option) => option.textContent)).toEqual([
      "All schools",
      "Greenhill Academy Nursery – Kibuli",
      "Greenhill Academy Primary – Kibuli",
      "Greenhill Academy Secondary – Kibuli",
      "Greenhill Academy Nursery – Buwaate",
      "Greenhill Academy Primary – Buwaate",
      "Greenhill International School (GIS) – Kansanga",
    ]);
  });

  it("averages the six schools until a school is chosen", () => {
    render(<AdmissionsEnrollment />);

    expect(screen.getByText(/average of the 6 schools ·/i)).toBeInTheDocument();

    chooseSchool("kibuli-primary");

    expect(screen.queryByText(/average of the 6 schools/i)).toBeNull();
    expect(screen.getByText("Total learners")).toBeInTheDocument();
  });

  it("shows a single control until a school is chosen", () => {
    render(<AdmissionsEnrollment />);

    expect(selectByName("School")).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Year" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Term" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Class" })).toBeNull();
    expect(screen.queryByRole("combobox", { name: "Stream" })).toBeNull();
    expect(screen.queryByLabelText("Find a learner")).toBeNull();

    chooseSchool("kibuli-secondary");

    expect(selectByName("Year")).toBeInTheDocument();
    expect(selectByName("Term")).toBeInTheDocument();
    expect(selectByName("Class")).toBeInTheDocument();
    expect(selectByName("Stream")).toBeInTheDocument();
    expect(screen.getByLabelText("Find a learner")).toBeInTheDocument();
  });

  it("narrows the class options to the levels a campus runs", () => {
    render(<AdmissionsEnrollment />);

    chooseSchool("kibuli-secondary");

    const secondary = selectByName("Class");

    expect(
      within(secondary).getByRole("option", { name: "S.4" }),
    ).toBeInTheDocument();
    expect(
      within(secondary).queryByRole("option", { name: "Top Class" }),
    ).not.toBeInTheDocument();

    chooseSchool("kibuli-nursery");

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

    fireEvent.click(
      screen.getByRole("button", {
        name: /Greenhill Academy Secondary – Kibuli.*Drill down/i,
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Enrolment by class" }),
    ).toBeInTheDocument();
    expect(selectByName("School")).toHaveValue("kibuli-secondary");

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

    fireEvent.change(selectByName("School"), {
      target: { value: "kibuli-secondary" },
    });
    fireEvent.change(selectByName("Class"), { target: { value: "s4" } });

    expect(
      screen.getByRole("heading", { name: "Enrolment by stream" }),
    ).toBeInTheDocument();

    const trail = screen.getByRole("navigation", { name: "Drill-down path" });

    fireEvent.click(within(trail).getAllByRole("button")[0]);

    expect(selectByName("School")).toHaveValue("all");
    expect(screen.queryByRole("combobox", { name: "Class" })).toBeNull();
    expect(
      screen.getByRole("heading", { name: "Enrolment by school" }),
    ).toBeInTheDocument();
  });

  it("lists learners once a stream is selected and opens a learner record", () => {
    render(<AdmissionsEnrollment />);

    fireEvent.change(selectByName("School"), {
      target: { value: "kibuli-secondary" },
    });
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

    chooseSchool("kibuli-secondary");

    fireEvent.change(screen.getByLabelText("Find a learner"), {
      target: { value: "Achieng Mercy" },
    });

    expect(screen.getByRole("status")).toHaveTextContent("Achieng Mercy");
  });
});
