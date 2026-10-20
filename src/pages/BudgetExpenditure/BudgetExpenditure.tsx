
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Wallet,
} from "lucide-react";

import { campusOptions } from "../../lib/organisation";
import "./BudgetExpenditure.css";

type BudgetRow = {
  id: string;
  department: string;
  budget: number;
  actual: number;
};

type CampusRow = {
  id: string;
  campus: string;
  budget: number;
  actual: number;
};

// Illustrative figures only. Amounts are in UGX millions.
// Replace these values when verified finance data is available.
const departmentBudgets: BudgetRow[] = [
  { id: "academics", department: "Academics", budget: 220, actual: 140 },
  { id: "boarding", department: "Boarding", budget: 140, actual: 82 },
  { id: "admin", department: "Administration & HR", budget: 100, actual: 60 },
  { id: "transport", department: "Transport", budget: 70, actual: 73 },
  { id: "ict", department: "ICT & Technology", budget: 60, actual: 30 },
  { id: "sports", department: "Sports & Co-curricular", budget: 45, actual: 18 },
  { id: "health", department: "Health Services", budget: 35, actual: 10 },
  { id: "facilities", department: "Facilities & Maintenance", budget: 30, actual: 5 },
];

const campusBudgets: CampusRow[] = [
  { id: "kibuli", campus: "Kibuli Main", budget: 320, actual: 190 },
  { id: "buwaate", campus: "Buwaate", budget: 210, actual: 128 },
  { id: "kansanga", campus: "Kansanga International", budget: 170, actual: 100 },
];

const totalBudget = departmentBudgets.reduce((sum, row) => sum + row.budget, 0);
const totalActual = departmentBudgets.reduce((sum, row) => sum + row.actual, 0);
const remainingBudget = totalBudget - totalActual;
const utilisation = (totalActual / totalBudget) * 100;

