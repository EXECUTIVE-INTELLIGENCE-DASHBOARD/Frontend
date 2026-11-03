# GreenHill EID Frontend

React, Vite, and TypeScript foundation for the GreenHill Enterprise Incident and Service Management platform. This repository contains the browser application only; the API lives in the separate Backend repository.

The SRS describes the product requirements but leaves implementation technologies open. The project team selected React + Vite + TypeScript for the frontend and Django REST Framework + PostgreSQL for the backend. This repository also includes Axios and TanStack Query for API requests and server-state management.

## Current scope

This is a development foundation, not a finished product. It provides:

- A small application shell that can be extended with approved SRS features.
- A shared Axios client whose base URL is configured through an environment variable.
- A TanStack Query provider ready for API-backed screens.
- ESLint, TypeScript checking, Vitest, and a production build command.
- A local development Docker Compose service.
- A GitHub Actions workflow that validates pull requests to Dev.

No business workflows, sample people, or dashboard metrics have been invented. Add product screens and domain behavior from approved requirements as implementation begins.

## Requirements

- Node.js 24 LTS and npm 11 or later.
- Docker Desktop with Docker Compose v2, if using the container workflow.
- The Backend API running locally when developing API-backed screens.

## Start locally

1. Install Node.js 24 LTS.
2. Start the EID API and the identity provider, each on its own port. See Local ports below for the ports and for the `runserver` trap.
3. Install dependencies and start Vite:

       npm ci
       npm run dev

4. Open http://localhost:5173.

No environment file has to be created for local work. `.env.development` is committed and already points at the local API, and Vite loads it automatically in dev. Copy `.env.example` to `.env` only if one machine has to be aimed somewhere else. Note the precedence: `.env` overrides `.env.development`, and `.env.local` / `.env.development.local` override both, so a forgotten local override silently wins over the committed values.

Vite reads variables prefixed with VITE_ and exposes them to browser code. Never place passwords, private keys, or server-only secrets in a VITE_ variable; browser bundles are public to anyone who can load the page.

## Local ports

Three separate servers run side by side, and two of them are Django, so they are easy to confuse:

| Port | Service | Started with |
| --- | --- | --- |
| 5173 | This frontend (Vite) | `npm run dev` |
| 8001 | EID API — Django backend, serves `/api/...` | `python manage.py runserver localhost:8001` |
| 8000 | Identity provider — serves `/o/...` and `/auth/...` | `python manage.py runserver 127.0.0.1:8000` in Auth-backend |
| 5174 | Identity provider sign-in UI (Vite) | `vite --host 127.0.0.1 --port 5174` in Auth-frontend |

Port 8000 is **not** the dashboard API. `/api/health/`, `/api/expenses/` and `/api/auth/me/` all answer 404 there, so pointing the frontend at 8000 makes every data request fail in a way that reads like a database outage.

Always pass the backend port explicitly. A bare `python manage.py runserver` defaults to 8000, and Django on Windows sets `allow_reuse_address`, so it binds the port the identity provider already holds **without any "address already in use" error**. It then receives no traffic at all, because every connection goes to whichever process bound the port first. The visible result is either 404s on `/api/...` or a 500 from sign-in, depending on which process won the port.

If Vite reports "Port 5173 is already in use", a dev server is already running; `strictPort` makes the second one fail loudly instead of quietly moving to another port. Stop the old one rather than letting two servers share the port. Vite reads environment files once at startup, so the older server keeps serving stale configuration and requests appear to alternate between two different backends.

## Start with Docker

From this repository directory:

    docker compose up --build

Open http://localhost:5173. The Compose service mounts the working directory for live reload and keeps installed packages in a named volume. Stop it with Ctrl+C, then run docker compose down. The container is for local development; it is not a production deployment image.

## Commands

