import { useEffect, useState } from "react";
import { getCleaning, getFurniture, getUtilities, getWorkOrders } from "./facilities.api";
import type { CleaningDay, Compare, FurnitureRow, SectionName, UtilityRow, WorkOrder } from "./facilities.types";

interface Query {
  campuses: string[];
  section: SectionName;
  days: number[];
  furnitureDate: number;
  period: number;
  compare: Compare;
}

export function useFacilities(q: Query) {
  const [data, setData] = useState<{ orders: WorkOrder[]; cleaning: CleaningDay[]; furniture: FurnitureRow[]; utilities: UtilityRow[] }>(
    { orders: [], cleaning: [], furniture: [], utilities: [] },
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const key = JSON.stringify(q);

  useEffect(() => {
    let live = true;
    setLoading(true);
    setError(null);
    Promise.all([
      getWorkOrders(q.campuses),
      getCleaning(q.campuses, q.days),
      getFurniture(q.campuses, q.section, q.furnitureDate),
      getUtilities(q.campuses, q.period, q.compare),
    ])
      .then(([orders, cleaning, furniture, utilities]) => live && setData({ orders, cleaning, furniture, utilities }))
      .catch(() => live && setError("Facilities data could not be loaded."))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [key]);

  return { ...data, loading, error };
}
