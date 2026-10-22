import { useMemo, useState } from "react";

import type { Aggregate } from "./admissionsEnrollment.types";
import { formatNumber, formatPercent } from "./admissionsEnrollment.data";

type ProfileDimension = "gender" | "age" | "mode" | "faith" | "nationality";

const dimensions: Array<{ id: ProfileDimension; label: string }> = [
  { id: "gender", label: "Gender" },
  { id: "age", label: "Age" },
  { id: "mode", label: "Day / boarding" },
  { id: "faith", label: "Faith" },
  { id: "nationality", label: "Nationality" },
];

interface ProfilePanelProps {
  summary: Aggregate;
}

export function ProfilePanel({ summary }: ProfilePanelProps) {
  const [dimension, setDimension] = useState<ProfileDimension>("gender");

  const items = useMemo(() => {
    const rows =
      dimension === "gender"
        ? [
            { id: "girls", label: "Girls", value: summary.girls },
            { id: "boys", label: "Boys", value: summary.boys },
          ]
        : dimension === "age"
          ? summary.byAge.map((figure) => ({
              id: figure.id,
              label: figure.label,
              value: figure.value,
            }))
          : dimension === "mode"
            ? [
                { id: "day", label: "Day", value: summary.day },
                { id: "boarding", label: "Boarding", value: summary.boarding },
              ]
            : dimension === "faith"
              ? summary.byReligion.map((figure) => ({
                  id: figure.id,
                  label: figure.label,
                  value: figure.value,
                }))
              : summary.byNationality.map((figure) => ({
                  id: figure.id,
                  label: figure.label,
                  value: figure.value,
                }));

    const peak = rows.reduce((max, row) => Math.max(max, row.value), 0);

    return rows
      .filter((row) => row.value > 0)
      .map((row) => ({
        ...row,
        share: summary.learners === 0 ? 0 : (row.value / summary.learners) * 100,
        width: peak === 0 ? 0 : (row.value / peak) * 100,
      }));
  }, [dimension, summary]);

  const activeLabel =
    dimensions.find((entry) => entry.id === dimension)?.label ?? "Gender";

  return (
    <section className="ae-block" aria-labelledby="ae-profile-heading">
      <div className="ae-block__head">
        <div>
          <h2 className="ae-block__title" id="ae-profile-heading">
            Who the learners are
          </h2>
          <p className="ae-block__sub">
            {formatNumber(summary.learners)} learners in the current scope
          </p>
        </div>
        <span className="ae-chip">{activeLabel}</span>
      </div>

      <div className="ae-seg" role="group" aria-label="Learner profile dimension">
        {dimensions.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`ae-seg__button${
              entry.id === dimension ? " ae-seg__button--active" : ""
            }`}
            aria-pressed={entry.id === dimension}
            onClick={() => setDimension(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <ul className="ae-barlist ae-barlist--wide">
        {items.map((item) => (
          <li key={item.id} className="ae-barlist__item">
            <div className="ae-barlist__head">
              <span className="ae-barlist__label">{item.label}</span>
              <span className="ae-barlist__value">
                {formatNumber(item.value)}
                <span className="ae-barlist__share">
                  {formatPercent(item.share)}
                </span>
              </span>
            </div>
            <div className="ae-barlist__track" aria-hidden="true">
              <span
                className="ae-barlist__fill"
                style={{ width: `${Math.max(item.width, 1.5)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
