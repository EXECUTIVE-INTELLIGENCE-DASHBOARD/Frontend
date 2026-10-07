import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExecutiveOverview } from "./ExecutiveOverview";

describe("ExecutiveOverview", () => {
  it("renders the CEO overview heading", () => {
    render(<ExecutiveOverview />);

    expect(
      screen.getByRole("heading", { name: "CEO Overview" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/across\s+all campuses\./),
    ).toBeInTheDocument();
  });

  it("renders the headline executive metrics", () => {
    render(<ExecutiveOverview />);

    expect(screen.getByText("Total Enrolment")).toBeInTheDocument();
    expect(screen.getByText("2,800")).toBeInTheDocument();

    expect(screen.getByText("Avg. Attendance (YTD)")).toBeInTheDocument();
    expect(screen.getByText("94.5%")).toBeInTheDocument();

    expect(screen.getByText("Staffing Health")).toBeInTheDocument();
    expect(screen.getByText("98% Filled")).toBeInTheDocument();
  });

  it("renders the budget, pipeline, safety and facilities cards", () => {
    render(<ExecutiveOverview />);

    expect(
      screen.getByRole("heading", { name: /FYD Budget vs\. Actual/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Application Conversion Funnel/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /Incidents & Disciplinary Cases \(YTD\)/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Orders & Capital Projects/i }),
    ).toBeInTheDocument();
  });

  it("lists open orders and the resolution rate", () => {
    render(<ExecutiveOverview />);

    expect(screen.getByText("HWC Central")).toBeInTheDocument();
    expect(screen.getByText("Lab Power Grid 5")).toBeInTheDocument();

    expect(screen.getByText("Resolution Rate")).toBeInTheDocument();
    expect(screen.getByText("96.5%")).toBeInTheDocument();
  });
});
