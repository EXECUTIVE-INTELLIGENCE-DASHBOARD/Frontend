
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import { AssetsEquipment } from "./AssetsEquipment";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockAssets = [
  {
    id: 1,
    name: "Dell Desktop Computers",
    category: "computer_equipment",
    category_display: "ICT Hardware",
    facility: 1,
    facility_name: "Kibuli Computer Lab",
    campus: "kibuli",
    campus_display: "Kibuli",
    quantity: 60,
    available_quantity: 55,
    unit_value: "2200000.00",
    total_value: "132000000.00",
    condition: "operational",
    condition_display: "Operational (Good)",
    acquired_date: "2024-01-15",
  },
  {
    id: 2,
    name: "Smart Projectors",
    category: "computer_equipment",
    category_display: "ICT Hardware",
    facility: 1,
    facility_name: "Kibuli Computer Lab",
    campus: "kibuli",
    campus_display: "Kibuli",
    quantity: 8,
    available_quantity: 6,
    unit_value: "3500000.00",
    total_value: "28000000.00",
    condition: "servicing_required",
    condition_display: "Servicing Required",
    acquired_date: "2024-03-10",
  },
  {
    id: 3,
    name: "Chemistry Lab Benches",
    category: "laboratory_equipment",
    category_display: "Science Laboratory Equipment",
    facility: 2,
    facility_name: "Buwaate Science Lab",
    campus: "buwaate",
    campus_display: "Buwaate",
    quantity: 12,
    available_quantity: 12,
    unit_value: "2800000.00",
    total_value: "33600000.00",
    condition: "operational",
    condition_display: "Operational (Good)",
    acquired_date: "2023-08-20",
  },
];

const mockDashboard = {
  summary: {
    total_assets: 80,
    in_use: 75,
    out_of_use: 5,
    total_value: "193600000.00",
    operational_rate: 80,
    capital_risk: 20,
    capital_at_risk_value: "5000000.00",
    units_by_condition: {
      operational: 72,
      servicing_required: 5,
      critical: 2,
      decommissioned: 1,
    },
  },
  assets: mockAssets,
};

const originalCreateObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  "createObjectURL",
);

const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(
  URL,
  "revokeObjectURL",
);

describe("AssetsEquipment", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(api.get).mockImplementation((url) => {
      if (url === "/operations/assets/") {
        return Promise.resolve({
          data: mockAssets,
        } as never);
      }

      if (url === "/operations/assets/dashboard/") {
        return Promise.resolve({
          data: mockDashboard,
        } as never);
      }

      return Promise.reject(
        new Error(`Unexpected endpoint: ${url}`),
      );
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();

    if (originalCreateObjectURL) {
      Object.defineProperty(
        URL,
        "createObjectURL",
        originalCreateObjectURL,
      );
    } else {
      Reflect.deleteProperty(URL, "createObjectURL");
    }

    if (originalRevokeObjectURL) {
      Object.defineProperty(
        URL,
        "revokeObjectURL",
        originalRevokeObjectURL,
      );
    } else {
      Reflect.deleteProperty(URL, "revokeObjectURL");
    }
  });

  it("loads the dashboard summary from the API", async () => {
    render(<AssetsEquipment />);

    expect(await screen.findByText("Total Assets")).toBeTruthy();

    expect(screen.getByText("80")).toBeTruthy();
    expect(screen.getByText("80.0%")).toBeTruthy();
    expect(screen.getByText("UGX 5,000,000")).toBeTruthy();

    expect(api.get).toHaveBeenCalledWith(
      "/operations/assets/",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );

    expect(api.get).toHaveBeenCalledWith(
      "/operations/assets/dashboard/",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("displays asset records returned by the API", async () => {
    render(<AssetsEquipment />);

    expect(
      await screen.findByText("Dell Desktop Computers"),
    ).toBeTruthy();

    expect(screen.getByText("Smart Projectors")).toBeTruthy();
    expect(screen.getByText("Chemistry Lab Benches")).toBeTruthy();

    expect(screen.getByText("132,000,000")).toBeTruthy();

    expect(
      screen.getByText("Servicing Required", {
        selector: "span.ae-status",
      }),
    ).toBeTruthy();
  });

  it("filters asset records by campus", async () => {
    render(<AssetsEquipment />);

    await screen.findByText("Dell Desktop Computers");

    fireEvent.change(screen.getByLabelText("Campus"), {
      target: { value: "buwaate" },
    });

    expect(screen.getByText("Chemistry Lab Benches")).toBeTruthy();

    expect(screen.queryByText("Dell Desktop Computers")).toBeNull();
    expect(screen.queryByText("Smart Projectors")).toBeNull();
  });

  it("filters asset records by condition", async () => {
    render(<AssetsEquipment />);

    await screen.findByText("Dell Desktop Computers");

    fireEvent.change(screen.getByLabelText("Condition"), {
      target: { value: "servicing_required" },
    });

    expect(screen.getByText("Smart Projectors")).toBeTruthy();

    expect(screen.queryByText("Dell Desktop Computers")).toBeNull();
    expect(screen.queryByText("Chemistry Lab Benches")).toBeNull();
  });

  it("resets the selected filters", async () => {
    render(<AssetsEquipment />);

    await screen.findByText("Dell Desktop Computers");

    fireEvent.change(screen.getByLabelText("Campus"), {
      target: { value: "buwaate" },
    });

    expect(screen.queryByText("Dell Desktop Computers")).toBeNull();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Reset Filters/i,
      }),
    );

    expect(screen.getByText("Dell Desktop Computers")).toBeTruthy();
    expect(screen.getByText("Chemistry Lab Benches")).toBeTruthy();
    expect(screen.getByText("Smart Projectors")).toBeTruthy();
  });

  it("exports the visible asset records", async () => {
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectURL,
    });

    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: revokeObjectURL,
    });

    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<AssetsEquipment />);

    await screen.findByText("Dell Desktop Computers");

    fireEvent.click(
      screen.getByRole("button", {
        name: /Export Register/i,
      }),
    );

    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(click).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
    });
  });

  it("displays an error when the API request fails", async () => {
    vi.mocked(api.get).mockRejectedValue(
      new Error("Network error"),
    );

    render(<AssetsEquipment />);

    expect(await screen.findByRole("alert")).toBeTruthy();

    expect(
      screen.getByText(
        "Cannot connect to the server. Please check your connection.",
      ),
    ).toBeTruthy();
  });
});