| Command | Purpose |
| --- | --- |
| npm run dev | Start the local Vite development server. |
| npm run lint | Run ESLint on the source and configuration files. |
| npm run typecheck | Run TypeScript's project checks without emitting build files. |
| npm test | Run the Vitest suite once in CI mode. |
| npm run test:watch | Keep Vitest open while developing. |
| npm run build | Type-check and create an optimized static build in dist/. |
| npm run preview | Serve the local production build for a quick manual check. |

## How tests work

Tests use Vitest with a simulated browser DOM (jsdom) and React Testing Library. The starter tests check that the application shell renders its expected title and that the shared API client has a configured base URL. They do not yet test business rules, real network calls, authentication, or browser behavior against a deployed site because those product flows have not been implemented.

When adding a feature, put focused tests beside the component or module they cover. Prefer checking visible behavior and user interactions over implementation details. Mock API responses in component tests; test API contracts in the Backend repository.

Run the checks locally before opening a pull request:

    npm run lint
    npm run typecheck
    npm test
    npm run build

The GitHub Actions workflow runs the same checks on pushes to Dev and pull requests targeting Dev. A failing check needs to be fixed before the team lead promotes Dev to main.

## API configuration

There are two clients, both driven by environment variables and both defaulting to the relative path `/api`:

- `src/api/axios.ts` reads `VITE_API_URL`.
- `src/lib/api/client.ts` reads `VITE_API_BASE_URL`, falling back to `VITE_API_URL`.

In development `vite.config.ts` proxies `/api` to `http://localhost:8001` (override with `DEV_PROXY_TARGET`), and the Docker production image uses nginx to do the same, so the browser stays same-origin. Because `.env.development` sets an absolute `VITE_API_URL`, the local app actually calls the API directly at `localhost:8001` rather than through the proxy; the proxy still covers anyone who leaves the variable unset or uses relative paths. A direct call is cross-origin, so the backend must allow `http://localhost:5173` with credentials, and unsafe methods must send the CSRF header. The Render static-site deployment has no API proxy; its build-time `VITE_API_URL` and `VITE_API_BASE_URL` settings point directly to the backend. The backend must allow the deployed frontend origin for cross-origin requests. TanStack Query is configured in src/main.tsx; feature-specific hooks should be added alongside the feature that uses them.

For local work, start the Backend repository too, on port 8001 as described in Local ports. The Backend foundation exposes GET /api/health/. Ensure the backend CORS allowlist includes local development origins and the deployed frontend origin.

## Branch and review workflow

- Create work from Dev using a short-lived branch such as feature/<name> or fix/<name>.
- Open a pull request into Dev; include the change summary, testing performed, and screenshots for visible UI changes.
- The team reviews and merges approved work into Dev.
- The team lead promotes Dev to main through a separate pull request after the release checks and review.

The repositories are currently on the GitHub Free plan. GitHub displayed the existing private-repository branch rules as not enforced on that plan, so the PR flow is a team convention until the organization confirms server-side enforcement is available. Do not treat local Git hooks as a security boundary.

## Deployment

The frontend runs on DigitalOcean App Platform as a web service built from the repository-root `Dockerfile` (Vite build, then nginx serving the bundle on port 8080). `.github/workflows/deploy.yml` builds that image, pushes it to GHCR and triggers a new App Platform deployment. See docs/digitalocean-deploy.md for the component settings and required secrets. Keep provider credentials out of the repository.

`render.yaml` is a leftover static-site blueprint from an earlier hosting evaluation and is not part of the current deployment path.

## Repository layout

    .github/workflows/ci.yml   Pull-request and Dev validation
    .github/workflows/deploy.yml  Production image build and App Platform deploy
    deploy/nginx.conf.template  Production server config (SPA fallback, /api proxy)
    Dockerfile                 Production image (Vite build -> nginx on 8080)
    Dockerfile.dev             Vite dev server image used by compose.yaml
    src/App.tsx                Small application shell
    src/api/axios.ts           Axios client used by most pages
    src/lib/api/client.ts      Fetch/Axios client with CSRF handling
    src/main.tsx               React and TanStack Query bootstrap
    src/test/                  Vitest setup
