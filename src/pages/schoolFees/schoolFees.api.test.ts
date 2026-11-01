import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import { getSchoolFees, getSchools, getStartedTerms } from "./schoolFees.api";

vi.mock("../../api/axios", () => ({ default: { get: vi.fn() } }));

describe("schoolFees api", () => {
  const get = vi.mocked(api.get);
  beforeEach(() => get.mockReset());

  it("sends only the filters that are set", async () => {
    get.mockResolvedValue({ data: {} });

    await getSchoolFees();
    expect(get).toHaveBeenLastCalledWith("/finance/school-fees/dashboard/", { params: {} });

    await getSchoolFees({ school: 4, term: 6 });
    expect(get).toHaveBeenLastCalledWith("/finance/school-fees/dashboard/", {
      params: { school: 4, term: 6 },
    });

    await getSchoolFees({ start: "2026-01-01", end: "2026-11-01" });
    expect(get).toHaveBeenLastCalledWith("/finance/school-fees/dashboard/", {
      params: { start: "2026-01-01", end: "2026-11-01" },
    });
  });

  it("orders schools by campus, then nursery to secondary", async () => {
    get.mockResolvedValueOnce({
      data: [
        { id: 3, name: "GIS", campus: "gis", level: "primary" },
        { id: 2, name: "Secondary", campus: "kibuli", level: "secondary" },
        { id: 4, name: "Buwaate Nursery", campus: "buwaate", level: "nursery" },
        { id: 1, name: "Nursery", campus: "kibuli", level: "nursery" },
      ],
    });

    expect((await getSchools()).map((school) => school.id)).toEqual([1, 2, 4, 3]);
  });

  it("lists only terms that have started, newest first", async () => {
    get.mockResolvedValueOnce({
      data: {
        results: [
          { id: 1, academic_year: "2026", number: 1, start_date: "2026-01-01" },
          { id: 3, academic_year: "2026", number: 3, start_date: "2026-09-01" },
          { id: 4, academic_year: "2027", number: 1, start_date: "2027-01-01" },
        ],
      },
    });

    const terms = await getStartedTerms(new Date("2026-10-27"));
    expect(terms.map((term) => term.id)).toEqual([3, 1]);
  });
});
