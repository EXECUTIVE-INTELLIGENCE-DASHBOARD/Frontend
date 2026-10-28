import { describe, expect, it } from "vitest";

import { navigationItems } from "./navigation.config";

describe("navigation config", () => {
  it("lists the Operational sub-items in the approved order", () => {
    const operations = navigationItems.find((item) => item.id === "operations");

    expect(operations?.children.map((child) => child.label)).toEqual([
      "HR & Workforce",
      "Facilities & Maintenance",
      "Incidents & Security",
      "Asset Management",
      "Fleet & Transport",
    ]);
  });
});
