#!/bin/sh
# Runs before nginx, then hands over to the stock image entrypoint so the
# envsubst hook still renders /etc/nginx/templates/default.conf.template.
#
# WHY THIS EXISTS
# ---------------
# The proxy target used to be read from `BACKEND_ORIGIN`. That variable was
# still set to the retired Render host in App Platform env vars, compose files
# and systemd units, and because a plain `ENV` in a Dockerfile is the WEAKEST
# assignment, any of those silently won — the deployed container proxied /api
# to Render again no matter what the Dockerfile said.
#
# This image now reads `API_UPSTREAM` instead. `BACKEND_ORIGIN` is gone from the
# template, so leftovers of it are inert: nothing reads the variable any more.
set -eu

# Loopback: Django runs on the same host, so /api stays same-origin.
: "${API_UPSTREAM:=http://127.0.0.1:8000}"
export API_UPSTREAM

API_UPSTREAM=$(printf '%s' "$API_UPSTREAM" | sed 's:/*$::')

if [ -z "$API_UPSTREAM" ]; then
    echo "eid-entrypoint: FATAL: API_UPSTREAM resolved to an empty string." >&2
    exit 1
fi

# Fail loudly rather than silently proxying to a dead host.
case "$API_UPSTREAM" in
    *onrender.com*)
        echo "eid-entrypoint: FATAL: API_UPSTREAM points at the retired Render backend:" >&2
        echo "eid-entrypoint:        $API_UPSTREAM" >&2
        echo "eid-entrypoint:        set API_UPSTREAM=http://127.0.0.1:8000 (or unset it)." >&2
        exit 1
        ;;
esac

# Point out dead legacy config so it can be cleaned up, but do not fail on it:
# the value is ignored, which is exactly the intended behaviour.
if [ -n "${BACKEND_ORIGIN:-}" ]; then
    echo "eid-entrypoint: NOTE: legacy BACKEND_ORIGIN='$BACKEND_ORIGIN' is ignored." >&2
    echo "eid-entrypoint:       the proxy target is API_UPSTREAM='$API_UPSTREAM'." >&2
    echo "eid-entrypoint:       delete BACKEND_ORIGIN from the platform to quiet this." >&2
fi

echo "eid-entrypoint: /api/ -> ${API_UPSTREAM}/api/"

exec /docker-entrypoint.sh "$@"
