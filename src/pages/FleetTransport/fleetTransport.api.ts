/**
 * Live fleet register.
 *
 * The transport screens are backed by `/operations/assets/dashboard/` filtered
 * to the `vehicle` category — the only fleet data the API exposes today. There
 * is no endpoint for delays, breakdowns, servicing, repairs, incidents, fuel or
 * mileage, so those views show an em dash until the backend adds them.
 */
import { useEffect, useState } from "react";

import api from "../../api/axios";
import { toVehicle } from "./fleetTransport.data";
import type { FleetVehicle } from "./fleetTransport.types";

interface AssetRowPayload {
  id: number;
  name: string;
  category: string;
  campus: string;
  campus_display?: string;
  facility_name?: string;
  quantity?: number | null;
  unit_value?: string | null;
  total_value?: string | null;
  condition?: string;
  condition_display?: string;
  acquired_date?: string | null;
}

interface AssetDashboardPayload {
  summary?: {
    total_assets?: number;
    total_value?: string | null;
    operational_rate?: number | null;
  };
  assets?: AssetRowPayload[];
}

export interface FleetRegisterData {
  vehicles: FleetVehicle[];
  operationalRate: number | null;
  /** Raw `total_value` from the dashboard summary, in UGX. */
  reportedTotalValue: number | null;
}

export interface FleetRegisterState {
  data: FleetRegisterData | null;
  error: string | null;
  isPending: boolean;
}

export async function fetchFleetRegister(
  signal?: AbortSignal,
): Promise<FleetRegisterData> {
  const { data } = await api.get<AssetDashboardPayload>(
    "/operations/assets/dashboard/",
    { params: { category: "vehicle" }, signal },
  );

  const vehicles = (data.assets ?? []).map(toVehicle);
  const reported = data.summary?.total_value;

  return {
    vehicles,
    operationalRate: data.summary?.operational_rate ?? null,
    reportedTotalValue:
      reported === null || reported === undefined ? null : Number(reported),
  };
}

export function useFleetRegister(): FleetRegisterState {
  const [state, setState] = useState<FleetRegisterState>({
    data: null,
    error: null,
    isPending: true,
  });

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetchFleetRegister(controller.signal)
      .then((data) => {
        if (active) setState({ data, error: null, isPending: false });
      })
      .catch((error: unknown) => {
        if (!active || controller.signal.aborted) return;

        setState({
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
          isPending: false,
        });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return state;
}
