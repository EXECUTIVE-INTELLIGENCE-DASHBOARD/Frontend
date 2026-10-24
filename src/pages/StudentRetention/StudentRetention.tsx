
import { useEffect, useState } from "react";
import { AlertTriangle, Check, Users } from "lucide-react";

import {
  CampusFilter,
  type CampusOption,
} from "../../components/filters/CampusFilter";
import { GenderRetentionCard } from "./GenderRetentionCard";
import { NationalityTableCard } from "./NationalityTableCard";
import { RetentionMetricCard } from "./RetentionMetricCard";
import {
  allCampusesLabel,
  formatMetric,
  formatRate,
  rowsForCampus,
  summaryForCampus,
} from "./studentRetention.data";
import { fetchStudentRetention } from "./studentRetention.api";
import type { RetentionDashboardData } from "./studentRetention.api";
import type { RetentionSummary } from "./studentRetention.types";

import "../../palette.css";
import "./StudentRetention.css";

/** What every card shows before the endpoint answers, or when it fails. */
const unavailableSummary: RetentionSummary = {
  reEnrolled: null,
  rate: null,
  atRisk: null,
};

interface RetentionState {
  data: RetentionDashboardData | null;
  error: string | null;
  isPending: boolean;
}

export function StudentRetention() {
  const [campus, setCampus] = useState<CampusOption>(allCampusesLabel);
  const [state, setState] = useState<RetentionState>({
    data: null,
    error: null,
    isPending: true,
  });

  // One request for the whole dashboard; the campus selector filters the rows
  // the API already returned, so switching campus never re-fetches.
  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setState({ data: null, error: null, isPending: true });

    fetchStudentRetention({}, controller.signal)
      .then((data) => {
        if (active) {
          setState({ data, error: null, isPending: false });
        }
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) {
          return;
        }

        setState({
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
          isPending: false,
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  const { data, error, isPending } = state;

  const summary = data
    ? summaryForCampus(data, campus)
    : unavailableSummary;

  const rows = data ? rowsForCampus(data, campus) : [];
  const reasons = data?.withdrawal_reasons ?? [];
  const withdrawalsTotal = data?.withdrawals_total ?? null;

  return (
    <div className="sr-page">
      <div className="sr-toolbar">
        <CampusFilter onCampusChange={setCampus} />
      </div>

      {isPending ? <p>Loading student retention data...</p> : null}

      {!isPending && error ? (
        <p role="alert">
          Unable to load retention data: {error}
        </p>
      ) : null}

      <div className="sr-metrics">
        <RetentionMetricCard
          label="Total Re-enrolled Students"
          value={formatMetric(summary.reEnrolled)}
          icon={Users}
          tone="navy"
        />

        <RetentionMetricCard
          label="Re-enrollment Rate"
          value={formatRate(summary.rate)}
          icon={Check}
          tone="sky"
        />

        <RetentionMetricCard
          label="At-Risk Retention"
          value={formatMetric(summary.atRisk)}
          icon={AlertTriangle}
          tone="amber"
        />
      </div>

      <div className="sr-grid">
        <NationalityTableCard rows={rows} />
        <GenderRetentionCard reasons={reasons} total={withdrawalsTotal} />
      </div>
    </div>
  );
}
