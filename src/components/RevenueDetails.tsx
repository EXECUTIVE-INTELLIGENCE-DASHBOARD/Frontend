
import { useState } from "react";
import {
  CreditCard,
  CircleCheck,
  TriangleAlert,
  Building2,
  ChartNoAxesColumnIncreasing,
  CalendarDays,
  TrendingUp,
  Wallet,
  Clock3,
  ClipboardList,
  ArrowUpRight,
} from "lucide-react";

import type {
  CampusOption,
  SectionOption,
} from "./filters/CampusFilter";

import "./RevenueDetails.css";

interface RevenueDetailsProps {
  campus: CampusOption;
  section: SectionOption;
}

type ReportingPeriod =
  | "Current Month"
  | "Current Quarter"
  | "Financial Year";

const reportingPeriods: ReportingPeriod[] = [
  "Current Month",
  "Current Quarter",
  "Financial Year",
];

const summaryCards = [
  {
    title: "Billed Revenue",
    amount: "UGX 850.0M",
    note: "Total fees and other charges",
    icon: CreditCard,
    id: "billed",
  },
  {
    title: "Collections Received",
    amount: "UGX 620.5M",
    note: "Payments received",
    icon: CircleCheck,
    id: "collections",
  },
  {
    title: "Outstanding Arrears",
    amount: "UGX 229.5M",
    note: "Unpaid billed balances",
    icon: TriangleAlert,
    id: "arrears",
  },
];

const campusRows = [
  {
    campus: "Kibuli Main Campus",
    enrollment: "1,250",
    realized: "UGX 380.0M",
    arrears: "UGX 95.0M",
    collection: 80.0,
  },
  {
    campus: "Buwaate Campus",
    enrollment: "850",
    realized: "UGX 210.5M",
    arrears: "UGX 114.5M",
    collection: 64.8,
  },
  {
    campus: "Annex / Preschool Branch",
    enrollment: "100",
    realized: "UGX 30.0M",
    arrears: "UGX 20.0M",
    collection: 60.0,
  },
];

const revenueStreams = [
  {
    name: "Tuition",
    amount: "UGX 650.0M",
    percentage: 76.5,
    color: "tuition",
  },
  {
    name: "Extracurricular & Clubs",
    amount: "UGX 25.0M",
    percentage: 2.9,
    color: "clubs",
  },
  {
    name: "Admission & Registration",
    amount: "UGX 20.0M",
    percentage: 2.4,
    color: "admission",
  },
  {
    name: "Minimart",
    amount: "UGX 85.0M",
    percentage: 10.0,
    color: "transport",
  },
  {
    name: "Donations",
    amount: "UGX 40.0M",
    percentage: 4.7,
    color: "donations",
  },
  {
    name: "Alumni Contributions",
    amount: "UGX 30.0M",
    percentage: 3.5,
    color: "alumni",
  },
];

const performanceMetrics = [
  {
    id: "growth",
    title: "Revenue Growth",
    icon: TrendingUp,
    value: "12.8",
    suffix: "%",
    note: "Compared with previous period",
  },
  {
    id: "budget",
    title: "Collection Target",
    icon: Wallet,
    value: "82.4",
    suffix: "%",
    note: "Of the approved collection target",
  },
  {
    id: "variance",
    title: "Budget Variance",
    icon: ChartNoAxesColumnIncreasing,
    value: "-4.6",
    suffix: "%",
    note: "Below the collection target",
  },
];

const ageingBuckets = [
  {
    id: "0-30",
    period: "0–30 days",
    description: "Recently overdue",
    amount: "UGX 68.5M",
    accounts: "124 accounts",
  },
  {
    id: "31-60",
    period: "31–60 days",
    description: "Follow-up required",
    amount: "UGX 54.2M",
    accounts: "96 accounts",
  },
  {
    id: "61-90",
    period: "61–90 days",
    description: "Priority follow-up",
    amount: "UGX 42.8M",
    accounts: "71 accounts",
  },
  {
    id: "90-plus",
    period: "Over 90 days",
    description: "Long-outstanding balances",
    amount: "UGX 64.0M",
    accounts: "88 accounts",
  },
];

