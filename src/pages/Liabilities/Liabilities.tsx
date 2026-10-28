import { useEffect, useMemo, useState } from "react";

import { LiabilitiesComposition } from "../../components/liabilities/LiabilitiesComposition";
import { LiabilitiesSummary } from "../../components/liabilities/LiabilitiesSummary";
import { LiabilityManagementDetails } from "../../components/liabilities/LiabilityManagementDetails";
import { LiabilityLoans } from "../../components/liabilities/LiabilityLoans";
import { OutstandingCreditors } from "../../components/liabilities/OutstandingCreditors";
import { UpcomingPaymentObligations } from "../../components/liabilities/UpcomingPaymentObligations";
import {
  getLiabilitiesApiData,
  type LiabilitiesApiData,
} from "./liabilities.api";
import { buildLiabilitiesDashboard } from "./liabilitiesDashboard";
import "./Liabilities.css";

interface FilterOption {
  value: string;
  label: string;
}

function getCampusOptions(
  schools: LiabilitiesApiData["schools"],
): FilterOption[] {
  return Array.from(
    new Map(
      schools.map((school) => [
        school.campus,
        school.campus_display || school.campus,
      ]),
    ),
    ([value, label]) => ({ value, label }),
  );
}

function getSectionOptions(
  schools: LiabilitiesApiData["schools"],
  campus: string,
): FilterOption[] {
  const levels = schools
    .filter((school) => !campus || school.campus === campus)
    .map((school) => school.level);

  return Array.from(new Set(levels), (value) => ({
    value,
    label: value
      .replace(/_/g, " ")
      .replace(/^\w/, (letter) => letter.toUpperCase()),
  }));
}

export function Liabilities() {
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [data, setData] = useState<LiabilitiesApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    void getLiabilitiesApiData(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Failed to load liability dashboard data:", requestError);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not load liability data.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [retryCount]);

  const model = useMemo(
    () =>
      data
        ? buildLiabilitiesDashboard(data, selectedCampus, selectedSection)
        : null,
    [data, selectedCampus, selectedSection],
  );
  const campuses = useMemo(
    () => (data ? getCampusOptions(data.schools) : []),
    [data],
  );
  const sections = useMemo(
    () => (data ? getSectionOptions(data.schools, selectedCampus) : []),
    [data, selectedCampus],
  );

  return (
    <main className="liabilities-page">
      <header className="liabilities-page__header">
        <div className="liabilities-page__filter">
          <div
            className="liabilities-page__filters"
            aria-label="Liability filters"
          >
            <label className="liabilities-page__filter-field">
              <span>Campus</span>
              <div className="liabilities-page__select-wrapper">
                <select
                  aria-label="Campus filter"
                  value={selectedCampus}
                  disabled={!data || campuses.length === 0}
                  onChange={(event) => {
                    setSelectedCampus(event.target.value);
                    setSelectedSection("");
                  }}
                >
                  <option value="">All Campuses</option>
                  {campuses.map((campus) => (
                    <option key={campus.value} value={campus.value}>
                      {campus.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label className="liabilities-page__filter-field">
              <span>Section</span>
              <div className="liabilities-page__select-wrapper">
                <select
                  aria-label="Section filter"
                  value={selectedSection}
                  disabled={!data || sections.length === 0}
                  onChange={(event) => setSelectedSection(event.target.value)}
                >
                  <option value="">All Sections</option>
                  {sections.map((section) => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
        </div>
      </header>

      {loading && (
        <p className="liabilities-page__state" role="status">
          Loading liability data…
        </p>
      )}

      {error && (
        <div className="liabilities-page__error" role="alert">
          <span>{error}</span>
          <button
            className="liabilities-page__retry"
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {model && (
        <>
          <section
            className="liabilities-page__summary"
            aria-label="Liabilities overview"
          >
            <LiabilitiesSummary metrics={model.metrics} />
          </section>

          <LiabilityManagementDetails model={model} />

          <section
            className="liabilities-page__details"
            aria-label="Liabilities details"
          >
            <LiabilitiesComposition categories={model.categories} />
            <OutstandingCreditors creditors={model.topCreditors} />
          </section>

          <section
            className="liabilities-page__obligations"
            aria-label="Upcoming payment obligations"
          >
            <UpcomingPaymentObligations
              payments={model.statutoryPayments}
              total={model.upcomingTotal}
            />
          </section>

          <LiabilityLoans loans={model.loans} />
        </>
      )}
    </main>
  );
}
