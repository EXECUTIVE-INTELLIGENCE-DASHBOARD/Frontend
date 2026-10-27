/**
 * Formatting shared by the finance screens.
 */

/**
 * UGX amounts in millions or billions, with three significant figures:
 * 513950000 -> "514M", 18500000 -> "18.5M", 1876729 -> "1.88M", 1654550000 -> "1.65B".
 */
export function formatUgx(amount: number): string {
  const value = Math.abs(amount);
  const sign = amount < 0 ? "−" : "";

  if (value >= 1e9) return `${sign}${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e8) return `${sign}${Math.round(value / 1e6)}M`;
  if (value >= 1e7) return `${sign}${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e6) return `${sign}${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${sign}${Math.round(value / 1e3).toLocaleString("en-US")}K`;
  return `${sign}${Math.round(value).toLocaleString("en-US")}`;
}

const campusLabels: Record<string, string> = {
  kibuli: "Kibuli",
  buwaate: "Buwaate",
  gis: "GIS",
};

/**
 * A short label for a school, e.g. "GreenHill Academy Nursery Kibuli" -> "Kibuli Nursery".
 * Greenhill International is a single school, so it is simply "GIS".
 */
export function shortSchoolName(name: string, campus: string): string {
  if (campus === "gis") return "GIS";

  const level = ["Nursery", "Primary", "Secondary"].find((word) => name.includes(word));
  const place = campusLabels[campus] ?? campus;

  return level ? `${place} ${level}` : name;
}

/** Campus colours for the per-school charts (chart-navy turns sky in dark theme). */
export const campusColours: Record<string, string> = {
  kibuli: "var(--chart-navy)",
  buwaate: "var(--pal-indigo)",
  gis: "var(--brand-gold)",
};

/** Section colours: day and boarding. */
export const sectionColours = {
  day: "var(--chart-navy)",
  boarding: "var(--brand-gold)",
} as const;
