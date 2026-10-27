import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import { getIncidentDashboard } from "./incidentSecurity.api";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockGet = vi.mocked(api.get);

describe("getIncidentDashboard", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockGet.mockRejectedValue(new Error("Request captured by test"));
  });

  it("uses the shared axios client with filters and cancellation signal", async () => {
    const controller = new AbortController();

    await expect(
      getIncidentDashboard(
        { start: "2025-10-28", end: "2026-10-27" },
        controller.signal,
      ),
    ).rejects.toThrow("Request captured by test");

    expect(mockGet).toHaveBeenCalledWith(
      "/operations/incidents/dashboard/",
      {
        params: { start: "2025-10-28", end: "2026-10-27" },
        signal: controller.signal,
      },
    );
  });
});
