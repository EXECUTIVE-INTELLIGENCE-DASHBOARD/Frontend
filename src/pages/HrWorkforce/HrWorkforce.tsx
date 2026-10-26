import { useEffect, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  Scale,
  Users,
} from "lucide-react";

import {
  CampusFilter,
  type CampusOption,
} from "../../components/filters/CampusFilter";
import { WorkforceMetricCard } from "./WorkforceMetricCard";
import { WorkforceTableCard } from "./WorkforceTableCard";
import { EstablishmentTab, GslWorkforceCard, TalentTab } from "./HrTalentTabs";
import { formatNumber } from "./hrWorkforce.data";
import {
  getHrWorkforceDashboard,
  type HrWorkforceDashboard,
} from "./hrWorkforce.api";
import { defaultEmployer, employerOptions } from "./hrTalent.data";
import type { EmployerFilter } from "./hrTalent.types";

import "../../palette.css";
import "./HrWorkforce.css";
import "./HrTabs.css";

type Tab = "workforce" | "establishment" | "talent";

const tabs: Array<[Tab, string]> = [
  ["workforce", "Workforce"],
  ["establishment", "Establishment"],
  ["talent", "Talent"],
];

const ALL_CAMPUSES = "All Campuses";

function campusApiValue(campus: CampusOption): string | undefined {
  const value = String(campus).trim().toLowerCase();

  if (value === "all campuses") return undefined;
  if (value.includes("kibuli")) return "kibuli";
  if (value.includes("buwaate") || value.includes("buwate")) {
    return "buwaate";
  }
  if (value.includes("annex") || value === "gis") return "gis";

  throw new Error(`Unrecognized HR campus selection: ${campus}`);
}

function formatReportingDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function HrWorkforce() {
  const [tab, setTab] = useState<Tab>("workforce");
  const [campus, setCampus] = useState<CampusOption>(
    ALL_CAMPUSES as CampusOption,
  );
  const [employer, setEmployer] = useState<EmployerFilter>(defaultEmployer);

  const [dashboard, setDashboard] = useState<HrWorkforceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const result = await getHrWorkforceDashboard({
          campus: campusApiValue(campus),
        });

        if (active) setDashboard(result);
      } catch {
        if (active) {
          setError(
            "Unable to load workforce data. Please check your connection and try again.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [campus, retryCount]);

  const showSchools = employer !== "gsl";
  const showGsl =
    employer === "gsl" ||
    (employer === "all" && String(campus) === ALL_CAMPUSES);

  const summary = dashboard?.summary;
  const reportingPeriod = dashboard
    ? `${formatReportingDate(dashboard.start)} – ${formatReportingDate(dashboard.end)}`
    : "Loading reporting period…";

  return (
    <div className="hw-page">
      <div className="hr-bar">
        <div className="hr-tabs" role="tablist" aria-label="HR sections">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className="hr-tab"
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="hw-toolbar">
        <span className="hw-period">
          <CalendarDays size={14} aria-hidden="true" />
          {reportingPeriod}
        </span>

        <div className="hw-select">
          <select
            aria-label="Employer"
            className="hw-select__field"
            value={employer}
            onChange={(event) =>
              setEmployer(event.target.value as EmployerFilter)
            }
          >
            {employerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown size={14} aria-hidden="true" />
        </div>

        {tab === "workforce" && showSchools && (
          <CampusFilter onCampusChange={setCampus} />
        )}
      </div>

      {tab === "workforce" && (
        <>
          {showSchools && (
            <>
              {loading && (
                <p className="hw-status" role="status">
                  Loading workforce data…
                </p>
              )}

              {!loading && error && (
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
              )}

              {!loading && !error && summary && (
                <>
                  <div className="hw-metrics">
                    <WorkforceMetricCard
                      label="Total Staff"
                      value={formatNumber(summary.total_staff)}
                      icon={Users}
                      tone="sky"
                    />

                    <WorkforceMetricCard
                      label="Staffing Ratio"
                      value={summary.staffing_ratio_display || "—"}
                      icon={Scale}
                      tone="slate"
                    />

                    <WorkforceMetricCard
                      label="Workforce Attendance"
                      value={
                        summary.workforce_attendance_rate == null
                          ? "—"
                          : `${summary.workforce_attendance_rate.toFixed(1)}%`
                      }
                      icon={CalendarCheck}
                      tone="amber"
                    />
                  </div>

                  <WorkforceTableCard units={dashboard?.units ?? []} />
                </>
              )}
            </>
          )}

          {showGsl && <GslWorkforceCard />}
        </>
      )}

      {tab === "establishment" && <EstablishmentTab employer={employer} />}

      {tab === "talent" && <TalentTab />}
    </div>
  );
}
