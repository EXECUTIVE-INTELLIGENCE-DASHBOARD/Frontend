import { ArrowDown } from "lucide-react";

import type { Aggregate } from "./admissionsEnrollment.types";
import { formatNumber, formatPercent, funnelStages } from "./admissionsEnrollment.data";

const stageIds = [
  "applied",
  "qualified",
  "interviewed",
  "accepted",
  "enrolled",
] as const;

interface AdmissionsFunnelProps {
  summary: Aggregate;
  /**
   * `true` when the figures come from the enrollment endpoint. Without it the
   * seeded sample is shown and every stage is drawn as an em dash, because the
   * API is the only source of pipeline counts.
   */
  live?: boolean;
}

export function AdmissionsFunnel({ summary, live = false }: AdmissionsFunnelProps) {
  const stages = funnelStages(summary);

  /* Without live data every stage is unknown, so the whole funnel is dashed. */
  const unavailable: readonly string[] = live ? [] : stageIds;

  const isMissing = (id: string) => unavailable.includes(id);

  return (
    <section className="ae-block" aria-labelledby="ae-funnel-heading">
      <div className="ae-block__head">
        <div>
          <h2 className="ae-block__title" id="ae-funnel-heading">
            Admissions funnel
          </h2>
          <p className="ae-block__sub">From applying to enrolling</p>
        </div>
        <span className="ae-chip">
          {live ? `${formatPercent(summary.conversionRate)} join` : "— join"}
        </span>
      </div>

      <ol className="ae-funnel">
        {stages.map((stage, index) => {
          const previousStage = index === 0 ? stage : stages[index - 1];
          const drop = Math.max(0, previousStage.value - stage.value);
          const dropShare =
            previousStage.value === 0 ? 0 : (drop / previousStage.value) * 100;
          const missing = isMissing(stage.id);

          return (
            <li key={stage.id} className="ae-funnel__item">
              <div className="ae-funnel__row">
                <span className="ae-funnel__label">{stage.label}</span>

                <span className="ae-funnel__track">
                  <span
                    className={`ae-funnel__bar ae-funnel__bar--${index}`}
                    style={{ width: `${Math.max(stage.share, 9)}%` }}
                  >
                    {missing ? "—" : formatNumber(stage.value)}
                  </span>
                </span>

                <span className="ae-funnel__rate">
                  {index === 0 || missing || isMissing(previousStage.id)
                    ? "—"
                    : `${stage.conversion.toFixed(0)}%`}
                </span>
              </div>

              {index > 0 &&
              drop > 0 &&
              !missing &&
              !isMissing(previousStage.id) ? (
                <p className="ae-funnel__drop">
                  <ArrowDown size={9} aria-hidden="true" />
                  <strong>{formatNumber(drop)}</strong> dropped
                  <span>{dropShare.toFixed(0)}%</span>
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="ae-funnel__hint">
        Each percentage compares the stage with the one above it.
      </p>

      <p className="ae-funnel__note">
        {live ? (
          <>
            <strong>
              {formatNumber(Math.max(0, summary.accepted - summary.reported))}
            </strong>{" "}
            accepted but never enrolled
          </>
        ) : (
          <span className="ae-funnel__note-warn">
            Funnel figures unavailable — the API does not report this stage.
          </span>
        )}
      </p>
    </section>
  );
}
