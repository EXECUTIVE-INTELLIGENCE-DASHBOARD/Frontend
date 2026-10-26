import type {
  CategoryRow, CleaningDay, Compare, FacilitiesFilters, FurnitureRow,
  OrderStatus, SectionName, UtilityRow, WorkOrder,
} from "./facilities.types";

/* Sample data. Replace the generators with real endpoints in facilities.api.ts. */

export const ALL_CAMPUSES = "All Campuses";
export const GSL = "GSL";
export const SCHOOLS = ["Kibuli", "Buwaate", "Greenhill International (GIS)"];
export const EMPLOYMENT = ["All Employment", "Greenhill Schools", "GSL"] as const;
export const SECTIONS: { value: SectionName; label: string }[] = [
  { value: "", label: "All Sections" },
  { value: "Nursery", label: "Nursery" },
  { value: "Primary", label: "Primary" },
  { value: "Secondary", label: "Secondary" },
];
export const CATEGORIES = ["Plumbing", "Electrical", "Furniture", "Roofing & Walls", "ICT & Networking", "Grounds"];
export const LOCATIONS = ["Classrooms", "Offices", "Dormitories", "Grounds"];
export const PROVIDERS = ["Nile Plumbing Ltd", "Bright Electricals", "Kampala Builders", "TechLink Uganda"];
export const UTILITIES = [
  { name: "Water", base: 4.2e6 },
  { name: "Electricity", base: 14e6 },
  { name: "Internet", base: 4.8e6 },
];
/** A cost increase at or above this is flagged for review. Confirm the threshold with the Operations Manager. */
export const REVIEW_THRESHOLD = 0.1;
export const TASKS_PER_CAMPUS_PER_DAY = 18;
export const DAY = 864e5;
/** "Today" for the sample data. Use the real date once the API is connected. */
export const AS_OF = Date.UTC(2026, 9, 26);

export const shortName = (c: string) => (c.includes("GIS") ? "GIS" : c);

export function hash(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909) >>> 0;
  h ^= h >>> 16;
  return h >>> 0;
}

export const parseDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

/** Which campuses/entities a filter selection covers. */
export function scopeCampuses(f: Pick<FacilitiesFilters, "employment" | "campus">): string[] {
  if (f.employment === "GSL") return [GSL];
  if (f.campus !== ALL_CAMPUSES) return [f.campus];
  return f.employment === "Greenhill Schools" ? [...SCHOOLS] : [...SCHOOLS, GSL];
}

export function buildWorkOrders(campuses: string[]): WorkOrder[] {
  const out: WorkOrder[] = [];
  campuses.forEach((campus) => {
    for (let i = 0; i < 40; i++) {
      const h = hash(`${campus}wo${i}`);
      // Skew logged dates toward recent so some open orders are not yet due.
      const logged = Date.UTC(2026, 0, 5) + Math.floor(Math.pow((h % 1000) / 1000, 0.55) * 293) * DAY;
      const due = logged + (7 + ((h >>> 4) % 22)) * DAY;
      const age = (AS_OF - logged) / DAY;
      const done = ((h >>> 8) % 100) < (age > 60 ? 93 : age > 25 ? 68 : 32);
      const status: OrderStatus = done ? "Completed" : due < AS_OF ? "Overdue" : "In progress";
      out.push({
        id: `WO-${shortName(campus).slice(0, 3).toUpperCase()}-${1001 + i}`,
        campus,
        category: CATEGORIES[(h >>> 5) % CATEGORIES.length],
        location: LOCATIONS[(h >>> 7) % LOCATIONS.length],
        type: (h >>> 9) % 5 === 0 ? "Replacement" : "Repair",
        provider: PROVIDERS[(h >>> 11) % PROVIDERS.length],
        logged, due, done, status,
      });
    }
  });
  return out;
}

export function categoryRows(orders: WorkOrder[]): CategoryRow[] {
  return CATEGORIES.map((category) => {
    const x = orders.filter((o) => o.category === category);
    const done = x.filter((o) => o.done).length;
    return { category, logged: x.length, done, open: x.length - done, overdue: x.filter((o) => o.status === "Overdue").length };
  }).sort((a, b) => b.overdue - a.overdue || b.open - a.open);
}

