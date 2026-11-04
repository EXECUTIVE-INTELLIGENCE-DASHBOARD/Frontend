import { describe, expect, it } from "vitest";

import {
  getSecondaryLevel,
  isInternationalCampus,
} from "./AcademicAnalytics";

describe("getSecondaryLevel", () => {
  it.each([
    ["O Level", "O Level"],
    ["o_level", "O Level"],
    ["S1", "O Level"],
    ["S.4", "O Level"],
    ["A Level", "A Level"],
    ["a_level", "A Level"],
    ["S5", "A Level"],
    ["S.6", "A Level"],
  ] as const)("maps %s to %s", (input, expected) => {
    expect(getSecondaryLevel(input)).toBe(expected);
  });

  describe("isInternationalCampus", () => {
    it.each(["international", "gis_kansanga", "GIS Kansanga"])(
      "recognizes %s as the international campus",
      (campus) => {
        expect(isInternationalCampus(campus)).toBe(true);
      },
    );

    it("does not classify Kibuli as international", () => {
      expect(isInternationalCampus("kibuli")).toBe(false);
    });
  });

  it("does not classify primary classes as secondary levels", () => {
    expect(getSecondaryLevel("P.7")).toBeNull();
  });
});
