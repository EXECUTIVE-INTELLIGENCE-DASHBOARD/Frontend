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

import { HrDataCard, HrPill, type HrColumn } from "./HrDataCard";
import { WorkforceMetricCard } from "./WorkforceMetricCard";

import {
  getHrEstablishment,
  getHrExits,
  type HrEstablishmentDepartment,
  type HrExitsResponse,
} from "./hrWorkforce.api";

import {
  attendanceLabel,
  attendanceTarget,
  formatNumber,
} from "./hrWorkforce.data";
import {
  byEmployer,
  daysLeft,
  employerLabel,
  exceedsRating,
  formatDate,
  gslAbsenceLabel,
  gslLocation,
  gslUnits,
  needsImprovementBelow,
  seniors,
} from "./hrTalent.data";
import type {
  EmployerFilter,
  ExitRecord,
  GslUnit,
  SeniorStaff,
} from "./hrTalent.types";

const sum = <T,>(rows: T[], pick: (row: T) => number) =>
  rows.reduce((total, row) => total + pick(row), 0);

/* ---------- GSL rows for the Workforce tab ---------- */

const gslColumns: HrColumn<GslUnit>[] = [
  {
    header: "Department / Unit",
    cell: (u) => <span className="hw-department__name">{u.name}</span>,
    csv: (u) => u.name,
  },
  {
    header: "Nature / Staff Category",
    cell: (u) => <span className="hw-tag">{u.category}</span>,
    csv: (u) => u.category,
  },
  {
    header: "Employer & Location",
    cell: () => <span className="hw-muted">{gslLocation}</span>,
    csv: () => gslLocation,
  },
  {
    header: "Total Headcount",
    cell: (u) => (
      <span className="hw-headcount">
        <strong>{formatNumber(u.headcount)}</strong> <span>Staff</span>
      </span>
    ),
    csv: (u) => u.headcount,
  },
  {
    header: "Attendance Rate",
    cell: (u) => (
      <HrPill tone={u.attendanceRate >= attendanceTarget ? "good" : "warn"}>
        {attendanceLabel(u.attendanceRate)}
      </HrPill>
    ),
    csv: (u) => `${u.attendanceRate.toFixed(1)}%`,
  },
  {
    header: "Absent Rate",
    cell: (u) => (
      <span className="hw-absence hw-absence--neutral">
        {gslAbsenceLabel(u)}
      </span>
    ),
    csv: (u) => gslAbsenceLabel(u),
  },
];

export function GslWorkforceCard() {
  return (
    <HrDataCard
      title="GSL Services & Head Office – Workforce Register"
      columns={gslColumns}
      rows={gslUnits}
      rowKey={(u) => u.id}
      fileName="hr-gsl-workforce"
      scopeLabel="GSL"
    />
  );
}

/* ---------- Establishment ---------- */

type EstablishmentRow = {
  id: string;
  name: string;
  filled: number;
  approved: number | null;
  vacant: number | null;
};

type EstablishmentSummary = {
  approved: number | null;
  filled: number;
  vacant: number | null;
};

const establishmentColumns: HrColumn<EstablishmentRow>[] = [
  {
    header: "Department / Unit",
    cell: (row) => row.name,
    csv: (row) => row.name,
  },
  {
    header: "Approved posts",
    cell: (row) => row.approved ?? "—",
    csv: (row) => row.approved ?? "Not available",
  },
  {
    header: "Filled posts",
    cell: (row) => formatNumber(row.filled),
    csv: (row) => row.filled,
  },
  {
    header: "Vacant posts",
    cell: (row) => row.vacant ?? "—",
    csv: (row) => row.vacant ?? "Not available",
  },
  {
    header: "Fill rate",
    cell: () => "—",
    csv: () => "Not available",
  },
  {
    header: "Status",
    cell: () => <HrPill tone="warn">Approval data unavailable</HrPill>,
    csv: () => "Approval data unavailable",
  },
];

function mapEstablishmentDepartment(
  department: HrEstablishmentDepartment,
  index: number,
): EstablishmentRow {
  return {
    id: String(department.id ?? index),
    name: department.department,
    filled: department.filled_positions,
    approved: department.approved_posts,
    vacant: department.vacant_positions,
  };
}

