import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdmissionsEnrollment } from "./AdmissionsEnrollment";

const selectByName = (name: string) => screen.getByRole("combobox", { name });

describe("AdmissionsEnrollment", () => {
  it("renders the five headline KPI cards", () => {
    render(<AdmissionsEnrollment />);

    const kpis = screen.getByRole("region", { name: "Enrolment summary" });

    expect(within(kpis).getByText("Total learners")).toBeInTheDocument();
    expect(within(kpis).getByText("Opening enrolment")).toBeInTheDocument();
    expect(within(kpis).getByText("New learners")).toBeInTheDocument();
    expect(within(kpis).getByText("Continuing learners")).toBeInTheDocument();
    expect(within(kpis).getByText("Apply → report")).toBeInTheDocument();
  });

  it("exposes every required filter, including learner search", () => {
    render(<AdmissionsEnrollment />);

    expect(selectByName("Year")).toBeInTheDocument();
    expect(selectByName("Term")).toBeInTheDocument();
    expect(selectByName("School")).toBeInTheDocument();
    expect(selectByName("Class")).toBeInTheDocument();
    expect(selectByName("Stream")).toBeInTheDocument();
    expect(screen.getByLabelText("Find a learner")).toBeInTheDocument();
  });

  it("narrows class options to the preschool when the annex school is chosen", () => {
    render(<AdmissionsEnrollment />);

    expect(
      within(selectByName("Class")).getByRole("option", { name: "S.4" }),
    ).toBeInTheDocument();

    fireEvent.change(selectByName("School"), { target: { value: "annex" } });

    const narrowed = selectByName("Class");

    expect(
      within(narrowed).queryByRole("option", { name: "S.4" }),
    ).not.toBeInTheDocument();
    expect(
      within(narrowed).getByRole("option", { name: "Top Class" }),
    ).toBeInTheDocument();
  });

  it("drills from schools to classes and then to streams", () => {
    render(<AdmissionsEnrollment />);

    expect(
      screen.getByRole("heading", { name: "Enrolment by school" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Kibuli Main.*Drill down/i }),
    );

    expect(
      screen.getByRole("heading", { name: "Enrolment by class" }),
    ).toBeInTheDocument();
    expect(selectByName("School")).toHaveValue("kibuli");

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

    fireEvent.change(selectByName("School"), { target: { value: "kibuli" } });
    fireEvent.change(selectByName("Class"), { target: { value: "s4" } });

    expect(
      screen.getByRole("heading", { name: "Enrolment by stream" }),
    ).toBeInTheDocument();

    const trail = screen.getByRole("navigation", { name: "Drill-down path" });

    fireEvent.click(within(trail).getAllByRole("button")[0]);

    expect(selectByName("School")).toHaveValue("all");
    expect(selectByName("Class")).toHaveValue("all");
    expect(
      screen.getByRole("heading", { name: "Enrolment by school" }),
    ).toBeInTheDocument();
  });

  it("lists learners once a stream is selected and opens a learner record", () => {
    render(<AdmissionsEnrollment />);

    fireEvent.change(selectByName("School"), { target: { value: "kibuli" } });
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

    expect(screen.getByRole("button", { name: /Export/ })).toBeEnabled();
  });

  it("raises a banner when a learner search is typed", () => {
    render(<AdmissionsEnrollment />);

    fireEvent.change(screen.getByLabelText("Find a learner"), {
      target: { value: "Achieng Mercy" },
    });

    expect(screen.getByRole("status")).toHaveTextContent("Achieng Mercy");
  });
});
