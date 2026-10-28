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
COPY deploy/docker-entrypoint.sh /usr/local/bin/eid-entrypoint.sh
RUN chmod +x /usr/local/bin/eid-entrypoint.sh

# PORT is what nginx listens on; API_UPSTREAM is where /api is proxied to.
# Both are read when the container starts, so they can be changed with run-time
# environment variables without rebuilding the image.
#
# The variable is deliberately NOT called BACKEND_ORIGIN: that name is still set
# to the retired Render host in App Platform env vars, compose files and systemd
# units, and a platform-supplied value beats a Dockerfile ENV every time. Under
# the new name those leftovers are dead config, which is why this class of bug
# cannot come back.
#
# 127.0.0.1:8000 is only reachable when Django shares this container's network
# namespace (same container, or `docker run --network=host`). If Django runs on
# the droplet host while this image runs on a bridge network, 127.0.0.1 is this
# container itself and every /api call returns 502 — override API_UPSTREAM with
# http://host.docker.internal:8000 (plus
# `--add-host=host.docker.internal:host-gateway`) or the bridge gateway
# (typically http://172.17.0.1:8000).
ENV PORT=8080 \
    API_UPSTREAM=http://127.0.0.1:8000

# Entrypoint defaults API_UPSTREAM, refuses a retired Render target, and then
# hands over to the stock nginx entrypoint so envsubst still runs.
ENTRYPOINT ["/usr/local/bin/eid-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

EXPOSE 8080