export function EstablishmentTab({ employer }: { employer: EmployerFilter }) {
  const [departments, setDepartments] = useState<EstablishmentRow[]>([]);
  const [summary, setSummary] = useState<EstablishmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadEstablishment() {
      setLoading(true);
      setError(null);

      try {
        const response = await getHrEstablishment();

        if (!active) return;

        setDepartments(response.departments.map(mapEstablishmentDepartment));

        setSummary({
          approved: response.summary.approved_posts,
          filled: response.summary.filled_positions,
          vacant: response.summary.vacant_positions,
        });
      } catch {
        if (active) {
          setError("Unable to load establishment data. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadEstablishment();

    return () => {
      active = false;
    };
  }, [retryCount]);

  if (loading) {
    return (
      <p className="hw-status" role="status">
        Loading establishment data…
      </p>
    );
  }

  if (error) {
    return (
      <div className="hw-status hw-status--error" role="alert">
        <p>{error}</p>
        <button
          type="button"
          className="hw-button"
          onClick={() => setRetryCount((count) => count + 1)}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return (
      <p className="hw-status" role="status">
        No establishment data is available.
      </p>
    );
  }

  if (employer === "gsl") {
    return (
      <p className="hw-status" role="status">
        GSL establishment figures are not provided separately by the existing
        establishment endpoint.
      </p>
    );
  }

  return (
    <>
      <div className="hw-metrics">
        <WorkforceMetricCard
          label="Approved Positions"
          value={
            summary.approved === null ? "—" : formatNumber(summary.approved)
          }
          icon={Briefcase}
          tone="sky"
        />
        <WorkforceMetricCard
          label="Filled Positions"
          value={formatNumber(summary.filled)}
          icon={Check}
          tone="slate"
        />
        <WorkforceMetricCard
          label="Vacancies"
          value={summary.vacant === null ? "—" : formatNumber(summary.vacant)}
          icon={TriangleAlert}
          tone="amber"
        />
      </div>

      <p className="hw-status" role="status">
        Approved-post and vacancy figures are not available in the current
        backend data. Fill rates and vacancy status cannot be calculated
        reliably until approved-post figures are populated.
      </p>

      <HrDataCard
        title="Approved vs Filled Positions"
        columns={establishmentColumns}
        rows={departments}
        rowKey={(row) => row.id}
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

const exitColumns: HrColumn<ExitRecord>[] = [
  { header: "Staff member", cell: (r) => r.name, csv: (r) => r.name },
  { header: "Role", cell: (r) => r.role, csv: (r) => r.role },
  {
    header: "Unit / Outlet",
    cell: (r) => <span className="hw-muted">{r.unit}</span>,
    csv: (r) => r.unit,
  },
  {
    header: "Exit date",
    cell: (r) => formatDate(r.date),
    csv: (r) => r.date,
  },
  { header: "Reason", cell: (r) => r.reason, csv: (r) => r.reason },
  {
    header: "Exit type",
    cell: (r) => (
      <HrPill
        tone={
          r.type === "Involuntary"
            ? "bad"
            : r.type === "Voluntary"
              ? "warn"
              : "good"
        }
      >
        {r.type}
      </HrPill>
    ),
    csv: (r) => r.type,
  },
];

const contractTone = (days: number): ["good" | "warn" | "bad", string] =>
  days <= 90
    ? ["bad", "Due soon"]
    : days <= 180
      ? ["warn", "Within 6 months"]
      : ["good", "Active"];

const contractColumns: HrColumn<SeniorStaff>[] = [
  { header: "Staff member", cell: (r) => r.name, csv: (r) => r.name },
  { header: "Position", cell: (r) => r.position, csv: (r) => r.position },
  {
    header: "Contract end",
    cell: (r) => formatDate(r.contractEnd),
    csv: (r) => r.contractEnd,
  },
  {
    header: "Days left",
    cell: (r) => daysLeft(r.contractEnd),
    csv: (r) => daysLeft(r.contractEnd),
  },
  {
    header: "Renewal status",
    cell: (r) => (
      <HrPill
        tone={
          r.renewal === "Not yet due"
            ? "good"
            : r.renewal === "Under review"
              ? "warn"
              : "good"
        }
      >
        {r.renewal}
      </HrPill>
    ),
    csv: (r) => r.renewal,
  },
  {
    header: "Time to end",
    cell: (r) => {
      const [tone, label] = contractTone(daysLeft(r.contractEnd));

      return <HrPill tone={tone}>{label}</HrPill>;
    },
    csv: (r) => contractTone(daysLeft(r.contractEnd))[1],
  },
];

const bandFor = (rating: number): ["good" | "warn" | "bad", string] =>
  rating >= exceedsRating
    ? ["good", "Exceeds expectations"]
    : rating >= needsImprovementBelow
      ? ["warn", "Meets expectations"]
      : ["bad", "Needs improvement"];

const ratingColumns: HrColumn<SeniorStaff>[] = [
  { header: "Staff member", cell: (r) => r.name, csv: (r) => r.name },
  { header: "Position", cell: (r) => r.position, csv: (r) => r.position },
  {
    header: "Score (out of 5)",
    cell: (r) => r.rating.toFixed(1),
    csv: (r) => r.rating.toFixed(1),
  },
  {
    header: "Band",
    cell: (r) => {
      const [tone, label] = bandFor(r.rating);

      return <HrPill tone={tone}>{label}</HrPill>;
    },
    csv: (r) => bandFor(r.rating)[1],
  },
  {
    header: "Last review",
    cell: (r) => r.lastReview,
    csv: (r) => r.lastReview,
  },
];

export function TalentTab({ employer }: { employer: EmployerFilter }) {
  const [view, setView] = useState<TalentView>("exits");
  const [exitData, setExitData] = useState<HrExitsResponse | null>(null);
  const [loadingExits, setLoadingExits] = useState(true);
  const [exitError, setExitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const scope = employerLabel(employer);

  useEffect(() => {
    let active = true;

    async function loadExits() {
      setLoadingExits(true);
      setExitError(null);

      try {
        const response = await getHrExits();

        if (active) {
          setExitData(response);
        }
      } catch {
        if (active) {
          setExitError("Unable to load staff exits. Please try again.");
        }
      } finally {
        if (active) {
          setLoadingExits(false);
        }
      }
    }

    void loadExits();

    return () => {
      active = false;
    };
  }, [retryCount]);

  const seniorRows = seniors.filter(byEmployer(employer));

  const byDueDate = [...seniorRows].sort(
    (a, b) => daysLeft(a.contractEnd) - daysLeft(b.contractEnd),
  );

  const byRating = [...seniorRows].sort((a, b) => b.rating - a.rating);

  const averageRating = seniorRows.length
    ? sum(seniorRows, (r) => r.rating) / seniorRows.length
    : 0;

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
            <p className="hw-status" role="status">
              Loading staff exits…
            </p>
          )}

          {exitError && (
            <div className="hw-status hw-status--error" role="alert">
              <p>{exitError}</p>
              <button
                type="button"
                className="hw-button"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Retry
              </button>
            </div>
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

              <p className="hw-status" role="status">
                Reporting period: {formatDate(exitData.start)} –{" "}
                {formatDate(exitData.end)}.
                {exitData.completeness?.leavers_without_exit_date
                  ? ` ${exitData.completeness.leavers_without_exit_date} leaver records do not have an exit date.`
                  : ""}
              </p>

              <HrDataCard
                title="Staff Exits & Turnover"
                columns={exitColumns}
                rows={[]}
                rowKey={(row) => row.id}
                fileName="hr-exits"
                scopeLabel={scope}
              />
            </>
          )}
        </>
      )}

      {view === "contracts" && (
        <>
          <div className="hw-metrics">
            <WorkforceMetricCard
              label="Senior Staff"
              value={formatNumber(byDueDate.length)}
              icon={Users}
              tone="sky"
            />
            <WorkforceMetricCard
              label="Contracts Ending ≤ 90 Days"
              value={formatNumber(
                byDueDate.filter((r) => daysLeft(r.contractEnd) <= 90).length,
              )}
              icon={Clock}
              tone="slate"
            />
            <WorkforceMetricCard
              label="Renewals Pending"
              value={formatNumber(
                byDueDate.filter((r) => r.renewal !== "Not yet due").length,
              )}
              icon={Briefcase}
              tone="amber"
            />
          </div>

          <HrDataCard
            title="Senior Contract End Dates & Renewals"
            columns={contractColumns}
            rows={byDueDate}
            rowKey={(r) => r.id}
            fileName="hr-contracts"
            scopeLabel={scope}
          />
        </>
      )}

      {view === "ratings" && (
        <>
          <div className="hw-metrics">
            <WorkforceMetricCard
              label="Average Rating"
              value={averageRating ? `${averageRating.toFixed(1)} / 5` : "—"}
              icon={Star}
              tone="sky"
            />
            <WorkforceMetricCard
              label="Exceeds Expectations"
              value={formatNumber(
                byRating.filter((r) => r.rating >= exceedsRating).length,
              )}
              icon={TrendingUp}
              tone="slate"
            />
            <WorkforceMetricCard
              label="Needs Improvement"
              value={formatNumber(
                byRating.filter((r) => r.rating < needsImprovementBelow).length,
              )}
              icon={TriangleAlert}
              tone="amber"
            />
          </div>

          <HrDataCard
            title="Performance Ratings – Board-Appointed Senior Staff"
            columns={ratingColumns}
            rows={byRating}
            rowKey={(r) => r.id}
            fileName="hr-ratings"
            scopeLabel={scope}
          />
        </>
      )}
    </>
  );
}
