import dns from "node:dns";
import https from "node:https";
import net from "node:net";
import type { LookupFunction } from "node:net";

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/* --------------------------------------------------------------- Dev proxy
 *
 * The browser used to call the Django backend directly, which made every
 * request depend on the *system* resolver. On networks where that resolver
 * cannot answer for `eid-backend-4mrm.onrender.com` the browser fails with
 * `net::ERR_NAME_NOT_RESOLVED` and Node fails with `ENOTFOUND`, even though
 * public resolvers return the host fine (216.24.57.16 / 216.24.57.18).
 *
 * Serving the API from the dev server removes the browser's dependency on
 * DNS entirely: the page only ever talks to localhost:5173, and the outbound
 * lookup below runs inside Node against resolvers that are known to work.
 *
 * Nothing here ships to production — `vite build` ignores `server.proxy`.
 */
const backendOrigin = "https://eid-backend-4mrm.onrender.com";

const resolver = new dns.promises.Resolver({ timeout: 5000, tries: 3 });
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

/* Render rotates addresses occasionally, so cache briefly instead of forever. */
const addressTtlMs = 5 * 60 * 1000;
const addressCache = new Map<string, { address: string; expires: number }>();

async function addressFor(hostname: string): Promise<string> {
  const cached = addressCache.get(hostname);

  if (cached && cached.expires > Date.now()) {
    return cached.address;
  }

  const [address] = await resolver.resolve4(hostname);

  if (!address) {
    throw new Error(`No IPv4 address returned for ${hostname}`);
  }

  addressCache.set(hostname, { address, expires: Date.now() + addressTtlMs });

  return address;
}

const publicDnsLookup: LookupFunction = (hostname, options, callback) => {
  const literal = net.isIP(hostname);

  if (literal !== 0) {
    callback(null, hostname, literal);
    return;
  }

  addressFor(hostname).then(
    (address) => {
      if (options.all) {
        callback(null, [{ address, family: 4 }]);
        return;
      }

      callback(null, address, 4);
    },
    (error: Error) => callback(error, "", 4),
  );
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: backendOrigin,
        changeOrigin: true,
        secure: true,
        agent: new https.Agent({
          keepAlive: true,
          lookup: publicDnsLookup,
        }),
      },
    },
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