const formatMoney = (value: number) =>
  `UGX ${value.toLocaleString("en-UG", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}M`;

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export function BudgetExpenditure() {
  const [selectedCampus, setSelectedCampus] = useState("All Campuses");

  const visibleCampusRows = useMemo(() => {
    if (selectedCampus === "All Campuses") return campusBudgets;

    const selected = selectedCampus.toLowerCase();

    return campusBudgets.filter(
      (row) =>
        row.campus.toLowerCase() === selected ||
        row.campus.toLowerCase().includes(selected) ||
        selected.includes(row.campus.toLowerCase()),
    );
  }, [selectedCampus]);

  const visibleDepartments = useMemo(() => {
    if (selectedCampus === "All Campuses") return departmentBudgets;

    // Department totals are institution-wide until campus-level departmental
    // allocations are connected. Do not imply they are campus-specific.
    return departmentBudgets;
  }, [selectedCampus]);

  const displayedBudget =
    selectedCampus === "All Campuses"
      ? totalBudget
      : visibleCampusRows.reduce((sum, row) => sum + row.budget, 0);

  const displayedActual =
    selectedCampus === "All Campuses"
      ? totalActual
      : visibleCampusRows.reduce((sum, row) => sum + row.actual, 0);

  const displayedRemaining = displayedBudget - displayedActual;
  const displayedUtilisation =
    displayedBudget > 0 ? (displayedActual / displayedBudget) * 100 : 0;

  const overBudgetDepartments = visibleDepartments.filter(
    (row) => row.actual > row.budget,
  );

  return (
    <div className="budget-page">

      <header className="budget-heading">

        <label className="budget-campus-filter">
          <select
            value={selectedCampus}
            onChange={(event) => setSelectedCampus(event.target.value)}
          >
            <option value="All Campuses">All Campuses</option>
            {campusOptions
              .filter((campus) => campus !== "All Campuses")
              .map((campus) => (
                <option key={campus} value={campus}>
                  {campus}
                </option>
              ))}
          </select>
        </label>
      </header>

      <section className="budget-kpis" aria-label="Budget summary">
        <article className="budget-kpi budget-kpi--navy">
          <div className="budget-kpi__top">
            <span className="budget-kpi__label">Approved Budget</span>
            <span className="budget-kpi__icon"><Wallet size={19} /></span>
          </div>
          <strong className="budget-kpi__value">
            {formatMoney(displayedBudget)}
          </strong>
          <span className="budget-kpi__hint">Budget available for the selected view</span>
        </article>

        <article className="budget-kpi budget-kpi--cyan">
          <div className="budget-kpi__top">
            <span className="budget-kpi__label">Actual Expenditure</span>
            <span className="budget-kpi__icon"><ArrowUpRight size={19} /></span>
          </div>
          <strong className="budget-kpi__value">
            {formatMoney(displayedActual)}
          </strong>
          <span className="budget-kpi__hint">Recorded spend in the illustrative dataset</span>
        </article>

        <article className="budget-kpi budget-kpi--gold">
          <div className="budget-kpi__top">
            <span className="budget-kpi__label">Remaining Budget</span>
            <span className="budget-kpi__icon"><ArrowDownRight size={19} /></span>
          </div>
          <strong className="budget-kpi__value">
            {formatMoney(displayedRemaining)}
          </strong>
          <span className="budget-kpi__hint">Budget less actual expenditure</span>
        </article>

        <article className="budget-kpi budget-kpi--purple">
          <div className="budget-kpi__top">
            <span className="budget-kpi__label">Budget Utilisation</span>
            <span className="budget-kpi__icon"><CheckCircle2 size={19} /></span>
          </div>
          <strong className="budget-kpi__value">
            {formatPercent(displayedUtilisation)}
          </strong>
          <div className="budget-kpi__progress">
            <span style={{ width: `${Math.min(displayedUtilisation, 100)}%` }} />
          </div>
          <span className="budget-kpi__hint">Actual expenditure as a share of budget</span>
        </article>
      </section>

      <section className="budget-panel">
        <div className="budget-panel__header">
          <div>
            <h2>Departmental Budget Performance</h2>
            <p>Compare approved allocations against expenditure.</p>
          </div>
          <div className="budget-legend">
            <span><i className="budget-legend__budget" /> Budget</span>
            <span><i className="budget-legend__actual" /> Actual</span>
          </div>
        </div>

        <div className="budget-departments">
          {visibleDepartments.map((row) => {
            const spendRate = (row.actual / row.budget) * 100;
            const isOverBudget = row.actual > row.budget;

            return (
              <div className="budget-department" key={row.id}>
                <div className="budget-department__top">
                  <span className="budget-department__name">
                    {row.department}
                  </span>
                  <span className="budget-department__amounts">
                    <strong>{formatMoney(row.actual)}</strong>
                    <span>of {formatMoney(row.budget)}</span>
                  </span>
                </div>

                <div
                  className="budget-bar"
                  role="img"
                  aria-label={`${row.department}: ${formatMoney(row.actual)} actual expenditure against ${formatMoney(row.budget)} budget`}
                >
                  <span
                    className={`budget-bar__actual ${
                      isOverBudget ? "budget-bar__actual--over" : ""
                    }`}
                    style={{ width: `${Math.min(spendRate, 100)}%` }}
                  />
                </div>

                <div className="budget-department__bottom">
                  <span className={isOverBudget ? "budget-status budget-status--over" : "budget-status"}>
                    {isOverBudget ? "Over budget" : "Within allocation"}
                  </span>
                  <span>{formatPercent(spendRate)} utilised</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="budget-panel">
        <div className="budget-panel__header">
          <div>
            <h2>Campus Budget Performance</h2>
            <p>Institution-level allocation and expenditure by campus.</p>
          </div>
        </div>

        {visibleCampusRows.length > 0 ? (
          <div className="budget-table-wrap">
            <table className="budget-table">
              <thead>
                <tr>
                  <th>Campus</th>
                  <th>Approved Budget</th>
                  <th>Actual Expenditure</th>
                  <th>Remaining</th>
                  <th>Utilisation</th>
                </tr>
              </thead>
              <tbody>
                {visibleCampusRows.map((row) => {
                  const remaining = row.budget - row.actual;
                  const rate = (row.actual / row.budget) * 100;

                  return (
                    <tr key={row.id}>
                      <td className="budget-table__campus">{row.campus}</td>
                      <td>{formatMoney(row.budget)}</td>
                      <td>{formatMoney(row.actual)}</td>
                      <td>{formatMoney(remaining)}</td>
                      <td>
                        <div className="budget-table__utilisation">
                          <span>{formatPercent(rate)}</span>
                          <div className="budget-table__track">
                            <span style={{ width: `${Math.min(rate, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="budget-empty">
            No sample allocation matches this campus selection. Campus-level
            figures need to be mapped to the organisation's campus names.
          </p>
        )}
      </section>

      <section className="budget-insights">
        <div className="budget-insights__icon">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h2>Executive Attention</h2>
          {overBudgetDepartments.length > 0 ? (
            <>
              <p>
                <strong>
                  {overBudgetDepartments.map((row) => row.department).join(", ")}
                </strong>{" "}
                {overBudgetDepartments.length === 1 ? "is" : "are"} above the
                illustrative allocation. Review commitments and confirm whether
                a budget adjustment is required.
              </p>
              <p className="budget-insights__detail">
                The over-budget amount is based on sample figures and should not
                be used as an operational alert until real finance data is connected.
              </p>
            </>
          ) : (
            <p>
              No departmental overspend is shown in this selection. Review the
              figures against approved budgets and the reporting period before
              making decisions.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
