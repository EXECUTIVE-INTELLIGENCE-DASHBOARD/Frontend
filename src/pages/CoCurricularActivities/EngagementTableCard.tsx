import { useState } from "react";
import {
  ChevronDown,
  Cpu,
  Download,
  Globe,
  Leaf,
  Medal,
  Music,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

import {
  allDomainsLabel,
  domainOptions,
  filterRowsByDomain,
} from "./coCurricularActivities.data";
import type {
  ActivityIcon,
  ActivityRow,
} from "./coCurricularActivities.types";
import { buildCsv, csvFileName, downloadCsv } from "./exportCsv";

import "../../palette.css";
import "./coCurricularPalette.css";

const ICONS: Record<ActivityIcon, LucideIcon> = {
  globe: Globe,
  cpu: Cpu,
  medal: Medal,
  music: Music,
  leaf: Leaf,
};

interface EngagementTableCardProps {
  rows: ActivityRow[];
  campusLabel: string;
}

export function EngagementTableCard({
  rows,
  campusLabel,
}: EngagementTableCardProps) {
  const [domain, setDomain] = useState(allDomainsLabel);

  const visibleRows = filterRowsByDomain(rows, domain);

  const handleExport = () => {
    downloadCsv(csvFileName(campusLabel), buildCsv(visibleRows));
  };

  return (
    <section className="cc-card">
      <div className="cc-card__header">
        <h2 className="cc-card__title">
          <span className="cc-card__dot" aria-hidden="true" />
          Co-Curricular &amp; Club Engagement Summary
        </h2>

        <div className="cc-card__actions">
          <div className="cc-select">
            <SlidersHorizontal size={14} aria-hidden="true" />

            <select
              aria-label="Filter domain"
              className="cc-select__field"
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            >
              {domainOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <ChevronDown size={14} aria-hidden="true" />
          </div>

          <button
            type="button"
            className="cc-button cc-button--primary"
            onClick={handleExport}
          >
            <Download size={14} aria-hidden="true" />
            Export Report
          </button>
        </div>
      </div>

      <div className="cc-table-wrap">
        <table className="cc-table">
          <thead>
            <tr>
              <th scope="col">Activity / Club</th>
              <th scope="col">Society</th>
              <th scope="col" className="cc-num">
                Events held
              </th>
              <th scope="col" className="cc-num">
                Total attended
              </th>
              <th scope="col" className="cc-num">
                Girls attended
              </th>
              <th scope="col" className="cc-num">
                Boys attended
              </th>
              <th scope="col" className="cc-num">
                Non participatory
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleRows.map((row) => {
              const Icon = ICONS[row.icon];

              return (
                <tr key={row.id}>
                  <td>
                    <span className="cc-activity">
                      <span
                        className={`cc-activity__icon cc-activity__icon--${row.icon}`}
                        aria-hidden="true"
                      >
                        <Icon size={14} />
                      </span>

                      <span className="cc-activity__name">{row.name}</span>
                    </span>
                  </td>
                  <td className="cc-muted">{row.domain}</td>
                  <td className="cc-num">{row.events}</td>
                  <td className="cc-num cc-strong">{row.attended}</td>
                  <td className="cc-num cc-girls">{row.girls}</td>
                  <td className="cc-num cc-boys">{row.boys}</td>
                  <td className="cc-num">
                    <span className="cc-pill">{row.nonParticipatory}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
