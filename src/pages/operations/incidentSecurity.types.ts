export interface IncidentDashboardFilters {
  campus?: string;
  category?: string;
  start?: string;
  end?: string;
}

export interface IncidentSummary {
  total: number;
  open: number;
  closed: number;
  overdue: number;
  escalated: number;
  serious_open: number;
  duplicates_left_out: number;
}

export interface IncidentCountRow {
  code: string;
  label: string;
  incidents: number;
}

export interface IncidentMonthRow {
  month: string;
  incidents: number;
}

export interface IncidentCoverageRow {
  campus: string;
  label: string;
  months_with_records: number;
  months_without_records: string[];
}

export interface IncidentAttentionRow {
  id: number;
  reference: string;
  campus: string;
  category: string;
  severity: string;
  status: string;
  owner: string | null;
  follow_up_action: string;
  follow_up_due: string | null;
  overdue: boolean;
  escalated_to: string | null;
  reasons: string[];
}

export interface IncidentDashboardData {
  start: string;
  end: string;
  summary: IncidentSummary;
  by_campus: IncidentCountRow[];
  by_category: IncidentCountRow[];
  by_severity: IncidentCountRow[];
  by_source: IncidentCountRow[];
  by_month: IncidentMonthRow[];
  coverage: IncidentCoverageRow[];
  needs_attention: IncidentAttentionRow[];
}
