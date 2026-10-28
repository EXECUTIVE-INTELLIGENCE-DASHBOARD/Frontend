# Admissions & Enrolment — live data wiring

Status: **wired and verified**. The page now reads the Django enrollment API and
falls back to the seeded dataset only when the request fails.

> **Historical record — do not follow the `.env` step below.** The project now
> commits `.env.development` and `.env.production`, both set to `/api`, because
> the Vite dev proxy and the production nginx server both forward `/api` to the
> backend. Creating a local `.env` with an absolute Render URL hard-codes a host
> into the bundle and breaks the deployed build. See
> `docs/digitalocean-deploy.md`.

---

## 1. What was broken

Two separate problems kept the numbers static:

1. **Wrong base URL.** `src/api/axios.ts` uses
   `import.meta.env.VITE_API_URL || "/api"`. No `.env` file existed, so every
   request went to `http://localhost:5173/api/...` (the Vite dev server) and
   returned 404 instead of reaching Django.
2. **The hook was never called.** `useEnrollmentDashboard` and
   `aggregateFromDashboard` were exported from
   `src/pages/AdmissionsEnrollment/admissionsEnrollment.api.ts` but nothing
   imported them, so `AdmissionsEnrollment.tsx` always computed `summary` from
   `admissionsEnrollment.data.ts` seed rows.

---

## 2. Files changed

### `\.env` (new — gitignored, never commit)

```env
# Base URL for the shared axios instance (src/api/axios.ts).
VITE_API_URL=https://eid-backend-4mrm.onrender.com/api

# Base URL for the newer fetch client (src/lib/api/client.ts).
VITE_API_BASE_URL=https://eid-backend-4mrm.onrender.com/api
```

Both variables are set because the project has two API layers and they read
different names.

> Vite only reads env files **at startup**. After editing `.env` you must stop
> and restart `npm run dev`.

### `src/pages/AdmissionsEnrollment/AdmissionsEnrollment.tsx`

**a. New import**

```tsx
import {
  aggregateFromDashboard,
  backendSchoolIdFor,
  useEnrollmentDashboard,
  type AcademicDashboardFilters,
} from "./admissionsEnrollment.api";
```

**b. School slug → backend id, then the live hook**

The dashboard uses string slugs (`kibuli-primary`); the API uses numeric
primary keys (`8`). `backendSchoolIdFor` performs the translation. An unmapped
slug deliberately becomes `{}` (no filter) rather than `school: NaN`.

```tsx
const liveFilters = useMemo<AcademicDashboardFilters>(() => {
  if (isAllSchools) {
    return {};
  }

  const schoolId = backendSchoolIdFor(filters.school);

  return schoolId === undefined ? {} : { school: schoolId };
}, [isAllSchools, filters.school]);

const live = useEnrollmentDashboard(liveFilters);
const isLive = live.data !== null;
```

**c. Seeded data demoted to a fallback**

```tsx
const seededSummary = useMemo(
  () => (isAllSchools ? averageAcrossSchools(filters) : totals),
  [isAllSchools, filters, totals],
);

const summary = useMemo(
  () => (live.data ? aggregateFromDashboard(live.data) : seededSummary),
  [live.data, seededSummary],
);
```

Because the single `summary` object now feeds the KPI row, `ProfilePanel`, and
`AdmissionsFunnel`, all three render live figures with no further changes.

**d. Visible fallback notice**

Rendered directly above the KPI section. It uses `role="alert"` on purpose —
`role="status"` would have collided with the learner-search banner, which the
test suite queries by that role.

```tsx
{live.error ? (
  <p className="ae-empty" role="alert">
    Live enrolment data unavailable ({live.error}). Showing the seeded
    dataset instead.
  </p>
) : null}
```

It reuses the existing `.ae-empty` class, so no CSS was added.

**e. Honest placeholders for fields the API does not expose**

| Card | Live behaviour | Why |
| --- | --- | --- |
| Total students | `total_active_enrolment` | live |
| Roll at start | live active roll (no separate opening figure exists) | assumption |
| New students | `—` · "Not reported by the API" | no new-vs-returning flag |
| Returning | `—` · "Not reported by the API" | no new-vs-returning flag |
| Join rate | `admissions_conversion` | live |

The Total students caption also degrades to "Gender split not reported by the
API" when `gender.boys + gender.girls === 0`, instead of claiming "0 girls · 0 boys".

---

## 3. How to verify

```powershell
npm.cmd run dev
```

Open <http://localhost:5173>, pick **Academics → Admissions & Enrolment**.

Expected with the backend reachable:

| State | Total | Join rate |
| --- | --- | --- |
| All schools | **2,653** | **21.1%** (190 of 900 applicants) |
| Primary – Kibuli | **518** | **24.4%** (39 of 160 applicants) |

`518` and `84.9% of capacity` match the endpoint's own
`{ id: 8, enrolled: 518, capacity: 610 }` entry, which proves the `school`
query parameter is reaching Django.

Checks run after the change:

- `npm.cmd run typecheck` — clean
- `npm.cmd run test` — **31 files, 265 tests, all passing** (including the 12
  Admissions & Enrolment tests)

### Offline / backend asleep

Render's free tier sleeps. If the service is cold or DNS fails you will see:

> Live enrolment data unavailable (Network Error). Showing the seeded dataset
> instead.

…and the page keeps working on seed data. That is intended, not a bug.

---

## 4. Known gaps (backend side)

These are the reason some parts still show seed data. None of them are
frontend bugs.

1. **`gender` is currently `{boys: 0, girls: 0}`.** The endpoint returned
   `1313 / 1340` earlier in the same session and `0 / 0` later, with the
   summary totals unchanged. Needs a backend check — the aggregation is
   intermittent or the underlying profile data changed.
2. **No new-vs-returning flag.** `Enrolment` has no field distinguishing a new
   learner from a continuing one. Workaround: derive it from the earliest
   `term` per `student`.
3. **5 pipeline stages, UI draws 6.** The API returns
   `applied → qualified → interviewed → accepted → enrolled`. The UI funnel has
   an extra "offered" step, so `offered` and `accepted` both map to `accepted`
   and that step reads "0 dropped".
4. **No `stream` field and no learner names.** `Enrolment` has no stream, and
   `StudentProfile` has no name, so the class → stream drill-down and the named
   roster stay on seed data. `StreamEnum` on the backend is the *finance*
   enumeration (tuition / transport / …) and must **not** be reused for class
   streams.
5. **No age / nationality / religion breakdown.** Those arrays come back empty,
   so those three profile tabs render blank.
6. **Term filter not wired.** `AcademicDashboardFilters.term` expects a numeric
   term id, but the dashboard's terms are `t1`/`t2`/`t3`/`full` and there is no
   verified mapping, so the hook sends no `term` and the API uses its current
   term. Add the mapping once the backend term ids are known.

---

## 5. Rollback

```powershell
git checkout -- src/pages/AdmissionsEnrollment/AdmissionsEnrollment.tsx
Remove-Item .env
```

`admissionsEnrollment.api.ts` was **not** modified — your hook and mapper are
untouched.
