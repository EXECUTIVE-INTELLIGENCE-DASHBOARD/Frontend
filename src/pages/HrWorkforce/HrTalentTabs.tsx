import { useState } from "react";
import { Briefcase, Check, Clock, LogOut, Star, TriangleAlert, TrendingUp, Users } from "lucide-react";

import { HrDataCard, HrPill, type HrColumn } from "./HrDataCard";
import { WorkforceMetricCard } from "./WorkforceMetricCard";
import { attendanceLabel, attendanceTarget, formatNumber } from "./hrWorkforce.data";
import {
  byEmployer,
  daysLeft,
  employerLabel,
  establishment,
  exceedsRating,
  exits,
  fillRate,
  formatDate,
  gslAbsenceLabel,
  gslLocation,
  gslUnits,
  headcountFor,
  needsImprovementBelow,
  seniors,
} from "./hrTalent.data";
import type { EmployerFilter, EstablishmentRow, ExitRecord, GslUnit, SeniorStaff } from "./hrTalent.types";

const sum = <T,>(rows: T[], pick: (row: T) => number) => rows.reduce((total, row) => total + pick(row), 0);

/* ---------- GSL rows for the Workforce tab ---------- */

const gslColumns: HrColumn<GslUnit>[] = [
  { header: "Department / Unit", cell: (u) => <span className="hw-department__name">{u.name}</span>, csv: (u) => u.name },
  { header: "Nature / Staff Category", cell: (u) => <span className="hw-tag">{u.category}</span>, csv: (u) => u.category },
  { header: "Employer & Location", cell: () => <span className="hw-muted">{gslLocation}</span>, csv: () => gslLocation },
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
      <HrPill tone={u.attendanceRate >= attendanceTarget ? "good" : "warn"}>{attendanceLabel(u.attendanceRate)}</HrPill>
    ),
    csv: (u) => `${u.attendanceRate.toFixed(1)}%`,
  },
  {
    header: "Absent Rate",
    cell: (u) => <span className="hw-absence hw-absence--neutral">{gslAbsenceLabel(u)}</span>,
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

const statusFor = (row: EstablishmentRow): ["good" | "warn" | "bad", string] => {
  const rate = fillRate(row);

  return rate >= 100 ? ["good", "Fully filled"] : rate >= 80 ? ["warn", "Vacancies open"] : ["bad", "Critical gap"];
};

const establishmentColumns: HrColumn<EstablishmentRow>[] = [
  { header: "Unit / Subject area", cell: (r) => r.name, csv: (r) => r.name },
  { header: "Employer & Location", cell: (r) => <span className="hw-muted">{r.location}</span>, csv: (r) => r.location },
  { header: "Approved posts", cell: (r) => r.approved, csv: (r) => r.approved },
  { header: "Filled posts", cell: (r) => r.filled, csv: (r) => r.filled },
  { header: "Vacant posts", cell: (r) => r.approved - r.filled, csv: (r) => r.approved - r.filled },
  { header: "Fill rate", cell: (r) => `${fillRate(r)}%`, csv: (r) => `${fillRate(r)}%` },
  {
    header: "Status",
    cell: (r) => {
      const [tone, label] = statusFor(r);

      return <HrPill tone={tone}>{label}</HrPill>;
    },
    csv: (r) => statusFor(r)[1],
  },
];

export function EstablishmentTab({ employer }: { employer: EmployerFilter }) {
  const rows = establishment.filter(byEmployer(employer));
  const approved = sum(rows, (r) => r.approved);
  const filled = sum(rows, (r) => r.filled);

  return (
    <>
      <div className="hw-metrics">
        <WorkforceMetricCard label="Approved Positions" value={formatNumber(approved)} icon={Briefcase} tone="sky" />
        <WorkforceMetricCard label="Filled Positions" value={formatNumber(filled)} icon={Check} tone="slate" />
        <WorkforceMetricCard label="Vacancies" value={formatNumber(approved - filled)} icon={TriangleAlert} tone="amber" />
      </div>

      <HrDataCard
        title="Approved vs Filled Positions"
        columns={establishmentColumns}
        rows={rows}
        rowKey={(r) => r.id}
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
  { header: "Unit / Outlet", cell: (r) => <span className="hw-muted">{r.unit}</span>, csv: (r) => r.unit },
  { header: "Exit date", cell: (r) => formatDate(r.date), csv: (r) => r.date },
  { header: "Reason", cell: (r) => r.reason, csv: (r) => r.reason },
  {
    header: "Exit type",
    cell: (r) => <HrPill tone={r.type === "Involuntary" ? "bad" : r.type === "Voluntary" ? "warn" : "good"}>{r.type}</HrPill>,
    csv: (r) => r.type,
  },
];

const contractTone = (days: number): ["good" | "warn" | "bad", string] =>
  days <= 90 ? ["bad", "Due soon"] : days <= 180 ? ["warn", "Within 6 months"] : ["good", "Active"];

const contractColumns: HrColumn<SeniorStaff>[] = [
  { header: "Staff member", cell: (r) => r.name, csv: (r) => r.name },
  { header: "Position", cell: (r) => r.position, csv: (r) => r.position },
  { header: "Contract end", cell: (r) => formatDate(r.contractEnd), csv: (r) => r.contractEnd },
  { header: "Days left", cell: (r) => daysLeft(r.contractEnd), csv: (r) => daysLeft(r.contractEnd) },
  {
    header: "Renewal status",
    cell: (r) => (
      <HrPill tone={r.renewal === "Not yet due" ? "good" : r.renewal === "Under review" ? "warn" : "good"}>{r.renewal}</HrPill>
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
  { header: "Score (out of 5)", cell: (r) => r.rating.toFixed(1), csv: (r) => r.rating.toFixed(1) },
  {
    header: "Band",
    cell: (r) => {
      const [tone, label] = bandFor(r.rating);

      return <HrPill tone={tone}>{label}</HrPill>;
    },
    csv: (r) => bandFor(r.rating)[1],
  },
  { header: "Last review", cell: (r) => r.lastReview, csv: (r) => r.lastReview },
];

export function TalentTab({ employer }: { employer: EmployerFilter }) {
  const [view, setView] = useState<TalentView>("exits");
  const scope = employerLabel(employer);

  const exitRows = exits.filter(byEmployer(employer));
  const seniorRows = seniors.filter(byEmployer(employer));
  const byDueDate = [...seniorRows].sort((a, b) => daysLeft(a.contractEnd) - daysLeft(b.contractEnd));
  const byRating = [...seniorRows].sort((a, b) => b.rating - a.rating);

  const turnover = (exitRows.length / headcountFor(employer)) * 100;
  const averageRating = seniorRows.length ? sum(seniorRows, (r) => r.rating) / seniorRows.length : 0;

  return (
    <>
      <div className="hr-tabs hr-tabs--sub" role="tablist" aria-label="Talent views">
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
          <div className="hw-metrics">
            <WorkforceMetricCard label="Staff Exits" value={formatNumber(exitRows.length)} icon={LogOut} tone="sky" />
            <WorkforceMetricCard label="Turnover Rate" value={`${turnover.toFixed(1)}%`} icon={TrendingUp} tone="slate" />
            <WorkforceMetricCard
              label="Voluntary Exits"
              value={formatNumber(exitRows.filter((r) => r.type === "Voluntary").length)}
              icon={Users}
              tone="amber"
            />
          </div>
          <HrDataCard title="Staff Exits & Turnover" columns={exitColumns} rows={exitRows} rowKey={(r) => r.id} fileName="hr-exits" scopeLabel={scope} />
        </>
      )}

      {view === "contracts" && (
        <>
          <div className="hw-metrics">
            <WorkforceMetricCard label="Senior Staff" value={formatNumber(byDueDate.length)} icon={Users} tone="sky" />
            <WorkforceMetricCard
              label="Contracts Ending ≤ 90 Days"
              value={formatNumber(byDueDate.filter((r) => daysLeft(r.contractEnd) <= 90).length)}
              icon={Clock}
              tone="slate"
            />
            <WorkforceMetricCard
              label="Renewals Pending"
              value={formatNumber(byDueDate.filter((r) => r.renewal !== "Not yet due").length)}
              icon={Briefcase}
              tone="amber"
            />
          </div>
          <HrDataCard title="Senior Contract End Dates & Renewals" columns={contractColumns} rows={byDueDate} rowKey={(r) => r.id} fileName="hr-contracts" scopeLabel={scope} />
        </>
      )}

      {view === "ratings" && (
        <>
          <div className="hw-metrics">
            <WorkforceMetricCard label="Average Rating" value={averageRating ? `${averageRating.toFixed(1)} / 5` : "—"} icon={Star} tone="sky" />
            <WorkforceMetricCard
              label="Exceeds Expectations"
              value={formatNumber(byRating.filter((r) => r.rating >= exceedsRating).length)}
              icon={TrendingUp}
              tone="slate"
            />
            <WorkforceMetricCard
              label="Needs Improvement"
              value={formatNumber(byRating.filter((r) => r.rating < needsImprovementBelow).length)}
              icon={TriangleAlert}
              tone="amber"
            />
          </div>
          <HrDataCard title="Performance Ratings – Board-Appointed Senior Staff" columns={ratingColumns} rows={byRating} rowKey={(r) => r.id} fileName="hr-ratings" scopeLabel={scope} />
        </>
      )}
    </>
  );
}
