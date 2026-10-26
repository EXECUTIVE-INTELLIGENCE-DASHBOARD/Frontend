import { useEffect, useState } from "react";
import {
  Briefcase,
  Check,
  Clock,
  LogOut,
  Star,
  TriangleAlert,
  TrendingUp,
  Users,
} from "lucide-react";

import { HrDataCard, type HrColumn } from "./HrDataCard";
import { WorkforceMetricCard } from "./WorkforceMetricCard";
import { formatNumber } from "./hrWorkforce.data";
import {
  getHrEstablishment,
  getHrExits,
  type HrEstablishmentDepartment,
  type HrEstablishmentResponse,
  type HrExitRecord,
  type HrExitsResponse,
} from "./hrWorkforce.api";
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

function formatOptionalNumber(value: number | null | undefined): string {
  return value == null ? "—" : formatNumber(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
        backend data. No unit headcounts or attendance figures are displayed
        until they can be retrieved from a reliable source.
      </p>
    </section>
  );
}

/* ---------- Establishment ---------- */

const establishmentColumns: HrColumn<HrEstablishmentDepartment>[] = [
  {
    header: "Department",
    cell: (row) => row.department,
    csv: (row) => row.department,
  },
  {
    header: "Staff category",
    cell: (row) =>
      row.staff_category_display || row.staff_category || "Not available",
    csv: (row) =>
      row.staff_category_display || row.staff_category || "Not available",
  },
  {
    header: "Approved posts",
    cell: (row) =>
      row.approved_posts == null
        ? "Approval data unavailable"
        : formatNumber(row.approved_posts),
    csv: (row) => row.approved_posts ?? "Not available",
  },
  {
    header: "Filled posts",
    cell: (row) => formatNumber(row.filled_positions),
    csv: (row) => row.filled_positions,
  },
  {
    header: "Vacant posts",
    cell: (row) =>
      row.vacant_positions == null ? "—" : formatNumber(row.vacant_positions),
    csv: (row) => row.vacant_positions ?? "Not available",
  },
  {
    header: "Over establishment",
    cell: (row) =>
      row.over_establishment == null
        ? "—"
        : formatNumber(row.over_establishment),
    csv: (row) => row.over_establishment ?? "Not available",
  },
];

