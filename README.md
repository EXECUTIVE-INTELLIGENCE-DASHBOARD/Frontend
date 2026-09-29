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
2. Copy .env.example to .env and adjust VITE_API_BASE_URL if the API is not at http://localhost:8000/api.
3. Install dependencies and start Vite:

       npm ci
       npm run dev

4. Open http://localhost:5173.

Vite reads variables prefixed with VITE_ and exposes them to browser code. Never place passwords, private keys, or server-only secrets in a VITE_ variable; browser bundles are public to anyone who can load the page.

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

The Axios client is in src/lib/api.ts. Its base URL comes from VITE_API_BASE_URL and falls back to http://localhost:8000/api. TanStack Query is configured in src/main.tsx; feature-specific hooks should be added alongside the feature that uses them.

For local work, start the Backend repository too. The Backend foundation exposes GET /api/health/. CORS is restricted to local development origins there; update the allowed origins deliberately if local ports change.

## Branch and review workflow

- Create work from Dev using a short-lived branch such as feature/<name> or fix/<name>.
- Open a pull request into Dev; include the change summary, testing performed, and screenshots for visible UI changes.
- The team reviews and merges approved work into Dev.
- The team lead promotes Dev to main through a separate pull request after the release checks and review.

The repositories are currently on the GitHub Free plan. GitHub displayed the existing private-repository branch rules as not enforced on that plan, so the PR flow is a team convention until the organization confirms server-side enforcement is available. Do not treat local Git hooks as a security boundary.

## Deployment

No deployment workflow is configured. The initial hosting provider is still to be selected, and the project may later move to DigitalOcean. Keep provider credentials out of the repository. Add a production build/deploy workflow only after the team chooses the target and its approval process.

## Repository layout

    .github/workflows/ci.yml   Pull-request and Dev validation
    src/App.tsx                Small application shell
    src/lib/api.ts             Shared Axios client
    src/main.tsx               React and TanStack Query bootstrap
    src/test/                  Vitest setup

