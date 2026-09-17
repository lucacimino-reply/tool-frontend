#!/bin/sh
set -eu

if ! printf '%s\n' "${BACKEND_UPSTREAM:-}" | grep -Eq '^https?://[^[:space:]/?#]+([/?#].*)?$'; then
  echo "BACKEND_UPSTREAM must be a valid http:// or https:// URL" >&2
  exit 1
fi
