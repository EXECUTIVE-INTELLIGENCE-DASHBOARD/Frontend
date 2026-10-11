
import { describe, it, expect } from "vitest";
import { render, screen,  } from "@testing-library/react";

import { OutstandingCreditors } from "./OutstandingCreditors";

describe("OutstandingCreditors", () => {
  it("renders the outstanding creditors section", () => {
    render(<OutstandingCreditors />);

    expect(
      screen.getByRole("region", {
        name: "Top 8 Outstanding Creditors",
      }),
    ).toBeInTheDocument();
  });

  it("renders the table with three column headings", () => {
    render(<OutstandingCreditors />);

    expect(
      screen.getByRole("columnheader", {
        name: "Creditor / Entity",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: "Type",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: "Outstanding (UGX)",
      }),
    ).toBeInTheDocument();
  });

  it("renders all eight creditors", () => {
    render(<OutstandingCreditors />);

    const rows = screen.getAllByRole("row");

    // One header row plus eight creditor rows.
    expect(rows).toHaveLength(9);
  });

  it("displays the creditor names", () => {
    render(<OutstandingCreditors />);

    expect(screen.getByText("Stanbic Bank Uganda")).toBeInTheDocument();
    expect(screen.getByText("Uganda Revenue Authority")).toBeInTheDocument();
    expect(screen.getByText("Kampala Textbooks Ltd")).toBeInTheDocument();
    expect(screen.getByText("Britam Insurance")).toBeInTheDocument();
    expect(screen.getByText("City Power & Water")).toBeInTheDocument();
    expect(screen.getByText("NSSF Uganda")).toBeInTheDocument();
    expect(screen.getByText("TotalEnergies Uganda")).toBeInTheDocument();
    expect(screen.getByText("Multichoice / Telecom")).toBeInTheDocument();
  });

  it("displays creditor reference numbers", () => {
    render(<OutstandingCreditors />);

    expect(screen.getByText("Facility Ref #LN-2027")).toBeInTheDocument();
    expect(screen.getByText("Tax Assessment #URA-08")).toBeInTheDocument();
    expect(screen.getByText("PO #KTB-8831")).toBeInTheDocument();
  });

  it("displays the outstanding amounts", () => {
    render(<OutstandingCreditors />);

    expect(screen.getByText("UGX 19.8M")).toBeInTheDocument();
    expect(screen.getByText("UGX 18.5M")).toBeInTheDocument();
    expect(screen.getByText("UGX 15.2M")).toBeInTheDocument();
    expect(screen.getByText("UGX 12.0M")).toBeInTheDocument();
    expect(screen.getByText("UGX 10.0M")).toBeInTheDocument();
    expect(screen.getByText("UGX 8.2M")).toBeInTheDocument();
    expect(screen.getByText("UGX 5.5M")).toBeInTheDocument();
    expect(screen.getByText("UGX 3.8M")).toBeInTheDocument();
  });

  it("displays creditor types", () => {
    render(<OutstandingCreditors />);

    expect(screen.getByText("Lender / Term Loan")).toBeInTheDocument();
    expect(screen.getByText("Statutory Tax (PAYE/WHT)")).toBeInTheDocument();
    expect(screen.getByText("Trade Invoices Payable")).toBeInTheDocument();
    expect(screen.getByText("Service / Insurer")).toBeInTheDocument();
    expect(screen.getByText("Utility Creditor")).toBeInTheDocument();
    expect(screen.getByText("Statutory Remittance")).toBeInTheDocument();
    expect(screen.getByText("Fleet & Generator Fuel")).toBeInTheDocument();
    expect(screen.getByText("IT & Communication")).toBeInTheDocument();
  });
});
