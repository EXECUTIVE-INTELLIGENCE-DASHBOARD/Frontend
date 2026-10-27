import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Banknote, Bed, Percent, Sun } from "lucide-react";

import { formatUgx, sectionColours } from "../../lib/finance.format";
import type { SchoolFeeRow, SchoolFeesDashboard } from "./schoolFees.api";

/** Paid share: red below 90%, amber below 95%, green from 95%. */
const paidTone = (rate: number | null) =>
  rate === null ? "" : rate < 90 ? "is-red" : rate < 95 ? "is-amber" : "is-green";

/* ---------- Summary tiles ---------- */

export function FeeSummary({ data, schoolLabel }: { data: SchoolFeesDashboard; schoolLabel?: string }) {
  const { summary, has_boarding: hasBoarding } = data;
  const share = (part: number | null) =>
    summary.revenue ? `${Math.round(((part ?? 0) / summary.revenue) * 100)}% of fees` : "";

  // Day-only schools show just fee revenue and students paid.
  const tiles = [
    { icon: Banknote, label: "School fee revenue", value: formatUgx(summary.revenue),
      note: schoolLabel ? `this term, ${schoolLabel}` : "this term, all schools" },
    ...(hasBoarding
      ? [
          { icon: Sun, label: "Day", value: formatUgx(summary.day_revenue),
            note: share(summary.day_revenue) },
          { icon: Bed, label: "Boarding", value: formatUgx(summary.boarding_revenue ?? 0),
            note: share(summary.boarding_revenue) },
        ]
      : []),
    { icon: Percent, label: "Students paid",
      value: summary.paid_rate === null ? "–" : `${summary.paid_rate}%`,
      note: `${summary.paid.toLocaleString("en-US")} of ${summary.enrolled.toLocaleString("en-US")} enrolled` },
  ];

  return (
    <section
      className={`revenue-summary${hasBoarding ? "" : " revenue-summary--two"}`}
      aria-label="School fees summary"
    >
      {tiles.map(({ icon: Icon, label, value, note }) => (
        <article className="revenue-summary__card" key={label}>
          <span className="revenue-summary__icon">
            <Icon size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="revenue-summary__label">{label}</p>
            <p className="revenue-summary__value">{value}</p>
            <p className="revenue-summary__note">{note}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

/* ---------- 1. Revenue per school / per class ---------- */

/** An axis label on two lines ("Kibuli" over "Nursery") so school names don't overlap. */
function TwoLineTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const [first, ...rest] = String(payload?.value ?? "").split(" ");
  return (
    <text x={x} y={y} textAnchor="middle" fill="var(--color-text-muted)" fontSize={11}>
      <tspan x={x} dy={12}>{first}</tspan>
      {rest.length > 0 && <tspan x={x} dy={13}>{rest.join(" ")}</tspan>}
    </text>
  );
}

export function RevenueBreakdown({
  data,
  label,
}: {
  data: SchoolFeesDashboard;
  label: (row: SchoolFeeRow) => string;
}) {
  const byClass = data.breakdown_by === "class";
  const rows = data.breakdown.map((row) => ({
    label: label(row),
    day: row.day_revenue,
    // the total sits on top of the boarding segment, and the chart draws no label on an
    // empty segment, so day-only rows get a sliver too small to see
    boarding: row.boarding_revenue || 0.001,
    total: row.revenue,
  }));

  return (
    <article className="revenue-panel" aria-label={byClass ? "Revenue per class" : "Revenue per school"}>
      <div className="revenue-panel__heading">
        <h2>{byClass ? "Revenue per class" : "Revenue per school"}</h2>
        <p>
          {data.has_boarding
            ? "School fees this term, split into day and boarding."
            : "School fees this term. This school has day learners only."}
        </p>
      </div>
      <div className="revenue-panel__chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 22, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={36}
              tick={<TwoLineTick />}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tickFormatter={formatUgx}
              tick={{ fill: "var(--color-text-muted)", fontSize: 11 }}
            />
            <Bar dataKey="day" stackId="fees" fill={sectionColours.day} maxBarSize={64}
              isAnimationActive={false} radius={data.has_boarding ? 0 : [5, 5, 0, 0]}>
              {!data.has_boarding && (
                <LabelList dataKey="total" position="top" formatter={(v) => formatUgx(Number(v))}
                  className="revenue-panel__bar-label" />
              )}
            </Bar>
            {data.has_boarding && (
              <Bar dataKey="boarding" stackId="fees" fill={sectionColours.boarding} maxBarSize={64}
                isAnimationActive={false} radius={[5, 5, 0, 0]}>
                <LabelList dataKey="total" position="top" formatter={(v) => formatUgx(Number(v))}
                  className="revenue-panel__bar-label" />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {data.has_boarding && (
        <div className="revenue-panel__legend">
          <span><i style={{ background: sectionColours.day }} />Day</span>
          <span><i style={{ background: sectionColours.boarding }} />Boarding</span>
        </div>
      )}
    </article>
  );
}

/* ---------- 2. Day vs boarding (boarding schools only) ---------- */

export function DayVsBoarding({ data }: { data: SchoolFeesDashboard }) {
  const slices = data.sections.map((section) => ({
    name: section.section_display,
    value: section.revenue,
    colour: sectionColours[section.section],
  }));
  const students = data.sections.reduce((sum, section) => sum + section.students, 0);

  return (
    <article className="revenue-panel" aria-label="Day vs boarding">
      <div className="revenue-panel__heading">
        <h2>Day vs boarding</h2>
        <p>Students and fees in each section. Boarders pay more per student.</p>
      </div>
      <div className="revenue-panel__donut">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="90%"
              startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>
              {slices.map((slice) => <Cell key={slice.name} fill={slice.colour} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="revenue-panel__donut-centre">
          <strong>{formatUgx(data.summary.revenue)}</strong>
          <span>school fees</span>
        </div>
      </div>
      <table className="revenue-panel__table">
        <thead>
          <tr><th>Section</th><th>Students</th><th>Fee per student</th><th>Revenue</th></tr>
        </thead>
        <tbody>
          {data.sections.map((section) => (
            <tr key={section.section}>
              <td>
                <i className="revenue-panel__dot" style={{ background: sectionColours[section.section] }} />
                {section.section_display}
              </td>
              <td>{section.students.toLocaleString("en-US")}</td>
              <td>{section.fee_per_student === null ? "–" : formatUgx(section.fee_per_student)}</td>
              <td>{formatUgx(section.revenue)}</td>
            </tr>
          ))}
          <tr className="revenue-panel__total-row">
            <td>Total</td>
            <td>{students.toLocaleString("en-US")}</td>
            <td />
            <td>{formatUgx(data.summary.revenue)}</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}

/* ---------- 3. Students paying vs students enrolled ---------- */

export function PayingVsEnrolled({
  data,
  label,
}: {
  data: SchoolFeesDashboard;
  label: (row: SchoolFeeRow) => string;
}) {
  const byClass = data.breakdown_by === "class";
  const { summary } = data;

  return (
    <article className="revenue-panel" aria-label="Students paying vs students enrolled">
      <div className="revenue-panel__heading">
        <h2>Students paying vs students enrolled</h2>
        <p>
          Learners whose fees are paid in full this term, against learners enrolled.
          "Not paid" is money that may be missing.
        </p>
      </div>
      <div className="revenue-panel__table-wrap">
        <table className="revenue-panel__table">
          <thead>
            <tr>
              <th>{byClass ? "Class" : "School"}</th>
              <th>Enrolled</th>
              <th>Paid</th>
              <th>Not paid</th>
              <th>Share paid</th>
              <th>Fees not received</th>
            </tr>
          </thead>
          <tbody>
            {data.breakdown.map((row) => (
              <tr key={row.id ?? row.name}>
                <td>{label(row)}</td>
                <td>{row.enrolled.toLocaleString("en-US")}</td>
                <td>{row.paid.toLocaleString("en-US")}</td>
                <td className={paidTone(row.paid_rate)}>{row.not_paid.toLocaleString("en-US")}</td>
                <td className={paidTone(row.paid_rate)}>
                  {row.paid_rate === null ? "–" : `${row.paid_rate}%`}
                  <span className="revenue-panel__minibar">
                    <i style={{ width: `${row.paid_rate ?? 0}%` }} />
                  </span>
                </td>
                <td>{formatUgx(row.fees_not_received)}</td>
              </tr>
            ))}
            <tr className="revenue-panel__total-row">
              <td>Total</td>
              <td>{summary.enrolled.toLocaleString("en-US")}</td>
              <td>{summary.paid.toLocaleString("en-US")}</td>
              <td>{summary.not_paid.toLocaleString("en-US")}</td>
              <td>{summary.paid_rate === null ? "–" : `${summary.paid_rate}%`}</td>
              <td>{formatUgx(summary.fees_not_received)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}
