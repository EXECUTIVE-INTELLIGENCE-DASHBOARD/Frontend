# Live data: the DNS fix, and the "dash means not on the backend" policy

Status: **done and verified in the browser.**

Two things changed in this pass:

1. The dashboard no longer depends on your machine being able to resolve the
   backend hostname — Vite now proxies `/api` for us.
2. Every figure that the API does not return is rendered as an em dash (`—`),
   never as `0` and never as sample data. You can now tell at a glance what is
   live and what still needs a backend endpoint.

---

## 1. The error you were seeing

```
GET https://eid-backend-4mrm.onrender.com/api/academics/retention/dashboard/
net::ERR_NAME_NOT_RESOLVED
```

`ERR_NAME_NOT_RESOLVED` is **not** an API error, not a CORS error and not a
frontend bug. It means the operating system could not turn
`eid-backend-4mrm.onrender.com` into an IP address, so the request never left
your machine.

Proof it was the resolver and not the backend: asking public DNS directly
returns an answer immediately.

| Resolver | Result |
| --- | --- |
| `1.1.1.1` / `8.8.8.8` | `216.24.57.16` / `216.24.57.18` |
| your ISP / system resolver | NXDOMAIN, intermittently |

The giveaway is the wording. Compare:

| Browser message | Meaning |
| --- | --- |
| `net::ERR_NAME_NOT_RESOLVED` | DNS failed — request never sent |
| `Request failed with status code 500` | The server answered and crashed |
| `Failed to fetch` + CORS text in console | Server answered, headers wrong |

---

## 2. What I changed in the code

### `vite.config.ts` — a dev proxy that does its own DNS

The browser now only ever talks to `http://localhost:5173`. Vite forwards
`/api/*` to the backend, and Vite's outbound connection resolves the hostname
through `1.1.1.1` and `8.8.8.8` instead of your system resolver, so the broken
resolver is bypassed entirely.

```ts
server: {
  host: "0.0.0.0",
  port: 5173,
  strictPort: true,          // unchanged — do not remove
  proxy: {
    "/api": {
      target: backendOrigin, // https://eid-backend-4mrm.onrender.com
      changeOrigin: true,
      secure: true,
      agent: new https.Agent({ keepAlive: true, lookup: publicDnsLookup }),
    },
  },
},
```

`publicDnsLookup` is a `dns.lookup`-compatible function backed by a
`dns.promises.Resolver` pointed at the public resolvers, with a 5-minute address
cache so we do not re-resolve on every request.

### `.env.development` — new, and committed on purpose

```env
VITE_API_URL=/api
VITE_API_BASE_URL=/api
```

Both variables exist because the project has two API layers
(`src/api/axios.ts` reads `VITE_API_URL`, `src/lib/api/client.ts` reads
`VITE_API_BASE_URL`). Pointing both at `/api` in development means the browser
hits the proxy.

Your local `.env` (gitignored) still holds the absolute backend URLs, so
production builds are untouched — in a production build `.env.development` is
not loaded and the absolute URL from `.env` / `.env.example` is used.

### `.gitignore`

Added `!.env.development` so the `/api` dev override is shared with the team
rather than living on one laptop.

---

## 3. Steps for you

### Every time you start work

1. Open a terminal in the project root.
2. Run `npm run dev`.
3. Open `http://localhost:5173`.

That's it — no hosts file edits, no VPN, no dependency on your DNS.

> **Vite reads `vite.config.ts` and `.env*` files only at startup.** If you edit
> either, stop the dev server (Ctrl+C) and start it again. Editing them while it
> runs gives confusing half-applied behaviour.

### Optional — fix it at the machine level too

The proxy fixes the dashboard. If *other* apps on this machine also fail to
reach the backend, the resolver itself is still flaky. To repair it:

```powershell
# 1. Flush the DNS cache (needs an ADMIN PowerShell — it silently fails otherwise)
ipconfig /flushdns

# 2. Point the adapter at public DNS
Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ServerAddresses 1.1.1.1,8.8.8.8

# 3. Confirm the host resolves
Resolve-DnsName eid-backend-4mrm.onrender.com
```

`Set-DnsClientServerAddress` also needs an elevated shell. If you would rather
not change the machine, skip it — the Vite proxy already covers the dashboard.

### How to check whether a request failed on DNS or on the server

```powershell
# Through the proxy (what the browser does now)
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:5173/api/academics/enrollment/dashboard/
```

- prints `200` → everything is fine
- prints `500` → the request reached Django and Django crashed (a backend bug)
- prints nothing / connection error → the dev server is not running

---

## 4. Student Retention: the backend is returning 500

`GET /api/academics/retention/dashboard/` returns HTTP 500 for **every**
combination of parameters, with Django's generic error page and no JSON body:

```
Server Error (500)
```

The same happens with no params, with `?term=8`, and through the proxy — so it
is not the frontend, not the network, and not a filter. It is an unhandled
exception in the Django view. The frontend cannot fix it; it needs a server-side
look at the traceback.

Two related API facts, from `/api/schema/` (OpenAPI 3.0.3):

- **Campus cannot be sent as a query param.** `?campus=kibuli` returns
  `400 {"campus": ["\"kibuli\" is not a valid choice."]}` because the enum wants
  the full labels: `Greenhill Academy kibuli`,
  `Greenhill Academy buwaate`, `Greenhill Academy secondary- kansanga`.
  The page therefore **never sends `campus`** and filters `by_nationality`
  client-side.
- Valid params are `level` (`nursery` | `primary` | `secondary`), `school`
  (integer id), `stream` (`red` | `green` | `purple`, finance only) and `term`
  (integer).

### What to send the backend team

> `GET /api/academics/retention/dashboard/` returns 500 with an empty HTML body.
> Reproduces with no query params. Please check the server traceback for the
> retention dashboard view.

---

## 5. The dash policy

**Rule: `—` means "the API did not report this". `0` always means a real zero.**

Where a value is genuinely not on the backend yet, the card/table cell shows
`—` and a short caption saying so. Nothing is invented.

### Admissions & Enrolment

| Element | Source | Behaviour |
| --- | --- | --- |
| Total students | `summary.total_active_enrolment` | live |
| Capacity | `summary.capacity` (+ `capacity_utilisation`) | live |
| Join rate | `summary.admissions_conversion`, funnel applicants/offered | live |
| Enrolment funnel — applications / shortlisted / interviewed / accepted | `pipeline` | live |
| Enrolment funnel — **offered** | not in the payload | `—`, and the downstream conversion % is suppressed |
| **New students** | not in the payload | always `—` |
| **Returning** | not in the payload | always `—` |
| Gender split | `gender` (currently `0/0` with null percentages) | says "Gender split not reported by the API" |
| Who the learners are (gender / age / day-boarding / faith / nationality) | not in the payload | `— Not reported by the API` |
| Enrolment by school → class, stream, learner rows | no `stream` field and no student names on the API | sample list, labelled *"Class, stream and learner records are not on the API yet — this list is sample data."* |
| Page banner | — | appears only when the request fails: *"Live enrolment data unavailable (…). Every figure stays at "—" until the endpoint answers."* |

### Student Retention

| Element | Source | Behaviour |
| --- | --- | --- |
| Total re-enrolled | `summary.total_re_enrolled` | `—` while the endpoint 500s |
| Re-enrolment rate | `summary.re_enrolment_rate` (preferred) else computed from re-enrolled ÷ eligible | `—` |
| At-risk retention | `summary.at_risk` | `—` |
| Retention by nationality | `by_nationality[]` | rows drop to a single "No nationality data is recorded for this campus yet." line |
| Reasons for withdrawal | `withdrawal_reasons[]` | `—` in place of the donut, plus *"Withdrawal reasons are not reported by the API."* |

The em dash is produced by two helpers so the rule is enforced in one place:

```ts
// src/pages/StudentRetention/studentRetention.data.ts
export const dash = "—";
export const formatMetric = (v: number | null | undefined) =>
  typeof v === "number" ? String(v) : dash;
export const formatRate = (v: number | null | undefined) =>
  typeof v === "number" ? `${v.toFixed(1)}%` : dash;
```

The API types were widened to `number | null` to make this possible
(`re_enrolment_rate`, `retention_rate`, `share`, …). Treating a missing number
as `null` rather than `0` is what stops a broken endpoint from silently looking
like "0% retention".

---

## 6. Verification

`npm run typecheck` → clean.

`npm run test` → **31 files, 265 tests passing.**

In the browser, on `http://localhost:5173`:

- **Admissions & Enrolment** — Total students `2,653`, Capacity `3,070`
  (`86.4% utilised`), Join rate `21.1%` (`190 of 900 applicants`). New students
  and Returning show `—`. Funnel shows `Interviewed → —` and `Offered —`.
- **Student Retention** — red banner *"Unable to load retention data: Request
  failed with status code 500"*, three `—` cards, an empty nationality table and
  a dashed donut reading *"Withdrawal reasons are not reported by the API."*

---

## 7. Known gaps (all backend-side)

1. Retention dashboard endpoint 500s — blocks the whole page.
2. Enrollment payload omits `offered`, `new_students`, `returning`, gender
   (`boys/girls` currently `0/0` with null percentages), age, day/boarding,
   faith and nationality aggregates.
3. No `stream` field anywhere in academics, and no student names, so the class /
   stream / roster panels cannot be live.
