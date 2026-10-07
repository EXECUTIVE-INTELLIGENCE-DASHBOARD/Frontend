import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  it("renders the main EID navigation areas", () => {
    render(<Sidebar />);

    expect(screen.getByRole("navigation")).toBeInTheDocument();

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Academics")).toBeInTheDocument();
    expect(screen.getByText("Finance & Procurement")).toBeInTheDocument();
    expect(screen.getByText("Operational")).toBeInTheDocument();
    expect(screen.getByText("Strategic KPIs")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
  });

  it("shows Academics dropdown items when Academics is clicked", async () => {
    const user = userEvent.setup();

    render(<Sidebar />);

    await user.click(
      screen.getByRole("button", { name: /academics/i }),
    );

    expect(
      screen.getByText("Academic Overview"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Student Enrollment"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Attendance Rates"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Academic Performance"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Parent Access (My Child's Progress)"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Library & Resource Usage"),
    ).toBeInTheDocument();
  });

  it("hides Academics dropdown items when Academics is clicked again", async () => {
    const user = userEvent.setup();

    render(<Sidebar />);

    const academicsButton = screen.getByRole("button", {
      name: /academics/i,
    });

    await user.click(academicsButton);

    expect(
      screen.getByText("Academic Overview"),
    ).toBeInTheDocument();

    await user.click(academicsButton);

    expect(
      screen.queryByText("Academic Overview"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Student Enrollment"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Attendance Rates"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Academic Performance"),
    ).not.toBeInTheDocument();
  });

  it("shows Operational dropdown items when Operational is clicked", async () => {
    const user = userEvent.setup();

    render(<Sidebar />);

    await user.click(
      screen.getByRole("button", { name: /operational/i }),
    );

    expect(
      screen.getByText("Operational Overview"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Facilities & Maintenance"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Fleet & Transport"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("ICT Systems"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Asset Management"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Work Orders"),
    ).toBeInTheDocument();
  });

  it("shows Services dropdown items when Services is clicked", async () => {
    const user = userEvent.setup();

    render(<Sidebar />);

    await user.click(
      screen.getByRole("button", { name: /services/i }),
    );

    expect(
      screen.getByText("Service Overview"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Open Incidents"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Open Service Requests"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("SLA Compliance"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Resolution Times"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Escalation Rates"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Customer Satisfaction"),
    ).toBeInTheDocument();
  });

  it("closes the current section when another section is opened", async () => {
    const user = userEvent.setup();

    render(<Sidebar />);

    const academicsButton = screen.getByRole("button", {
      name: /academics/i,
    });

    const operationalButton = screen.getByRole("button", {
      name: /operational/i,
    });

    await user.click(academicsButton);

    expect(
      screen.getByText("Academic Overview"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Student Enrollment"),
    ).toBeInTheDocument();

    await user.click(operationalButton);

    expect(
      screen.queryByText("Academic Overview"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Student Enrollment"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("Operational Overview"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Facilities & Maintenance"),
    ).toBeInTheDocument();
  });
});