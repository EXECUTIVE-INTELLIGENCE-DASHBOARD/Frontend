import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",

    /*
     * Run each test file in its own child process instead of a worker thread.
     *
     * This is not a performance preference — it is required for the suite to
     * run at all when stdout is not a TTY (CI, `> file`, piped output).
     *
     * Vitest tracks "the current suite" in an AsyncLocalStorage context so
     * that the `afterEach` hook registered in `src/test/setup.ts` knows which
     * suite it belongs to. With the default `threads` pool that context is
     * lost as soon as stdout is redirected, so every setup file throws:
     *
     *     Error: Vitest failed to find the current suite.
     *     ❯ src/test/setup.ts:5:1   ( the afterEach call )
     *
     * The result is every suite reporting "(0 test)" and the run failing with
     * "Tests  no tests" — which looks like a broken test suite but is really
     * just a lost context. Child processes carry the context correctly, so
     * `forks` behaves identically whether or not output is redirected.
     *
     * Do not change this back to `threads` without re-running the suite with
     * redirected output: `npm test > log.txt 2>&1`.
     */
    pool: "forks",

    restoreMocks: true,
    clearMocks: true,
  },
});