export function EstablishmentTab({ employer }: { employer: EmployerFilter }) {
  const [data, setData] = useState<HrEstablishmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(false);

    getHrEstablishment()
      .then((response) => {
        if (active) setData(response);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <StatusMessage>Loading establishment data…</StatusMessage>;
  }

  if (error || !data) {
    return (
      <StatusMessage>
        Establishment data could not be loaded. Please try again later.
      </StatusMessage>
    );
  }

  const summary = data.summary;
  const rows = data.departments;

  return (
    <>
      <div className="hw-metrics">
        <WorkforceMetricCard
          label="Approved Positions"
          value={formatOptionalNumber(summary.approved_posts)}
          icon={Briefcase}
          tone="sky"
        />
        <WorkforceMetricCard
          label="Filled Positions"
          value={formatNumber(summary.filled_positions)}
          icon={Check}
          tone="slate"
        />
        <WorkforceMetricCard
          label="Vacancies"
          value={formatOptionalNumber(summary.vacant_positions)}
          icon={TriangleAlert}
          tone="amber"
        />
      </div>

      {summary.departments_without_approved_posts > 0 && (
        <p className="hw-muted">
          Approved-post information is unavailable for{" "}
          {summary.departments_without_approved_posts} departments. Vacancy
          figures cannot be reliably calculated for those departments.
        </p>
      )}

      <HrDataCard
        title="Approved vs Filled Positions"
        columns={establishmentColumns}
        rows={rows}
        rowKey={(row) => String(row.id)}
        fileName="hr-establishment"
        scopeLabel={employerLabel(employer)}
      />
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

const exitColumns: HrColumn<HrExitRecord>[] = [
  {
    header: "Staff member",
    cell: (row) => row.full_name || row.staff_number || "Not available",
    csv: (row) => row.full_name || row.staff_number || "Not available",
  },
  {
    header: "Role",
    cell: (row) => row.job_title || "Not available",
    csv: (row) => row.job_title || "Not available",
  },
  {
    header: "Unit / Outlet",
    cell: (row) => row.unit_name || "Not available",
    csv: (row) => row.unit_name || "Not available",
  },
  {
    header: "Exit date",
    cell: (row) => formatDate(row.exit_date),
    csv: (row) => row.exit_date || "Not available",
  },
  {
    header: "Reason",
    cell: (row) => row.exit_reason_display || row.exit_reason || "Not recorded",
    csv: (row) => row.exit_reason_display || row.exit_reason || "Not recorded",
  },
];

export function TalentTab({ employer }: { employer: EmployerFilter }) {
  const [view, setView] = useState<TalentView>("exits");
  const [exitData, setExitData] = useState<HrExitsResponse | null>(null);
  const [loadingExits, setLoadingExits] = useState(false);
  const [exitError, setExitError] = useState(false);

  useEffect(() => {
    if (view !== "exits") return;

    let active = true;

    setLoadingExits(true);
    setExitError(false);

    getHrExits()
      .then((response) => {
        if (active) setExitData(response);
      })
      .catch(() => {
        if (active) setExitError(true);
      })
      .finally(() => {
        if (active) setLoadingExits(false);
      });

    return () => {
      active = false;
    };
  }, [view, employer]);

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
        <>
          {loadingExits && (
            <StatusMessage>Loading staff exits and turnover…</StatusMessage>
          )}

          {exitError && (
            <StatusMessage>
              Staff exits data could not be loaded. Please try again later.
            </StatusMessage>
          )}

          {!loadingExits && !exitError && exitData && (
            <>
              <div className="hw-metrics">
                <WorkforceMetricCard
                  label="Staff Exits"
                  value={formatNumber(exitData.summary.staff_exits)}
                  icon={LogOut}
                  tone="sky"
                />
                <WorkforceMetricCard
                  label="Turnover Rate"
                  value={`${exitData.summary.turnover_rate.toFixed(1)}%`}
                  icon={TrendingUp}
                  tone="slate"
                />
                <WorkforceMetricCard
                  label="Voluntary Exits"
                  value={formatNumber(exitData.summary.voluntary_exits)}
                  icon={Users}
                  tone="amber"
                />
              </div>

              <p className="hw-muted">
                Reporting period: {formatDate(exitData.start)} –{" "}
                {formatDate(exitData.end)}.
                {exitData.completeness?.leavers_without_exit_date
                  ? ` ${exitData.completeness.leavers_without_exit_date} leaver records do not have an exit date recorded.`
                  : ""}
              </p>

              <HrDataCard
                title="Staff Exits & Turnover"
                columns={exitColumns}
                rows={[]}
                rowKey={(row) =>
                  String(row.id ?? row.staff_number ?? row.full_name)
                }
                fileName="hr-exits"
                scopeLabel={employerLabel(employer)}
              />

              {exitData.total_exits === 0 && (
                <p className="hw-muted">
                  The API reports no exits for this reporting period. Individual
                  exit records are not available in the current response.
                </p>
              )}
            </>
          )}
        </>
      )}

      {view === "contracts" && (
        <section className="hw-card">
          <div className="hw-card__header">
            <h2 className="hw-card__title">
              <span className="hw-card__dot" aria-hidden="true" />
              Senior Contract End Dates &amp; Renewals
            </h2>
          </div>
          <p className="hw-empty">
            Contract end dates and renewal statuses are not provided by the
            current HR API. This section will display them when a reliable
            backend source becomes available.
          </p>
          <div className="hw-metrics">
            <WorkforceMetricCard
              label="Senior Staff"
              value="—"
              icon={Users}
              tone="sky"
            />
            <WorkforceMetricCard
              label="Contracts Ending ≤ 90 Days"
              value="—"
              icon={Clock}
              tone="slate"
            />
            <WorkforceMetricCard
              label="Renewals Pending"
              value="—"
              icon={Briefcase}
              tone="amber"
            />
          </div>
        </section>
      )}

      {view === "ratings" && (
        <section className="hw-card">
          <div className="hw-card__header">
            <h2 className="hw-card__title">
              <span className="hw-card__dot" aria-hidden="true" />
              Performance Ratings – Board-Appointed Senior Staff
            </h2>
          </div>
          <p className="hw-empty">
            Performance ratings and review dates are not provided by the current
            HR API. No staff scores or rating bands are shown because those
            figures cannot be verified from the available data.
          </p>
          <div className="hw-metrics">
            <WorkforceMetricCard
              label="Average Rating"
              value="—"
              icon={Star}
              tone="sky"
            />
            <WorkforceMetricCard
              label="Exceeds Expectations"
              value="—"
              icon={TrendingUp}
              tone="slate"
            />
            <WorkforceMetricCard
              label="Needs Improvement"
              value="—"
              icon={TriangleAlert}
              tone="amber"
            />
          </div>
        </section>
      )}
    </>
  );
}
