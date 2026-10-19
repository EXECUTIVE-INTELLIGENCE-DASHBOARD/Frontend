import { describe, expect, it } from "vitest";

import { buildCsv, csvFileName } from "./csv";

describe("buildCsv", () => {
  it("writes a header row and one line per row", () => {
    const csv = buildCsv(["Name", "Total"], [
      ["Buses", 6],
      ["Generator", 2],
    ]);

    expect(csv.split("\r\n")).toEqual(["Name,Total", "Buses,6", "Generator,2"]);
  });

  it("quotes cells that contain commas, quotes or line breaks", () => {
    const csv = buildCsv(["Name"], [['Debate, "Open"'], ["Line\nbreak"]]);

    expect(csv).toContain('"Debate, ""Open"""');
    expect(csv).toContain('"Line\nbreak"');
  });
});

describe("csvFileName", () => {
  it("builds a file name from the prefix and the campus", () => {
    expect(csvFileName("hr-workforce", "Annex / Preschool Branch")).toBe(
      "hr-workforce-annex-preschool-branch.csv",
    );
  });
});
