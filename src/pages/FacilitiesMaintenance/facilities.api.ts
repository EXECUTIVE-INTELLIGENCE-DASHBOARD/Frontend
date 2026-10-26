import { buildCleaning, buildFurniture, buildUtilities, buildWorkOrders } from "./facilities.data";
import type { CleaningDay, Compare, FurnitureRow, SectionName, UtilityRow, WorkOrder } from "./facilities.types";

/**
 * TODO: replace each stub with a real endpoint (for example through
 * src/lib/api/operational.ts). Suggested shapes:
 *   GET /operations/work-orders?campus=&from=&to=   one row per work order
 *   GET /operations/cleaning?campus=&from=&to=      per day: complete / incomplete / missing
 *   GET /operations/furniture?campus=&section=&date= class size, chairs, desks
 *   GET /operations/utilities?campus=&period=&compare=  cost per campus and utility
 */
export const getWorkOrders = async (campuses: string[]): Promise<WorkOrder[]> => buildWorkOrders(campuses);
export const getCleaning = async (campuses: string[], days: number[]): Promise<CleaningDay[]> => buildCleaning(campuses, days);
export const getFurniture = async (campuses: string[], section: SectionName, date: number): Promise<FurnitureRow[]> =>
  date ? buildFurniture(campuses, section, date) : [];
export const getUtilities = async (campuses: string[], ym: number, compare: Compare): Promise<UtilityRow[]> =>
  buildUtilities(campuses, ym, compare);
