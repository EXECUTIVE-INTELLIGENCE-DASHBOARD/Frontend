import api from "../../api/axios";
import type {
  IncidentDashboardData,
  IncidentDashboardFilters,
} from "./incidentSecurity.types";

export async function getIncidentDashboard(
  filters: IncidentDashboardFilters = {},
  signal?: AbortSignal,
): Promise<IncidentDashboardData> {
  const response = await api.get<IncidentDashboardData>(
    "/operations/incidents/dashboard/",
    { params: filters, signal },
  );

  return response.data;
}
