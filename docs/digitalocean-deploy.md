# Deploying the frontend to DigitalOcean App Platform

The backend deploys fine, the frontend does not. Everything below is the reason
why, plus the settings the App Platform component needs.

## What was broken

| # | Problem | Effect |
|---|---------|--------|
| 1 | The repository-root `Dockerfile` started the **Vite dev server on port 5173**. App Platform uses a root `Dockerfile` by default. | The component only ever listened on 5173. App Platform health-checks the public HTTP port (**8080** by default), so the deployment never became healthy and never received traffic. |
| 2 | `Dockerfile.production` (the real multi-stage build) was only used by the GitHub Action, never by App Platform. | Building "the production image" and deploying "the app" were two unrelated paths. |
| 3 | `Dockerfile.production` ended in `nginx` with `EXPOSE 80` and no nginx config. | Even when used, nginx listened on 80 while App Platform routed to 8080, and there was no SPA fallback or `/api` proxy. |
| 4 | `npm ci` with no `--include=dev`. | When `NODE_ENV=production` is present in the build environment, devDependencies (`vite`, `typescript`) are skipped and `npm run build` fails. Same trap that bit the Render deploy. |
| 5 | The app calls the API at a **relative** `/api`, but nothing served or proxied `/api`. | The UI would load and every request would 404. |
| 6 | The workflow pushes to **GHCR**, and App Platform does **not** redeploy on new images from Docker Hub or GHCR. | New builds landed in the registry while the live app kept running the old image — "the frontend isn't picking up my changes". |
| 7 | `origin/main` is far behind `origin/Dev`. | If the app is connected to `main`, it builds months-old code with the old hard-coded Render API URL. |

## What the repository does now

* `Dockerfile` (repo root) — production: `node:24-alpine` build stage with
  `npm ci --include=dev` and `npm run build`, then `nginx:alpine` serving
  `/usr/share/nginx/html` on **port 8080** with `/healthz` and `/upstream`
  endpoints.
* `deploy/nginx.conf.template` — SPA fallback (`try_files … /index.html`),
  long-lived caching for hashed `/assets/*`, no-cache for `index.html`, and a
  `/api/` reverse proxy to `API_UPSTREAM`.
* `deploy/docker-entrypoint.sh` — defaults `API_UPSTREAM`, refuses to start if it
  still points at the retired Render host, and ignores legacy `BACKEND_ORIGIN`.
* `Dockerfile.dev` — the Vite dev server container, used by `compose.yaml` only.
* `.github/workflows/deploy.yml` — builds the root `Dockerfile`, pushes to GHCR,
  and (once the secrets exist) forces a DigitalOcean deployment.

> **Why the variable is called `API_UPSTREAM` and not `BACKEND_ORIGIN`.**
> `BACKEND_ORIGIN` was still set to the retired Render host in App Platform env
> vars, compose files and systemd units. A platform-supplied value beats a
> Dockerfile `ENV`, so the proxy quietly kept pointing at Render no matter what
> the repository said. Renaming the variable retires the name: those leftovers
> are now dead config that nothing reads. **Never reintroduce
> `BACKEND_ORIGIN`** — if you see it, delete it.

## App Platform component settings

Use a **Web Service** from the container image
`ghcr.io/executive-intelligence-dashboard/frontend:dev`.

| Setting | Value |
|---------|-------|
| Type | Web Service |
| Source | Container image, GHCR |
| Public HTTP port (`http_port`) | **8080** |
| Run command | leave empty — the image's `CMD` starts nginx |
| Health check path | `/healthz` |
| Instance size / count | smallest that fits; 1 instance is fine |

Environment variables:

| Variable | Scope | Value |
|----------|-------|-------|
| `API_UPSTREAM` | Run time | Scheme, host and optional port only — **no** `/api`, **no** trailing slash. Defaults to `http://127.0.0.1:8000`; only set it to move the backend |
| `VITE_API_BASE_URL` | Build time | `/api` (the default; only set it if you want the browser to call the backend directly, e.g. `https://api.example.com/api`) |

If the backend is another component in the *same* app, point `API_UPSTREAM` at
its internal address (for example `http://api:8080`) and add that hostname to the
Django backend's `ALLOWED_HOSTS`.

Verify what a running container actually rendered — this is the one check that
cannot be fooled by a stale variable:

```sh
curl -s http://<host>/upstream     # => proxy_pass http://127.0.0.1:8000/api/
```

> **`127.0.0.1` is the container itself.** A loopback upstream only works when
> Django shares the frontend container's network namespace — the same container,
> or `docker run --network=host`. If Django runs on the droplet host and the
> frontend runs on a bridge network, every `/api/` request returns **502 Bad
> Gateway**. In that case use `http://host.docker.internal:8000` together with
> `--add-host=host.docker.internal:host-gateway`, or the host's LAN address
> (`http://172.17.0.1:8000` for the default bridge).
>
> Since nginx forwards the browser's own `Host` header, Django must also list the
> hostname the browser uses (`138.197.193.101`) in `ALLOWED_HOSTS`. Adding
> `127.0.0.1` and `localhost` there is harmless insurance.

### App spec equivalent

```yaml
name: eid-frontend
services:
  - name: web
    image:
      registry_type: GHCR
      registry: executive-intelligence-dashboard
      repository: frontend
      tag: dev
      deploy_on_push: false      # GHCR pushes are not watched; see below
    http_port: 8080
    health_check:
      http_path: /healthz
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: API_UPSTREAM
        value: http://127.0.0.1:8000
        scope: RUN_TIME
      - key: VITE_API_BASE_URL
        value: /api
        scope: BUILD_TIME
```

If the GHCR package is private, register the registry credentials in
**App Platform → Settings → Container registries** first, otherwise the pull
fails and the last good deployment keeps running.

## Why redeploying has to be triggered

App Platform only auto-deploys from **Git** pushes (and from
**DigitalOcean Container Registry** with `deploy_on_push: true`). A new tag in
GHCR is invisible to it. Two ways to close that loop:

1. **Add secrets to the GitHub repository** — `DIGITALOCEAN_ACCESS_TOKEN`
   (a `doctl` token with `app:update`) and `DO_APP_ID` (`doctl apps list`).
   `deploy.yml` then runs `doctl apps create-deployment <app> --force-rebuild`
   after every successful image push, which is a no-op if the secrets are absent.
2. Push to **DigitalOcean Container Registry** instead of GHCR and set
   `deploy_on_push: true`.

Alternatively, drop the container path entirely and deploy the frontend as a
**Static Site** from `Dev`:

| Setting | Value |
|---------|-------|
| Build command | `npm ci --include=dev && npm run build` |
| Output directory | `dist` |
| Catchall document | `index.html` |
| Env | `VITE_API_BASE_URL` = `https://<backend-host>/api` (must be absolute here) |

## Verifying locally

```sh
docker build -t eid-frontend .
docker run --rm -p 8080:8080 \
  --add-host=host.docker.internal:host-gateway \
  -e API_UPSTREAM=http://host.docker.internal:8000 \
  eid-frontend
# then open http://localhost:8080/healthz and http://localhost:8080/
# and confirm the proxy target: http://localhost:8080/upstream
```
