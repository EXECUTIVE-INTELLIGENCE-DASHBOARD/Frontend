
import {
  CreditCard,
  CircleCheck,
  TriangleAlert,
  Building2,
  ChartNoAxesColumnIncreasing,
} from "lucide-react";

import "./RevenueDetails.css";

const summaryCards = [
  {
    title: "EXPECTED BILLED REVENUE",
    amount: "UGX 850.0M",
    icon: CreditCard,
    variant: "billed",
  },
  {
    title: "REALIZED COLLECTIONS",
    amount: "UGX 620.5M",
    icon: CircleCheck,
    variant: "collections",
  },
  {
    title: "OUTSTANDING ARREARS",
    amount: "UGX 229.5M",
    icon: TriangleAlert,
    variant: "arrears",
  },
];

const campusRows = [
  {
    campus: "Kibuli Main Campus",
    enrollment: "1,250 Students",
    realized: "UGX 380.0M",
    arrears: "UGX 95.0M",
    collection: 80.0,
  },
  {
    campus: "Buwaate Campus",
    enrollment: "850 Students",
    realized: "UGX 210.5M",
    arrears: "UGX 114.5M",
    collection: 64.8,
  },
  {
    campus: "Annex / Preschool Branch",
    enrollment: "100 Students",
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
    name: "Transport & Shuttle Services",
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

export function RevenueDetails() {
  return (
    <section className="revenue-details">
      {/* Summary cards */}
      <div className="revenue-summary">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className="revenue-summary__card"
              key={card.variant}
            >
              <h2 className="revenue-summary__title">
                {card.title}
              </h2>

              <div className="revenue-summary__content">
                <div
                  className={`revenue-summary__icon revenue-summary__icon--${card.variant}`}
                >
                  <Icon size={25} strokeWidth={2.2} />
                </div>

                <p className="revenue-summary__amount">
                  {card.amount}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Campus table and revenue streams */}
      <div className="revenue-breakdown">
        <section
          className="revenue-panel campus-panel"
          aria-labelledby="campus-panel-title"
        >
          <header className="revenue-panel__heading">
            <span className="revenue-panel__icon">
              <Building2 size={22} />
            </span>

            <h2 id="campus-panel-title">
              Revenue &amp; Arrears Breakdown by Campus
            </h2>
          </header>

          <div className="campus-table-wrapper">
            <table className="campus-table">
              <thead>
                <tr>
                  <th scope="col">CAMPUS / BRANCH</th>
                  <th scope="col">ENROLLMENT</th>
                  <th scope="col">REALIZED</th>
                  <th scope="col">ARREARS</th>
                  <th scope="col">COLLECTION %</th>
                </tr>
              </thead>

              <tbody>
                {campusRows.map((row) => (
                  <tr key={row.campus}>
                    <td className="campus-table__name">
                      {row.campus}
                    </td>

                    <td>{row.enrollment}</td>
                    <td>{row.realized}</td>
                    <td>{row.arrears}</td>

                    <td>
                      {row.collection.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="revenue-panel streams-panel"
          aria-labelledby="streams-panel-title"
        >
          <header className="streams-panel__heading">
            <span className="revenue-panel__icon">
              <ChartNoAxesColumnIncreasing size={22} />
            </span>

            <div className="streams-panel__title">
              <h2 id="streams-panel-title">Revenue Streams</h2>
              <p>Group-wide, by revenue stream</p>
            </div>

            <div className="streams-panel__total">
              <span>TOTAL</span>
              <strong>UGX 850.0M</strong>
            </div>
          </header>

          <div className="streams-list">
            {revenueStreams.map((stream) => (
              <div
                className="stream-item"
                key={stream.name}
              >
                <div className="stream-item__details">
                  <span className="stream-item__name">
                    {stream.name}
                  </span>

                  <span className="stream-item__amount">
                    {stream.amount} ({stream.percentage.toFixed(1)}%)
                  </span>
                </div>

                <div
                  className="stream-item__track"
                  role="progressbar"
                  aria-label={`${stream.name} contribution`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={stream.percentage}
                >
                  <div
                    className={`stream-item__fill stream-item__fill--${stream.color}`}
                    style={{
                      width: `${stream.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
