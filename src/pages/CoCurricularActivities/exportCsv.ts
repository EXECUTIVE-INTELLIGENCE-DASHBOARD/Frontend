import type { ActivityRow } from "./coCurricularActivities.types";

const HEADERS = [
  "Activity / Club",
  "Society",
  "Events held",
  "Total attended",
  "Girls attended",
  "Boys attended",
  "Non participatory",
];

/** Wrap a cell in quotes when it holds a comma, quote or line break. */
const escapeCell = (value: string | number) => {
  const text = String(value);

  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function buildCsv(rows: ActivityRow[]): string {
  const lines = [
    HEADERS,
    ...rows.map((row) => [
      row.name,
      row.domain,
      row.events,
      row.attended,
      row.girls,
      row.boys,
      row.nonParticipatory,
    ]),
  ];

  return lines.map((line) => line.map(escapeCell).join(",")).join("\r\n");
}

export function csvFileName(campusLabel: string): string {
  const slug = campusLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `co-curricular-engagement-${slug}.csv`;
}

/** Download text as a CSV file. The BOM lets Excel read it as UTF-8. */
export function downloadCsv(fileName: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
