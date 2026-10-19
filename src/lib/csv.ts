/** Wrap a cell in quotes when it holds a comma, quote or line break. */
const escapeCell = (value: string | number) => {
  const text = String(value);

  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Build CSV text from a header row and data rows. */
export function buildCsv(
  headers: string[],
  rows: Array<Array<string | number>>,
): string {
  return [headers, ...rows]
    .map((line) => line.map(escapeCell).join(","))
    .join("\r\n");
}

/** A file name such as "hr-workforce-kibuli-main-campus.csv". */
export function csvFileName(prefix: string, campusLabel: string): string {
  const slug = campusLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${prefix}-${slug}.csv`;
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
