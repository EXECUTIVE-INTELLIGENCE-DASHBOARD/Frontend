import type { Aggregate } from "./admissionsEnrollment.types";
import {
  dataFreshness,
  formatNumber,
  formatPercent,
  funnelStages,
} from "./admissionsEnrollment.data";

interface AdmissionsFunnelProps {
  summary: Aggregate;
}

export function AdmissionsFunnel({ summary }: AdmissionsFunnelProps) {
  const stages = funnelStages(summary);

  return (
    <section className="ae-block" aria-labelledby="ae-funnel-heading">
      <div className="ae-block__head">
        <div>
          <h2 className="ae-block__title" id="ae-funnel-heading">
            Admissions funnel
          </h2>
          <p className="ae-block__sub">
            Applications through to learners who reported
          </p>
        </div>
        <span className="ae-chip">{formatPercent(summary.conversionRate)} join</span>
      </div>

      <ol className="ae-funnel">
        {stages.map((stage, index) => {
          const previous = index === 0 ? stage.value : stages[index - 1].value;
          const drop = Math.max(0, previous - stage.value);

          return (
            <li key={stage.id} className="ae-funnel__item">
              <div className="ae-funnel__row">
                <span className="ae-funnel__label">{stage.label}</span>

                <span className="ae-funnel__bar-wrap">
                  <span
                    className={`ae-funnel__bar ae-funnel__bar--${index}`}
                    style={{ width: `${Math.max(stage.share, 9)}%` }}
                  >
                    {formatNumber(stage.value)}
                  </span>
                </span>

                <span className="ae-funnel__rate">
                  {index === 0 ? "100%" : `${stage.conversion.toFixed(0)}%`}
                </span>
              </div>

              {index > 0 && drop > 0 ? (
                <p className="ae-funnel__drop">
                  −{formatNumber(drop)} lost
                  <span>
                    {((drop / previous) * 100).toFixed(0)}% of the previous stage
                  </span>
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="ae-funnel__note">
        <strong>{formatNumber(summary.accepted - summary.reported)}</strong>{" "}
        offers not taken
        <span aria-hidden="true"> · </span>
        <span className="ae-funnel__note-warn">
          {formatNumber(dataFreshness.missingStageRecords)} stage records
          incomplete
        </span>
      </p>
    </section>
  );
}
