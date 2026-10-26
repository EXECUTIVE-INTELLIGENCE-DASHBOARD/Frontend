import { useEffect, useState } from "react";
import { Users } from "lucide-react";

import { HrDataCard, type HrColumn } from "./HrDataCard";
import { WorkforceMetricCard } from "./WorkforceMetricCard";
import { formatNumber } from "./hrWorkforce.data";
import { getHrEmployees, type HrEmployee } from "./hrWorkforce.api";
import { employerLabel } from "./hrTalent.data";
import type { EmployerFilter } from "./hrTalent.types";

type StatusMessageProps = {
  children: React.ReactNode;
};

function StatusMessage({ children }: StatusMessageProps) {
  return (
    <div className="hw-card" role="status">
      <p className="hw-empty">{children}</p>
    </div>
  );
}

/* ---------- GSL workforce ---------- */

export function GslWorkforceCard() {
  return (
    <section className="hw-card">
      <div className="hw-card__header">
        <h2 className="hw-card__title">
          <span className="hw-card__dot" aria-hidden="true" />
          GSL Services &amp; Head Office – Workforce Register
        </h2>
      </div>

      <p className="hw-empty">
        GSL-specific workforce records are not available from the current
        backend data.
      </p>
    </section>
  );
}

/* ---------- Employee records ---------- */

const employeeColumns: HrColumn<HrEmployee>[] = [
  {
    header: "Staff number",
    cell: (row) => row.staff_number || "Not available",
    csv: (row) => row.staff_number || "Not available",
  },
  {
    header: "Staff member",
    cell: (row) => row.full_name,
    csv: (row) => row.full_name,
  },
  {
    header: "Unit",
    cell: (row) => row.unit_name || "Not available",
    csv: (row) => row.unit_name || "Not available",
  },
  {
    header: "Job title",
    cell: (row) => row.job_title || "Not available",
    csv: (row) => row.job_title || "Not available",
  },
  {
    header: "Employment type",
    cell: (row) => row.employment_type || "Not available",
    csv: (row) => row.employment_type || "Not available",
  },
  {
    header: "Hire date",
    cell: (row) => row.hire_date || "Not available",
    csv: (row) => row.hire_date || "Not available",
  },
  {
    header: "Status",
    cell: (row) => (row.is_active ? "Active" : "Inactive"),
    csv: (row) => (row.is_active ? "Active" : "Inactive"),
  },
];

export function EstablishmentTab({ employer }: { employer: EmployerFilter }) {
  const [employees, setEmployees] = useState<HrEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(false);

    getHrEmployees()
      .then((response) => {
        if (active) {
          setEmployees(response);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <StatusMessage>Loading employee records…</StatusMessage>;
  }

  if (error) {
    return (
      <StatusMessage>
        Employee records could not be loaded. Please try again later.
      </StatusMessage>
    );
  }

  return (
    <>
      <div className="hw-metrics">
        <WorkforceMetricCard
          label="Employee Records"
          value={formatNumber(employees.length)}
          icon={Users}
          tone="sky"
        />
      </div>

      {employees.length === 0 ? (
        <StatusMessage>
          No employee records were returned by the API.
        </StatusMessage>
      ) : (
        <HrDataCard
          title="Employee Register"
          columns={employeeColumns}
          rows={employees}
          rowKey={(row) => String(row.id)}
          fileName="hr-employee-register"
          scopeLabel={employerLabel(employer)}
        />
      )}
    </>
  );
}

/* ---------- Talent: exits, contracts, ratings ---------- */

type TalentView = "exits" | "contracts" | "ratings";

const talentViews: Array<[TalentView, string]> = [
  ["exits", "Exits & Turnover"],
  ["contracts", "Contracts"],
  ["ratings", "Ratings"],
];

export function TalentTab() {
  const [view, setView] = useState<TalentView>("exits");

  return (
    <>
      <div
        className="hr-tabs hr-tabs--sub"
        role="tablist"
        aria-label="Talent views"
      >
        {talentViews.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={view === key}
            className="hr-tab"
            onClick={() => setView(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "exits" && (
        <section className="hw-card">
          <div className="hw-card__header">
            <h2 className="hw-card__title">
              <span className="hw-card__dot" aria-hidden="true" />
              Staff Exits &amp; Turnover
            </h2>
          </div>
          <p className="hw-empty">
            Individual staff exit dates, exit reasons, and turnover figures
            cannot be retrieved from the registered HR endpoints currently
            available in the backend.
          </p>
        </section>
      )}

      {view === "contracts" && (
        <section className="hw-card">
          <div className="hw-card__header">
            <h2 className="hw-card__title">
              <span className="hw-card__dot" aria-hidden="true" />
              Contract End Dates &amp; Renewals
            </h2>
          </div>
          <p className="hw-empty">
            Contract end dates and renewal statuses are not available in the
            current employee model and API response.
          </p>
        </section>
      )}

      {view === "ratings" && (
        <section className="hw-card">
          <div className="hw-card__header">
            <h2 className="hw-card__title">
              <span className="hw-card__dot" aria-hidden="true" />
              Staff Performance Ratings
            </h2>
          </div>
          <p className="hw-empty">
            Employee performance ratings and review dates are not available in
            the current HR model and API response.
          </p>
        </section>
      )}
    </>
  );
}
