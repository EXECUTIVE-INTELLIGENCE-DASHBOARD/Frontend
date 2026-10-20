
import type { CampusOption } from "../filters/CampusFilter";
import "./LiabilityAgeingAnalysis.css";

interface LiabilityAgeingAnalysisProps {
  campus?: CampusOption;
}

interface AgeingBucket {
  label: string;
  amount: number;
  description: string;
}

const ageingByCampus: Record<string, AgeingBucket[]> = {
  "All Campuses": [
    { label: "Current", amount: 130.2, description: "Not yet overdue" },
    { label: "1–30 days", amount: 6.1, description: "Recently overdue" },
    { label: "31–60 days", amount: 3.0, description: "Requires follow-up" },
    { label: "61–90 days", amount: 2.0, description: "Priority follow-up" },
    { label: "Over 90 days", amount: 1.2, description: "Urgent review" },
  ],
  Kibuli: [
    { label: "Current", amount: 57.2, description: "Not yet overdue" },
    { label: "1–30 days", amount: 2.2, description: "Recently overdue" },
    { label: "31–60 days", amount: 1.3, description: "Requires follow-up" },
    { label: "61–90 days", amount: 1.0, description: "Priority follow-up" },
    { label: "Over 90 days", amount: 0.8, description: "Urgent review" },
  ],
  Buwaate: [
    { label: "Current", amount: 29.0, description: "Not yet overdue" },
    { label: "1–30 days", amount: 0.9, description: "Recently overdue" },
    { label: "31–60 days", amount: 0.5, description: "Requires follow-up" },
    { label: "61–90 days", amount: 0.4, description: "Priority follow-up" },
    { label: "Over 90 days", amount: 0.2, description: "Urgent review" },
  ],
  "Kansanga International": [
    { label: "Current", amount: 44.0, description: "Not yet overdue" },
    { label: "1–30 days", amount: 2.3, description: "Recently overdue" },
    { label: "31–60 days", amount: 1.2, description: "Requires follow-up" },
    { label: "61–90 days", amount: 0.9, description: "Priority follow-up" },
    { label: "Over 90 days", amount: 0.6, description: "Urgent review" },
  ],
};

const formatAmount = (amount: number) =>
  `UGX ${amount.toLocaleString("en-UG", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}M`;

export function LiabilityAgeingAnalysis({
  campus = "All Campuses",
}: LiabilityAgeingAnalysisProps) {
  const buckets =
    ageingByCampus[String(campus)] ?? ageingByCampus["All Campuses"];

  const total = buckets.reduce((sum, bucket) => sum + bucket.amount, 0);
  const overdueTotal = buckets
    .filter((bucket) => bucket.label !== "Current")
    .reduce((sum, bucket) => sum + bucket.amount, 0);

  return (
    <section
      className="liability-ageing"
      aria-labelledby="liability-ageing-title"
    >
      <div className="liability-ageing__header">
        <div>
          <h2 id="liability-ageing-title">Liability Ageing Analysis</h2>
          <p>Outstanding balances grouped by how long they have been due.</p>
        </div>
        <div className="liability-ageing__total">
          <span>Total analysed</span>
          <strong>{formatAmount(total)}</strong>
        </div>
      </div>

      <div className="liability-ageing__rows">
        {buckets.map((bucket) => {
          const percentage = total > 0 ? (bucket.amount / total) * 100 : 0;
          const isOverdue = bucket.label !== "Current";

          return (
            <div className="liability-ageing__row" key={bucket.label}>
              <div className="liability-ageing__row-heading">
                <div>
                  <span
                    className={`liability-ageing__dot ${
                      isOverdue ? "liability-ageing__dot--overdue" : ""
                    }`}
                  />
                  <strong>{bucket.label}</strong>
                  <span className="liability-ageing__description">
                    {bucket.description}
                  </span>
                </div>
                <strong>{formatAmount(bucket.amount)}</strong>
              </div>

              <div
                className="liability-ageing__track"
                role="progressbar"
                aria-label={`${bucket.label} share of liabilities`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Number(percentage.toFixed(1))}
              >
                <span
                  className={`liability-ageing__bar ${
                    isOverdue ? "liability-ageing__bar--overdue" : ""
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="liability-ageing__footer">
        <span>Overdue balance</span>
        <strong>{formatAmount(overdueTotal)}</strong>
      </div>
    </section>
  );
}
