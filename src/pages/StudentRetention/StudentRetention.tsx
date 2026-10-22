
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
  formatNumber,
  rowsForCampus,
  summaryForCampus,
} from "./studentRetention.data";
import { fetchStudentRetention } from "./studentRetention.api";
import type { RetentionDashboardData } from "./studentRetention.api";

import "../../palette.css";
import "./StudentRetention.css";

export function StudentRetention() {
  const [campus, setCampus] = useState<CampusOption>(allCampusesLabel);
  const [data, setData] = useState<RetentionDashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentRetention()
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const summary = data ? summaryForCampus(data, campus) : null;
  const rows = data ? rowsForCampus(data, campus) : [];

  return (
    <div className="sr-page">
      <div className="sr-toolbar">
        <CampusFilter onCampusChange={setCampus} />
      </div>

      {loading && <p>Loading student retention data...</p>}

      {!loading && error && (
        <p role="alert">
          Unable to load retention data: {error}
        </p>
      )}

      {!loading && !error && data && summary && (
        <>
          <div className="sr-metrics">
            <RetentionMetricCard
              label="Total Re-enrolled Students"
              value={formatNumber(summary.reEnrolled)}
              icon={Users}
              tone="navy"
            />

            <RetentionMetricCard
              label="Re-enrollment Rate"
              value={`${summary.rate.toFixed(1)}%`}
              icon={Check}
              tone="sky"
            />

            <RetentionMetricCard
              label="At-Risk Retention"
              value={formatNumber(summary.atRisk)}
              icon={AlertTriangle}
              tone="amber"
            />
          </div>

          <div className="sr-grid">
            <NationalityTableCard rows={rows} />
            <GenderRetentionCard />
          </div>
        </>
      )}
    </div>
  );
}