/** The last `count` weekdays inside the range, oldest first. */
export function schoolDays(start: number, end: number, count = 5): number[] {
  const out: number[] = [];
  for (let t = end; t >= start && out.length < count; t -= DAY) {
    const w = new Date(t).getUTCDay();
    if (w > 0 && w < 6) out.unshift(t);
  }
  return out;
}

export function buildCleaning(campuses: string[], days: number[]): CleaningDay[] {
  return days.map((date) => {
    const d = { date, complete: 0, incomplete: 0, missing: 0 };
    campuses.forEach((c) => {
      const h = hash(`${c}${date}cl`);
      const complete = 11 + (h % 8);
      const rest = TASKS_PER_CAMPUS_PER_DAY - complete;
      const incomplete = rest ? (h >>> 3) % (rest + 1) : 0;
      d.complete += complete;
      d.incomplete += incomplete;
      d.missing += rest - incomplete;
    });
    return d;
  });
}

/** GIS follows Cambridge year groups; GSL has no classes. */
export function classesFor(campus: string, section: SectionName): string[] {
  if (campus === GSL) return [];
  const gis = campus.includes("GIS");
  const nursery = gis ? ["Nursery", "Reception"] : ["Baby Class", "Middle Class", "Top Class"];
  const primary = gis ? ["Year 5", "Year 6"] : ["Primary 5", "Primary 6", "Primary 7"];
  const secondary = gis ? ["Year 9", "Year 10 (IGCSE)", "Year 12 (AS Level)"] : ["Senior 1", "Senior 2"];
  if (section === "Nursery") return nursery;
  if (section === "Primary") return primary;
  if (section === "Secondary") return secondary;
  return [...nursery, ...primary, ...secondary];
}

/** Assumes one chair and one desk per learner. */
export function buildFurniture(campuses: string[], section: SectionName, date: number): FurnitureRow[] {
  const out: FurnitureRow[] = [];
  campuses.forEach((campus) =>
    classesFor(campus, section).forEach((cls) => {
      const h = hash(`${campus}${cls}fu`);
      const learners = 26 + (h % 22);
      const dayShift = (hash(`${campus}${cls}${date}`) % 3) - 1;
      const chairs = learners + ((h >>> 2) % 9) - 4 + dayShift;
      const desks = learners + ((h >>> 5) % 9) - 5 + dayShift;
      out.push({ cls, campus, learners, chairs, desks, short: Math.max(0, learners - chairs) + Math.max(0, learners - desks) });
    }),
  );
  return out.sort((a, b) => b.short - a.short);
}

/** Year*12 + month index, so periods can be compared and stepped. */
export const ymOf = (ms: number) => new Date(ms).getUTCFullYear() * 12 + new Date(ms).getUTCMonth();
export const ymLabel = (ym: number) =>
  `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][ym % 12]} ${Math.floor(ym / 12)}`;
export const monthsBetween = (start: number, end: number): number[] => {
  const out: number[] = [];
  for (let y = ymOf(end); y >= ymOf(start); y--) out.push(y);
  return out;
};
export const comparePeriod = (ym: number, compare: Compare) => (compare === "year" ? ym - 12 : ym - 1);

const costOf = (campus: string, utility: number, ym: number) =>
  UTILITIES[utility].base * (0.8 + (hash(`${campus}${utility}${ym}`) % 45) / 100);

/** Cost comparison only. No consumption or savings claims. */
export function buildUtilities(campuses: string[], ym: number, compare: Compare): UtilityRow[] {
  const prevYm = comparePeriod(ym, compare);
  const out: UtilityRow[] = [];
  campuses.forEach((campus) =>
    UTILITIES.forEach((u, i) => {
      const current = costOf(campus, i, ym);
      const previous = costOf(campus, i, prevYm);
      out.push({ campus, utility: u.name, current, previous, change: (current - previous) / previous });
    }),
  );
  return out;
}
