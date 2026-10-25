import type { ReactNode } from "react";
import { Download } from "lucide-react";

import { buildCsv, csvFileName, downloadCsv } from "../../lib/csv";

export interface FleetColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** The plain value written to the CSV export. */
  csv: (row: T) => string | number;
  /** Figures and dates read better flush to the right edge. */
  align?: "right" | "center";
}

interface FleetDataCardProps<T> {
  title: string;
  columns: FleetColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Start of the exported file name, e.g. "fleet-disruptions". */
  fileName: string;
  /** Appended to the file name, e.g. the campus filter label. */
  scopeLabel: string;
  /**
   * Shown instead of rows when the set is empty. Fleet records are not exposed
   * by the API yet, so each table says nothing is reported rather than claiming
   * the fleet had no incidents.
   */
  emptyMessage: string;
}

export function FleetPill({
  tone,
  children,
}: {
  tone: "good" | "warn" | "bad" | "muted";
  children: ReactNode;
}) {
  return (
    <span className={`ft-pill ft-pill--${tone}`}>
      <span className="ft-pill__dot" aria-hidden="true" />
      {children}
    </span>
  );
}

/** Renders an em dash in the muted tone so "not reported" is visually distinct. */
export function Dash() {
  return (
    <span className="ft-dash" aria-label="Not reported">
      —
    </span>
  );
}

export function FleetDataCard<T>({
  title,
  columns,
  rows,
  rowKey,
  fileName,
  scopeLabel,
  emptyMessage,
}: FleetDataCardProps<T>) {
  const handleExport = () => {
    const csv = buildCsv(
      columns.map((column) => column.header),
      rows.map((row) => columns.map((column) => column.csv(row))),
    );

    downloadCsv(csvFileName(fileName, scopeLabel), csv);
  };

  return (
    <div className="ft-block">
      <div className="ft-block__head">
        <h3 className="ft-block__title">
          {title}
          <span className={`ft-block__count${rows.length === 0 ? " ft-block__count--empty" : ""}`}>
            {rows.length === 0 ? "none" : rows.length}
          </span>
        </h3>

        <button
          type="button"
          className="ft-icon-button"
          onClick={handleExport}
          disabled={rows.length === 0}
          aria-label={`Export ${title}`}
          title="Export CSV"
        >
          <Download size={13} aria-hidden="true" />
        </button>
      </div>

      {rows.length === 0 ? (
        /* An empty table is a wall of headers saying nothing — one line is enough. */
        <p className="ft-block__empty">{emptyMessage}</p>
      ) : (
        <div className="ft-table-wrap">
          <table className="ft-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.header}
                    scope="col"
                    className={column.align ? `ft-align--${column.align}` : undefined}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((column) => (
                    <td
                      key={column.header}
                      className={column.align ? `ft-align--${column.align}` : undefined}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
