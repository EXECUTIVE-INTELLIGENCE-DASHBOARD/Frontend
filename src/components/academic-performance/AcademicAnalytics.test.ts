import { describe, expect, it } from "vitest";

import {
  getSecondaryLevel,
  isInternationalCampus,
} from "./AcademicAnalytics";

describe("AcademicAnalytics helpers", () => {
  it("recognizes international campuses by their name", () => {
    expect(isInternationalCampus("Greenhill International")).toBe(true);
    expect(isInternationalCampus("Kibuli Main Campus")).toBe(false);
  });

  it("maps secondary class labels to their academic level", () => {
    expect(getSecondaryLevel("S.4")).toBe("O Level");
    expect(getSecondaryLevel("S.5")).toBe("A Level");
    expect(getSecondaryLevel("Primary 7")).toBeNull();
  });
});
