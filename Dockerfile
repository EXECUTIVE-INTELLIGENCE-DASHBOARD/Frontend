# syntax=docker/dockerfile:1
#
# Production image: builds the static bundle with Vite, then serves it from
# nginx. DigitalOcean App Platform uses the Dockerfile at the repository root
# by default and health-checks the component's public HTTP port (8080 unless
# the app spec says otherwise), which is what this image listens on.
#
# The local development container lives in `Dockerfile.dev`.

# --------------------------------------------------------------- build stage --
FROM node:24-alpine AS build

WORKDIR /app

# `npm run build` runs `tsc -b && vite build`, so the install must include
# devDependencies. Plain `npm ci` skips them whenever NODE_ENV=production is set
# in the build environment, which it is on DigitalOcean and Render.
COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .

# Vite inlines this at build time (App Platform passes declared environment
# variables to a Dockerfile build as `--build-arg`). Keeping it relative means
# the browser calls this same origin, which nginx proxies to the backend.
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# ------------------------------------------------------------- runtime stage --
FROM nginx:alpine AS runtime

COPY deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# PORT is what nginx listens on; BACKEND_ORIGIN is where /api is proxied to.
# Both are read when the container starts, so they can be changed with run-time
# environment variables without rebuilding the image.
#
# 127.0.0.1:8000 is only reachable when Django shares this container's network
# namespace (same container, or `docker run --network=host`). If Django runs on
# the host while this image runs on a bridge network, 127.0.0.1 is this
# container itself and every /api call returns 502 — override BACKEND_ORIGIN
# with http://host.docker.internal:8000 (plus
# `--add-host=host.docker.internal:host-gateway`) or the host's LAN address.
ENV PORT=8080 \
    BACKEND_ORIGIN=http://127.0.0.1:8000

EXPOSE 8080

