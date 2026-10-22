import type { AxiosRequestConfig } from "axios";

import { apiClient } from "./client";
import type { Paginated } from "./types";

export type QueryValue = string | number | boolean | null | undefined;

/** Query string values. The backend has no filtering yet, so these are inert — but
 *  they are sent verbatim, which means enabling `django-filter` later needs no
 *  frontend change. */
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export interface RequestOptions {
  /** Passed straight to axios so React Query can cancel stale requests. */
  signal?: AbortSignal;
}

function requestConfig(options?: RequestOptions): AxiosRequestConfig {
  return options?.signal ? { signal: options.signal } : {};
}

/** Serialise params, dropping empties so `?campus=` is never sent. */
export function toSearchParams(params?: QueryParams): URLSearchParams {
  const search = new URLSearchParams();
  if (!params) return search;

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === null || item === undefined || item === "") continue;
        search.append(key, String(item));
      }
      continue;
    }

    if (value === null || value === undefined || value === "") continue;
    search.set(key, String(value));
  }

  return search;
}

/** Append a query string to a path. */
export function withQuery(path: string, params?: QueryParams): string {
  const search = toSearchParams(params).toString();
  return search ? `${path}?${search}` : path;
}

/**
 * The backend currently returns bare arrays. This unwraps either a bare array
 * or a DRF paginated envelope, so switching on pagination is a no-op here.
 */
export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (payload && typeof payload === "object") {
    const results = (payload as Paginated<T>).results;
    if (Array.isArray(results)) return results;
  }

  return [];
}

/** Standard CRUD surface shared by every backend resource. */
export interface CrudResource<TRow, TCreate = Partial<TRow>, TUpdate = Partial<TCreate>> {
  /** Resource path relative to the API base, e.g. `"finance/liabilities/"`. */
  readonly path: string;
  list(params?: QueryParams, options?: RequestOptions): Promise<TRow[]>;
  retrieve(id: number | string, options?: RequestOptions): Promise<TRow>;
  create(payload: TCreate, options?: RequestOptions): Promise<TRow>;
  update(
    id: number | string,
    payload: TUpdate,
    options?: RequestOptions,
  ): Promise<TRow>;
  patch(
    id: number | string,
    payload: TUpdate,
    options?: RequestOptions,
  ): Promise<TRow>;
  destroy(id: number | string, options?: RequestOptions): Promise<void>;
}

/**
 * Build a typed CRUD wrapper for one router-registered resource.
 *
 * @example
 * export const liabilities = createCrudResource<Liability>("finance/liabilities");
 */
export function createCrudResource<
  TRow,
  TCreate = Partial<TRow>,
  TUpdate = Partial<TCreate>,
>(
  basePath: string,
): CrudResource<TRow, TCreate, TUpdate> {
  const path = `${basePath.replace(/^\/+|\/+$/g, "")}/`;
  const itemPath = (id: number | string) => `${path}${id}/`;

  return {
    path,

    async list(params, options) {
      const response = await apiClient.get<unknown>(
        withQuery(path, params),
        requestConfig(options),
      );

      return unwrapList<TRow>(response.data);
    },

    async retrieve(id, options) {
      const response = await apiClient.get<TRow>(
        itemPath(id),
        requestConfig(options),
      );

      return response.data;
    },

    async create(payload, options) {
      const response = await apiClient.post<TRow>(
        path,
        payload,
        requestConfig(options),
      );

      return response.data;
    },

    async update(id, payload, options) {
      const response = await apiClient.put<TRow>(
        itemPath(id),
        payload,
        requestConfig(options),
      );

      return response.data;
    },

    async patch(id, payload, options) {
      const response = await apiClient.patch<TRow>(
        itemPath(id),
        payload,
        requestConfig(options),
      );

      return response.data;
    },

    async destroy(id, options) {
      await apiClient.delete(itemPath(id), requestConfig(options));
    },
  };
}
