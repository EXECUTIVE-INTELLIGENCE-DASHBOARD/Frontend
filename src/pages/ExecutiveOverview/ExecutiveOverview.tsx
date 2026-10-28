import { useEffect, useState } from "react";

import { OverviewCards } from "../../components/Overview/OverviewCards";
import { OverviewCharts } from "../../components/Overview/OverviewCharts";
import { OverviewInsights } from "../../components/Overview/OverviewInsights";
import {
  CampusFilter,
  type CampusOption,
  type SectionOption,
} from "../../components/filters/CampusFilter";
import {
  admissionStages,
  averageAttendance,
  budgetByCampus,
  campusCodeFor,
  getExecutiveOverviewData,
  staffingHealth,
  type ExecutiveOverviewData,
} from "./executiveOverview.api";
import "./ExecutiveOverview.css";

export function ExecutiveOverview() {
  const [campus, setCampus] = useState<CampusOption>("All Campuses");
  const [section, setSection] = useState<SectionOption>("All Sections");
  const [data, setData] = useState<ExecutiveOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setLoading(true);
    setRequestError(false);

    void getExecutiveOverviewData({ campus, section }, controller.signal)
      .then((overviewData) => {
        if (!controller.signal.aborted) {
          setData(overviewData);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Executive overview request failed:", error);
          setRequestError(true);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [campus, section]);

  const admissions = admissionStages(data?.enrolment ?? null);

  return (
    <main className="executive-overview">
      <div className="executive-overview__filters">
        <CampusFilter
          onCampusChange={setCampus}
          onSectionChange={setSection}
        />
      </div>

      {loading && (
        <p role="status" className="executive-overview__status">
          Loading live overview data…
        </p>
      )}
      {requestError && (
        <p role="alert" className="executive-overview__status">
          The overview data could not be loaded.
        </p>
      )}
      {data && data.errors.length > 0 && (
        <p role="alert" className="executive-overview__status">
          {data.errors.join(" ")}
        </p>
      )}
      {data && data.notices.length > 0 && (
        <p role="status" className="executive-overview__status">
          {data.notices.join(" ")}
        </p>
      )}

      <section
        className="executive-overview__cards"
        aria-label="Executive summary"
      >
        <OverviewCards
          enrolment={data?.enrolment?.summary.total_active_enrolment ?? null}
          attendance={
            campus === "All Campuses" && section === "All Sections" && data?.attendance
              ? averageAttendance(data.attendance)
              : null
          }
          staffing={staffingHealth(data?.establishment ?? null)}
        />
      </section>

      <section
        className="executive-overview__charts"
        aria-label="Budget and admissions analytics"
      >
        <OverviewCharts
          budgetRows={
            section === "All Sections"
              ? budgetByCampus(data?.finance ?? null, campusCodeFor(campus))
              : []
          }
          admissions={admissions}
        />
      </section>

      <section
        className="executive-overview__insights"
        aria-label="Operational insights"
      >
        <OverviewInsights incidents={data?.incidents ?? null} />
      </section>
    </main>
  );
}