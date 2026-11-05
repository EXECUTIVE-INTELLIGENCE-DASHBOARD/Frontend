import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  Download,
  Gauge,
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";

import api from "../../api/axios";

import type {
  Asset,
  AssetCondition,
  AssetDashboardResponse,
  AssetFilters,
  AssetListResponse,
  AssetSummary,
} from "./assetsEquipment.types";

import "./AssetsEquipment.css";

const emptySummary: AssetSummary = {
  total_assets: 0,
  in_use: 0,
  out_of_use: 0,
  total_value: 0,
  operational_rate: null,
  capital_risk: null,
  capital_at_risk_value: 0,
  units_by_condition: {},
};

const conditionLabels: Record<AssetCondition, string> = {
  operational: "Operational",
  servicing_required: "Servicing Required",
  critical: "Critical / Repair Queued",
  decommissioned: "Decommissioned",
};

const formatNumber = (value: number | string | null | undefined) =>
  Number(value ?? 0).toLocaleString("en-UG", {
    maximumFractionDigits: 0,
  });

const formatCurrency = (value: number | string | null | undefined) =>
  `UGX ${formatNumber(value)}`;

const getAssetRows = (response: AssetListResponse): Asset[] =>
  Array.isArray(response) ? response : (response.results ?? []);

const getConditionLabel = (asset: Asset) =>
  asset.condition_display ||
  conditionLabels[asset.condition] ||
  asset.condition;

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
          };
        };
      }
    ).response;

    return (
      response?.data?.detail ||
      response?.data?.message ||
      "The asset information could not be loaded."
    );
  }

  return "Cannot connect to the server. Please check your connection.";
};

const csvCell = (value: string | number) =>
  `"${String(value).replace(/"/g, '""')}"`;