export function RevenueDetails({
  campus,
  section,
}: RevenueDetailsProps) {
  const [reportingPeriod, setReportingPeriod] =
    useState<ReportingPeriod>("Financial Year");

  const filteredCampusRows =
    campus === "All Campuses"
      ? campusRows
      : campusRows.filter((row) => row.campus === campus);

  const sectionDataUnavailable = section !== "All Sections";

  return (
    <section className="revenue-details">
      <header className="revenue-reporting">
        <div className="revenue-reporting__intro">
          <div className="revenue-reporting__icon" aria-hidden="true">
            <CalendarDays size={19} />
          </div>

          <div>
            <h2>Financial Performance</h2>
            <p>Revenue collection and fee recovery overview</p>
          </div>
        </div>

        <div className="revenue-reporting__controls">
          <label htmlFor="revenue-reporting-period">
            Reporting period
          </label>

          <select
            id="revenue-reporting-period"
            value={reportingPeriod}
            onChange={(event) =>
              setReportingPeriod(
                event.target.value as ReportingPeriod,
              )
            }
          >
            {reportingPeriods.map((period) => (
              <option value={period} key={period}>
                {period}
              </option>
            ))}
          </select>

          <span className="revenue-reporting__status">
            <span className="revenue-reporting__status-dot" />
            {reportingPeriod}
          </span>
        </div>
      </header>

      <div
        className="revenue-summary"
        aria-label="Revenue summary"
      >
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className={`revenue-summary__card revenue-summary__card--${card.id}`}
              key={card.id}
            >
              <div className="revenue-summary__top">
                <div className="revenue-summary__icon">
                  <Icon size={19} strokeWidth={2} />
                </div>

                {card.id === "collections" && (
                  <span className="revenue-summary__badge">
                    <CircleCheck size={12} />
                    Collections
                  </span>
                )}

                {card.id === "arrears" && (
                  <span className="revenue-summary__badge revenue-summary__badge--neutral">
                    <TriangleAlert size={12} />
                    Receivables
                  </span>
                )}
              </div>

              <p className="revenue-summary__title">
                {card.title}
              </p>

              <p className="revenue-summary__amount">
                {card.amount}
              </p>

              <p className="revenue-summary__note">
                {card.note}
              </p>
            </article>
          );
        })}
      </div>

      <section
        className="revenue-panel revenue-performance"
        aria-labelledby="revenue-performance-title"
      >
        <header className="revenue-panel__heading">
          <div className="revenue-panel__heading-main">
            <span className="revenue-panel__icon">
              <TrendingUp size={19} />
            </span>

            <div>
              <h2 id="revenue-performance-title">
                Revenue Performance Indicators
              </h2>
              <p>Key measures for financial oversight</p>
            </div>
          </div>
        </header>

        <div className="revenue-performance__grid">
          {performanceMetrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article
                className="revenue-performance__card"
                key={metric.id}
              >
                <div className="revenue-performance__top">
                  <span className="revenue-performance__icon">
                    <Icon size={18} />
                  </span>

                  <span className="revenue-performance__indicator">
                    <ArrowUpRight size={15} />
                  </span>
                </div>

                <p className="revenue-performance__label">
                  {metric.title}
                </p>

                <p className="revenue-performance__value">
                  {metric.value}
                  {metric.suffix}
                </p>

                <p className="revenue-performance__description">
                  {metric.note}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <div className="revenue-breakdown">
        <section
          className="revenue-panel campus-panel"
          aria-labelledby="campus-panel-title"
        >
          <header className="revenue-panel__heading">
            <div className="revenue-panel__heading-main">
              <span className="revenue-panel__icon">
                <Building2 size={19} />
              </span>

              <div>
                <h2 id="campus-panel-title">
                  Campus Revenue Breakdown
                </h2>
                <p>Collections and outstanding receivables</p>
              </div>
            </div>
          </header>

          {sectionDataUnavailable && (
            <p className="revenue-panel__notice" role="status">
              Section-level financial records are not available.
              Campus totals are displayed instead.
            </p>
          )}

          <div className="campus-table-wrapper">
            <table className="campus-table">
              <thead>
                <tr>
                  <th scope="col">Campus / Branch</th>
                  <th scope="col">Enrolment</th>
                  <th scope="col">Collections</th>
                  <th scope="col">Arrears</th>
                  <th scope="col">Collection rate</th>
                </tr>
              </thead>

              <tbody>
                {filteredCampusRows.length > 0 ? (
                  filteredCampusRows.map((row) => (
                    <tr key={row.campus}>
                      <td className="campus-table__name">
                        {row.campus}
                      </td>
                      <td>{row.enrollment}</td>
                      <td>{row.realized}</td>
                      <td>{row.arrears}</td>
                      <td>
                        <div className="campus-collection">
                          <span>
                            {row.collection.toFixed(1)}%
                          </span>
                          <div className="campus-collection__track">
                            <div
                              className="campus-collection__fill"
                              style={{
                                width: `${row.collection}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      No campus records are available for this selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="revenue-panel streams-panel"
          aria-labelledby="streams-panel-title"
        >
          <header className="revenue-panel__heading">
            <div className="revenue-panel__heading-main">
              <span className="revenue-panel__icon">
                <ChartNoAxesColumnIncreasing size={19} />
              </span>

              <div>
                <h2 id="streams-panel-title">Revenue Sources</h2>
                <p>Distribution by income stream</p>
              </div>
            </div>

            <span className="streams-panel__count">
              {revenueStreams.length} sources
            </span>
          </header>

          <div className="streams-list">
            {revenueStreams.map((stream) => (
              <div className="stream-item" key={stream.name}>
                <div className="stream-item__details">
                  <span className="stream-item__name">
                    {stream.name}
                  </span>

                  <span className="stream-item__amount">
                    {stream.amount}
                  </span>
                </div>

                <div className="stream-item__progress-row">
                  <div
                    className="stream-item__track"
                    role="progressbar"
                    aria-label={`${stream.name} share`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={stream.percentage}
                    aria-valuetext={`${stream.percentage.toFixed(1)}%`}
                  >
                    <div
                      className={`stream-item__fill stream-item__fill--${stream.color}`}
                      style={{
                        width: `${stream.percentage}%`,
                      }}
                    />
                  </div>

                  <span className="stream-item__percentage">
                    {stream.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section
        className="revenue-panel revenue-ageing"
        aria-labelledby="revenue-ageing-title"
      >
        <header className="revenue-panel__heading">
          <div className="revenue-panel__heading-main">
            <span className="revenue-panel__icon">
              <Clock3 size={19} />
            </span>

            <div>
              <h2 id="revenue-ageing-title">
                Receivables Ageing
              </h2>
              <p>Outstanding fees grouped by overdue period</p>
            </div>
          </div>
        </header>

        <div className="revenue-ageing__grid">
  {ageingBuckets.map((bucket) => (
    <article
      className="revenue-ageing__item"
      key={bucket.id}
    >
      <span className="revenue-ageing__period">
        {bucket.period}
      </span>

      <p>{bucket.description}</p>

      <strong>{bucket.amount}</strong>

      <span className="revenue-ageing__footnote">
        {bucket.accounts}
      </span>
    </article>
  ))}
</div>
      </section>

      <section
        className="revenue-panel revenue-board-actions"
        aria-labelledby="revenue-board-actions-title"
      >
        <header className="revenue-panel__heading">
          <div className="revenue-panel__heading-main">
            <span className="revenue-panel__icon">
              <ClipboardList size={19} />
            </span>

            <div>
              <h2 id="revenue-board-actions-title">
                Board Attention
              </h2>
              <p>Financial risks, follow-up and decisions</p>
            </div>
          </div>
        </header>

        <div className="revenue-board-actions__content">
          <article className="revenue-board-actions__item">
            <span className="revenue-board-actions__item-icon">
              <Wallet size={18} />
            </span>

            <div className="revenue-board-actions__item-copy">
              <h3>Collection performance</h3>
              <p>
                Connect the approved revenue budget to identify
                collection shortfalls and material variances.
              </p>
            </div>

            <span className="revenue-board-actions__status">
              Awaiting data
            </span>
          </article>

          <article className="revenue-board-actions__item">
            <span className="revenue-board-actions__item-icon">
              <TriangleAlert size={18} />
            </span>

            <div className="revenue-board-actions__item-copy">
              <h3>Overdue receivables</h3>
              <p>
                Identify ageing balances and prioritise follow-up
                using invoice and payment records.
              </p>
            </div>

            <span className="revenue-board-actions__status">
              Awaiting data
            </span>
          </article>

          <article className="revenue-board-actions__item">
            <span className="revenue-board-actions__item-icon">
              <ClipboardList size={18} />
            </span>

            <div className="revenue-board-actions__item-copy">
              <h3>Corrective actions and Board decisions</h3>
              <p>
                Track the responsible owner, due date, requested
                decision and resolution once action records are available.
              </p>
            </div>

            <span className="revenue-board-actions__status">
              Not configured
            </span>
          </article>
        </div>
      </section>
    </section>
  );
}
