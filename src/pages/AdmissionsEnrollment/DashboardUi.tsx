import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { formatNumber, formatPercent } from "./admissionsEnrollment.data";

/* ------------------------------------------------------------------ KPI card */

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  tone?: "navy" | "sky" | "green" | "amber";
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "navy",
}: KpiCardProps) {
  return (
    <article className={`ae-kpi ae-kpi--${tone}`}>
      <span className="ae-kpi__icon" aria-hidden="true">
        <Icon size={13} />
      </span>

      <div className="ae-kpi__body">
        <span className="ae-kpi__label" title={label}>
          {label}
        </span>

        <strong className="ae-kpi__value">{value}</strong>

        <span className="ae-kpi__detail" title={detail}>
          {detail}
        </span>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------- Bar list */

export interface BarListItem {
  id: string;
  label: string;
  value: number;
  share: number;
}

interface BarListProps {
  items: BarListItem[];
  totalLabel?: string;
  tone?: "navy" | "sky" | "green" | "amber" | "muted";
}

export function BarList({
  items,
  totalLabel,
  tone = "navy",
}: BarListProps) {
  return (
    <ul className="ae-barlist">
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
              className={`ae-barlist__fill ae-barlist__fill--${tone}`}
              style={{ width: `${Math.max(item.share, 1.5)}%` }}
            />
          </div>
        </li>
      ))}
      {totalLabel ? <li className="ae-barlist__note">{totalLabel}</li> : null}
    </ul>
  );
}

/* --------------------------------------------------------------- Split bar */

interface SplitBarProps {
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
  total: number;
}

export function SplitBar({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  total,
}: SplitBarProps) {
  const leftShare = total === 0 ? 0 : (leftValue / total) * 100;

  return (
    <div className="ae-split">
      <div
        className="ae-split__track"
        role="img"
        aria-label={`${leftLabel} ${formatNumber(leftValue)}, ${rightLabel} ${formatNumber(rightValue)}`}
      >
        <span
          className="ae-split__part ae-split__part--left"
          style={{ width: `${leftShare}%` }}
        />
        <span
          className="ae-split__part ae-split__part--right"
          style={{ width: `${100 - leftShare}%` }}
        />
      </div>
      <div className="ae-split__legend">
        <span className="ae-split__legend-item">
          <span className="ae-swatch ae-swatch--navy" aria-hidden="true" />
          {leftLabel} <strong>{formatNumber(leftValue)}</strong>
        </span>
        <span className="ae-split__legend-item">
          <span className="ae-swatch ae-swatch--sky" aria-hidden="true" />
          {rightLabel} <strong>{formatNumber(rightValue)}</strong>
        </span>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- Status pill */

export function StatusPill({
  tone,
  children,
}: {
  tone: "positive" | "warning" | "critical" | "neutral";
  children: ReactNode;
}) {
  return <span className={`ae-pill ae-pill--${tone}`}>{children}</span>;
}

/* -------------------------------------------------------------------- Notice */

export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warning" | "critical";
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={`ae-notice ae-notice--${tone}`}>
      <p className="ae-notice__title">{title}</p>
      <p className="ae-notice__body">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ Table bits */

export function ProgressBar({
  value,
  tone = "navy",
}: {
  value: number;
  tone?: "navy" | "sky" | "amber" | "green";
}) {
  return (
    <span className="ae-progress" aria-hidden="true">
      <span
        className={`ae-progress__fill ae-progress__fill--${tone}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </span>
  );
}
