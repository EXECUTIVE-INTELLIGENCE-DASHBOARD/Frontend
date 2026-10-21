import type { ReactNode } from "react";
import { Download } from "lucide-react";

import { buildCsv, csvFileName, downloadCsv } from "../../lib/csv";

export interface HrColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** The plain value written to the CSV export. */
  csv: (row: T) => string | number;
}

interface HrDataCardProps<T> {
  title: string;
  columns: HrColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Start of the exported file name, e.g. "hr-establishment". */
  fileName: string;
  /** Appended to the file name, e.g. the employer filter label. */
  scopeLabel: string;
}

export function HrPill({ tone, children }: { tone: "good" | "warn" | "bad"; children: ReactNode }) {
  return (
    <span className={`hw-pill hw-pill--${tone}`}>
      <span className="hw-pill__dot" aria-hidden="true" />
      {children}
    </span>
  );
}

export function HrDataCard<T>({ title, columns, rows, rowKey, fileName, scopeLabel }: HrDataCardProps<T>) {
  const handleExport = () => {
    const csv = buildCsv(
      columns.map((column) => column.header),
      rows.map((row) => columns.map((column) => column.csv(row))),
    );

    downloadCsv(csvFileName(fileName, scopeLabel), csv);
  };

  return (
    <section className="hw-card">
      <div className="hw-card__header">
        <h2 className="hw-card__title">
          <span className="hw-card__dot" aria-hidden="true" />
          {title}
        </h2>

        <div className="hw-card__actions">
          <button type="button" className="hw-button hw-button--primary" onClick={handleExport}>
            <Download size={14} aria-hidden="true" />
            Export Report
          </button>
        </div>
      </div>

      <div className="hw-table-wrap">
        <table className="hw-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.header} scope="col">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="hw-empty">
                  No records for this selection.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((column) => (
                    <td key={column.header}>{column.cell(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