function downloadCsv(assets: Asset[]) {
  const headers = [
    "Asset Name",
    "Category",
    "Facility",
    "Campus",
    "Quantity",
    "Available Quantity",
    "Unit Value (UGX)",
    "Total Value (UGX)",
    "Condition",
    "Acquired Date",
  ];

  const rows = assets.map((asset) => [
    asset.name,
    asset.category_display || asset.category,
    asset.facility_name,
    asset.campus_display || asset.campus,
    asset.quantity,
    asset.available_quantity,
    asset.unit_value,
    asset.total_value,
    getConditionLabel(asset),
    asset.acquired_date || "",
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "greenhill-asset-register.csv";
  anchor.click();

  URL.revokeObjectURL(url);
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Boxes;
}) {
  return (
    <article className="ae-card">
      <span className="ae-card-icon" aria-hidden="true">
        <Icon size={19} strokeWidth={1.8} />
      </span>

      <div className="ae-card-content">
        <span className="ae-card-label">{label}</span>
        <strong className="ae-card-value">{value}</strong>
        <span className="ae-card-description">{description}</span>
      </div>
    </article>
  );
}

function ConditionSummary({ summary }: { summary: AssetSummary }) {
  const conditions: {
    key: AssetCondition;
    label: string;
    className: string;
  }[] = [
    {
      key: "operational",
      label: "Operational",
      className: "operational",
    },
    {
      key: "servicing_required",
      label: "Servicing Required",
      className: "servicing",
    },
    {
      key: "critical",
      label: "Critical",
      className: "critical",
    },
    {
      key: "decommissioned",
      label: "Decommissioned",
      className: "decommissioned",
    },
  ];

  const total = Object.values(summary.units_by_condition).reduce(
    (sum, value) => sum + Number(value || 0),
    0,
  );

  return (
    <section className="ae-panel ae-condition-panel">
      <div className="ae-panel-heading">
        <div>
          <h2>Asset Condition Overview</h2>
          <p>Distribution of registered asset units by condition</p>
        </div>
      </div>

      <div className="ae-condition-list">
        {conditions.map((condition) => {
          const count = Number(summary.units_by_condition[condition.key] ?? 0);

          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div className="ae-condition-row" key={condition.key}>
              <div className="ae-condition-topline">
                <span className="ae-condition-name">
                  <span className={`ae-condition-dot ${condition.className}`} />
                  {condition.label}
                </span>

                <strong>{formatNumber(count)}</strong>
              </div>

              <div
                className="ae-progress-track"
                role="progressbar"
                aria-label={`${condition.label} assets`}
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`ae-progress-fill ${condition.className}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AssetsEquipment() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<AssetSummary>(emptySummary);

  const [filters, setFilters] = useState<AssetFilters>({
    campus: "",
    category: "",
    facility: "",
    condition: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAssets() {
      setLoading(true);
      setError("");

      try {
        const [assetResponse, dashboardResponse] = await Promise.all([
          api.get<AssetListResponse>("/operations/assets/", {
            signal: controller.signal,
          }),
          api.get<AssetDashboardResponse>("/operations/assets/dashboard/", {
            signal: controller.signal,
          }),
        ]);

        if (controller.signal.aborted) return;

        setAssets(getAssetRows(assetResponse.data));
        setSummary(dashboardResponse.data.summary ?? emptySummary);
      } catch (requestError) {
        if (controller.signal.aborted) return;

        setError(getErrorMessage(requestError));
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadAssets();

    return () => controller.abort();
  }, []);

  const campusOptions = useMemo(
    () =>
      Array.from(
        new Map(
          assets.map((asset) => [
            asset.campus,
            asset.campus_display || asset.campus,
          ]),
        ),
      ).map(([value, label]) => ({ value, label })),
    [assets],
  );

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Map(
          assets.map((asset) => [
            asset.category,
            asset.category_display || asset.category,
          ]),
        ),
      ).map(([value, label]) => ({ value, label })),
    [assets],
  );

  const facilityOptions = useMemo(
    () =>
      Array.from(
        new Map(
          assets.map((asset) => [String(asset.facility), asset.facility_name]),
        ),
      ).map(([value, label]) => ({ value, label })),
    [assets],
  );

  const filteredAssets = useMemo(
    () =>
      assets.filter((asset) => {
        if (filters.campus && asset.campus !== filters.campus) {
          return false;
        }

        if (filters.category && asset.category !== filters.category) {
          return false;
        }

        if (filters.facility && String(asset.facility) !== filters.facility) {
          return false;
        }

        if (filters.condition && asset.condition !== filters.condition) {
          return false;
        }

        return true;
      }),
    [assets, filters],
  );

  const updateFilter = (key: keyof AssetFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      campus: "",
      category: "",
      facility: "",
      condition: "",
    });
  };

  return (
    <div className="ae">
      <div className="ae-page-heading">
        <div>
          <h1>Assets &amp; Equipment</h1>
          <p>
            Institutional asset register, valuation and condition monitoring.
          </p>
        </div>

        <button
          className="ae-btn"
          onClick={() => downloadCsv(filteredAssets)}
          disabled={loading || filteredAssets.length === 0}
        >
          <Download size={16} />
          Export Register
        </button>
      </div>

      {error && (
        <div className="ae-error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="ae-loading">
          <LoaderCircle className="ae-spinner" size={25} />
          <span>Loading asset information...</span>
        </div>
      ) : !error ? (
        <>
          <section className="ae-cards">
            <MetricCard
              icon={Boxes}
              label="Total Assets"
              value={formatNumber(summary.total_assets)}
              description={`${formatNumber(summary.in_use)} in use`}
            />

            <MetricCard
              icon={CheckCircle2}
              label="Operational Rate"
              value={
                summary.operational_rate == null
                  ? "—"
                  : `${Number(summary.operational_rate).toFixed(1)}%`
              }
              description="Operational units against in-service assets"
            />

            <MetricCard
              icon={ShieldAlert}
              label="Capital at Risk"
              value={formatCurrency(summary.capital_at_risk_value)}
              description={
                summary.capital_risk == null
                  ? "Risk percentage unavailable"
                  : `${Number(summary.capital_risk).toFixed(1)}% of asset value`
              }
            />

            <MetricCard
              icon={Gauge}
              label="Total Asset Value"
              value={formatCurrency(summary.total_value)}
              description={`${formatNumber(summary.out_of_use)} units out of use`}
            />
          </section>

          <ConditionSummary summary={summary} />

          <section className="ae-panel ae-register">
            <div className="ae-panel-heading ae-register-heading">
              <div>
                <h2>Institutional Asset Register</h2>
                <p>{formatNumber(filteredAssets.length)} asset records</p>
              </div>

              <button
                className="ae-btn ae-btn-secondary"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>

            <div className="ae-filters">
              <label>
                <span>Campus</span>
                <select
                  value={filters.campus}
                  onChange={(event) =>
                    updateFilter("campus", event.target.value)
                  }
                >
                  <option value="">All Campuses</option>
                  {campusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Category</span>
                <select
                  value={filters.category}
                  onChange={(event) =>
                    updateFilter("category", event.target.value)
                  }
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Facility</span>
                <select
                  value={filters.facility}
                  onChange={(event) =>
                    updateFilter("facility", event.target.value)
                  }
                >
                  <option value="">All Facilities</option>
                  {facilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Condition</span>
                <select
                  value={filters.condition}
                  onChange={(event) =>
                    updateFilter("condition", event.target.value)
                  }
                >
                  <option value="">All Conditions</option>
                  {Object.entries(conditionLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {filteredAssets.length === 0 ? (
              <div className="ae-empty">
                <Boxes size={28} />
                <strong>No assets found</strong>
                <span>There are no asset records matching these filters.</span>
              </div>
            ) : (
              <div className="ae-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Asset Name</th>
                      <th>Category</th>
                      <th>Facility &amp; Campus</th>
                      <th className="r">Quantity</th>
                      <th className="r">Available</th>
                      <th className="r">Unit Value</th>
                      <th className="r">Total Value</th>
                      <th>Condition</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id}>
                        <td className="ae-asset-name" data-label="Asset Name">
                          {asset.name}
                        </td>

                        <td data-label="Category">
                          {asset.category_display || asset.category}
                        </td>

                        <td data-label="Facility & Campus">
                          <strong>{asset.facility_name}</strong>
                          <span className="ae-campus">
                            {asset.campus_display || asset.campus}
                          </span>
                        </td>

                        <td className="r" data-label="Quantity">
                          {formatNumber(asset.quantity)}
                        </td>

                        <td className="r" data-label="Available">
                          {formatNumber(asset.available_quantity)}
                        </td>

                        <td className="r" data-label="Unit Value">
                          {formatNumber(asset.unit_value)}
                        </td>

                        <td
                          className="r ae-value"
                          data-label="Total Value"
                        >
                          {formatNumber(asset.total_value)}
                        </td>

                        <td data-label="Condition">
                          <span className={`ae-status ${asset.condition}`}>
                            {getConditionLabel(asset)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

export default AssetsEquipment;
