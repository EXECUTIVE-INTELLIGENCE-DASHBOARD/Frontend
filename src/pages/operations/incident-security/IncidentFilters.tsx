import type { IncidentCountRow, IncidentDashboardFilters } from "../incidentSecurity.types";

interface IncidentFiltersProps {
  filters: IncidentDashboardFilters;
  startDate: string;
  endDate: string;
  campuses: IncidentCountRow[];
  categories: IncidentCountRow[];
  onChange: (filters: IncidentDashboardFilters) => void;
}

export function IncidentFilters({
  filters,
  startDate,
  endDate,
  campuses,
  categories,
  onChange,
}: IncidentFiltersProps) {
  return (
    <section
      className="academic-performance__filters incident-security-filters"
      aria-label="Incident filters"
    >
      <label className="academic-performance__filter">
        <span className="academic-performance__filter-label">Campus</span>
        <div className="academic-performance__select-wrapper">
          <select
            aria-label="Campus"
            value={filters.campus ?? ""}
            onChange={(event) =>
              onChange({ ...filters, campus: event.target.value })
            }
          >
            <option value="">All Campuses</option>
            {campuses.map((campus) => (
              <option key={campus.code} value={campus.code}>
                {campus.label}
              </option>
            ))}
          </select>
        </div>
      </label>

      <label className="academic-performance__filter">
        <span className="academic-performance__filter-label">Incident Type</span>
        <div className="academic-performance__select-wrapper">
          <select
            aria-label="Incident type"
            value={filters.category ?? ""}
            onChange={(event) =>
              onChange({ ...filters, category: event.target.value })
            }
          >
            <option value="">All Types</option>
            {categories.map((category) => (
              <option key={category.code} value={category.code}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </label>

      <div className="academic-performance__filter">
        <span className="academic-performance__filter-label">Date Range</span>
        <div className="incident-security-date-range">
          <label>
            <span className="incident-security-sr-only">Start date</span>
            <input
              aria-label="Start date"
              type="date"
              value={filters.start ?? startDate}
              max={filters.end ?? endDate}
              onChange={(event) =>
                onChange({ ...filters, start: event.target.value })
              }
            />
          </label>
          <span
            className="incident-security-date-range__separator"
            aria-hidden="true"
          >
            →
          </span>
          <label>
            <span className="incident-security-sr-only">End date</span>
            <input
              aria-label="End date"
              type="date"
              value={filters.end ?? endDate}
              min={filters.start ?? startDate}
              onChange={(event) =>
                onChange({ ...filters, end: event.target.value })
              }
            />
          </label>
        </div>
      </div>
    </section>
  );
}
