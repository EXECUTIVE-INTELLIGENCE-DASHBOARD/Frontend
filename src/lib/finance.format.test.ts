import { describe, expect, it } from "vitest";

import { formatUgx, shortSchoolName } from "./finance.format";

describe("formatUgx", () => {
  it("uses millions and billions", () => {
    expect(formatUgx(513_950_000)).toBe("514M");
    expect(formatUgx(18_500_000)).toBe("18.5M");
    expect(formatUgx(1_876_729)).toBe("1.88M");
    expect(formatUgx(1_654_550_000)).toBe("1.65B");
    expect(formatUgx(950_000)).toBe("950K");
    expect(formatUgx(0)).toBe("0");
  });
});

describe("shortSchoolName", () => {
  it("names a school by campus and section", () => {
    expect(shortSchoolName("GreenHill Academy Nursery Kibuli", "kibuli")).toBe("Kibuli Nursery");
    expect(shortSchoolName("Green Hill Academy Secondary School Kibuli", "kibuli"))
      .toBe("Kibuli Secondary");
    expect(shortSchoolName("GreenHill Academy Primary Buwaate", "buwaate")).toBe("Buwaate Primary");
  });

  it("calls the international school GIS", () => {
    expect(shortSchoolName("Greenhill International School", "gis")).toBe("GIS");
  });

  it("keeps a name it cannot shorten", () => {
    expect(shortSchoolName("Kibuli Campus", "kibuli")).toBe("Kibuli Campus");
  });
});
