import type { ClassGroup, ResultsPoint } from "./attendance.types";

const f1 = (n: number) => n.toFixed(1);

/** Attendance by class: columns with a target mark. Click or press Enter to filter by class. */
export function ClassBarChart({ groups, onSelect }: { groups: ClassGroup[]; onSelect: (cls: string) => void }) {
  const W = 520, H = 250, L = 58, R = 14, T = 24, B = 64;
  const pw = W - L - R, ph = H - T - B;
  const y = (v: number) => T + ph - ((Math.min(100, Math.max(70, v)) - 70) / 30) * ph;
  const bw = Math.min(54, (pw / Math.max(groups.length, 1)) * 0.55);
  return (
    <svg className="at-svg" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Attendance rate by class">
      {[70, 80, 90, 100].map((g) => (
        <g key={g}>
          <line className="at-svg__grid" x1={L} x2={W - R} y1={y(g)} y2={y(g)} />
          <text x={L - 8} y={y(g) + 3} textAnchor="end">{g}</text>
        </g>
      ))}
      <line className="at-svg__axis" x1={L} x2={L} y1={T} y2={T + ph} />
      <line className="at-svg__axis" x1={L} x2={W - R} y1={T + ph} y2={T + ph} />
      <text transform="rotate(-90)" x={-(T + ph / 2)} y={14} textAnchor="middle">Attendance rate (%)</text>
      <text x={L + pw / 2} y={H - 6} textAnchor="middle">Class</text>
      {groups.map((g, i) => {
        const cx = L + (pw / groups.length) * (i + 0.5);
        const x = cx - bw / 2;
        const top = y(g.rate);
        const low = g.rate < g.target;
        const [first, ...rest] = g.cls.split(" ");
        return (
          <g
            key={g.cls}
            className="at-svg__col"
            role="button"
            tabIndex={0}
            aria-label={`${g.cls} ${f1(g.rate)} percent`}
            onClick={() => onSelect(g.cls)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(g.cls);
              }
            }}
          >
            <rect className={low ? "at-svg__bar at-svg__bar--low" : "at-svg__bar"} x={x} y={top} width={bw} height={T + ph - top} rx={5} />
            <line className="at-svg__target" x1={x - 6} x2={x + bw + 6} y1={y(g.target)} y2={y(g.target)} />
            <text className="at-svg__value" x={cx} y={top - 6} textAnchor="middle">{f1(g.rate)}%{low ? " ▼" : ""}</text>
            <text x={cx} y={T + ph + 16} textAnchor="middle">{first}</text>
            {rest.length > 0 && <text x={cx} y={T + ph + 28} textAnchor="middle">{rest.join(" ")}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/** Weekly attendance line with the target as a dashed line. */
export function WeeklyChart({ points, target }: { points: number[]; target: number }) {
  const y = (v: number) => 120 - (v - 70) * 3.4;
  const x = (i: number) => 56 + i * 38;
  return (
    <svg className="at-svg" viewBox="0 0 340 170" role="img" aria-label="Weekly attendance">
      {[70, 80, 90, 100].map((g) => (
        <g key={g}>
          <line className="at-svg__grid" x1={44} x2={332} y1={y(g)} y2={y(g)} />
          <text x={38} y={y(g) + 3} textAnchor="end">{g}</text>
        </g>
      ))}
      <line className="at-svg__axis" x1={44} x2={44} y1={y(100)} y2={120} />
      <line className="at-svg__axis" x1={44} x2={332} y1={120} y2={120} />
      <text transform="rotate(-90)" x={-69} y={11} textAnchor="middle">Attendance (%)</text>
      <text x={188} y={164} textAnchor="middle">Week</text>
      <line className="at-svg__goal" x1={44} x2={332} y1={y(target)} y2={y(target)} />
      <polyline className="at-svg__line" points={points.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
      {points.map((v, i) => (
        <g key={i}>
          <circle className={v < target ? "at-svg__dot at-svg__dot--low" : "at-svg__dot"} cx={x(i)} cy={y(v)} r={3.5} />
          <text x={x(i)} y={135} textAnchor="middle">{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

/** Attendance columns (left axis) with the average score line (right axis). */
export function ResultsChart({ data }: { data: ResultsPoint[] }) {
  const xs = (i: number) => 100 + i * 70;
  const ya = (v: number) => 150 - ((v - 70) / 30) * 125;
  const ys = (v: number) => 150 - ((v - 30) / 70) * 125;
  const scored = data.filter((d) => d.score !== null);
  // Break the line where a week has no assessment.
  const segments: string[] = [];
  let run = "";
  data.forEach((d, i) => {
    if (d.score !== null) run += `${xs(i)},${ys(d.score)} `;
    else if (run) { segments.push(run); run = ""; }
  });
  if (run) segments.push(run);
  return (
    <svg className="at-svg" viewBox="0 0 700 205" role="img" aria-label="Attendance and average score by week">
      {[70, 80, 90, 100].map((g) => (
        <g key={g}>
          <line className="at-svg__grid" x1={55} x2={640} y1={ya(g)} y2={ya(g)} />
          <text x={50} y={ya(g) + 3} textAnchor="end">{g}</text>
        </g>
      ))}
      {[30, 60, 90].map((g) => <text key={g} x={647} y={ys(g) + 3}>{g}</text>)}
      <line className="at-svg__axis" x1={55} x2={55} y1={25} y2={150} />
      <line className="at-svg__axis" x1={640} x2={640} y1={25} y2={150} />
      <line className="at-svg__axis" x1={55} x2={640} y1={150} y2={150} />
      <text transform="rotate(-90)" x={-88} y={13} textAnchor="middle">Attendance (%)</text>
      <text transform="rotate(90)" x={88} y={-688} textAnchor="middle">Average score (%)</text>
      <text x={347} y={198} textAnchor="middle">Week</text>
      {data.map((d, i) => <rect key={`b${i}`} className="at-svg__bar" x={xs(i) - 17} y={ya(d.attendance)} width={34} height={150 - ya(d.attendance)} rx={4} />)}
      {segments.map((p, i) => <polyline key={i} className="at-svg__score" points={p} />)}
      {data.map((d, i) => (
        <g key={`p${i}`}>
          {d.score !== null
            ? <circle className="at-svg__mark" cx={xs(i)} cy={ys(d.score)} r={4.5} />
            : <text x={xs(i)} y={ya(d.attendance) - 6} textAnchor="middle">no data</text>}
          <text x={xs(i)} y={167} textAnchor="middle">{d.week}</text>
        </g>
      ))}
      <title>{`${scored.length} of ${data.length} weeks have assessment scores`}</title>
    </svg>
  );
}
