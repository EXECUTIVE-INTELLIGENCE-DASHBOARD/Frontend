import { shortDate } from "./facilities.format";
import { TASKS_PER_CAMPUS_PER_DAY } from "./facilities.data";
import type { CleaningDay } from "./facilities.types";

/** Cleaning completion by day: complete, incomplete and no record as separate stacked states. */
export function CleaningChart({ days, campuses }: { days: CleaningDay[]; campuses: number }) {
  if (!days.length) return <p className="fm-muted">No school days in range</p>;
  const total = TASKS_PER_CAMPUS_PER_DAY * campuses;
  const L = 44, B = 122, T = 12, pw = 340 - L - 10;
  const k = (B - T) / total;
  return (
    <svg className="fm-svg" viewBox="0 0 340 172" role="img" aria-label="Cleaning tasks by day: complete, incomplete and no record">
      {[0, 1 / 3, 2 / 3, 1].map((f) => {
        const v = Math.round(total * f);
        const y = B - v * k;
        return (
          <g key={f}>
            <line className="fm-svg__grid" x1={L} x2={330} y1={y} y2={y} />
            <text x={L - 6} y={y + 3} textAnchor="end">{v}</text>
          </g>
        );
      })}
      <line className="fm-svg__axis" x1={L} x2={L} y1={T} y2={B} />
      <line className="fm-svg__axis" x1={L} x2={330} y1={B} y2={B} />
      <text transform="rotate(-90)" x={-67} y={11} textAnchor="middle">Cleaning tasks</text>
      <text x={187} y={166} textAnchor="middle">Date</text>
      {days.map((d, i) => {
        const cx = L + (pw / days.length) * (i + 0.5);
        let y = B;
        const seg = (n: number, cls: string) => {
          const h = n * k;
          y -= h;
          return <rect key={cls} className={cls} x={cx - 17} y={y} width={34} height={h} />;
        };
        return (
          <g key={d.date}>
            {seg(d.complete, "fm-svg__done")}
            {seg(d.incomplete, "fm-svg__partial")}
            {seg(d.missing, "fm-svg__none")}
            <text x={cx} y={138} textAnchor="middle">{shortDate(d.date)}</text>
          </g>
        );
      })}
    </svg>
  );
}
