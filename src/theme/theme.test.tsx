import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { App } from "../App";
import { THEME_STORAGE_KEY } from "./theme";

function getToggle() {
  return screen.getByRole("button", {
    name: /switch to (dark|light) appearance/i,
  });
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  cleanup();
});

describe("theme", () => {
  it("defaults to the light theme", () => {
    render(<App />);

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(getToggle()).toHaveAccessibleName("Switch to dark appearance");
  });

  it("switches to the dark theme and persists the choice", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(getToggle());

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(getToggle()).toHaveAccessibleName("Switch to light appearance");
  });

  it("restores a stored dark preference", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "dark");

    render(<App />);

    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
