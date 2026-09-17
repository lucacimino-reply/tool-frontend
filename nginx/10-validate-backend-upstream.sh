#!/bin/sh
set -eu

case "${BACKEND_UPSTREAM:-}" in
  http://*|https://*) ;;
  *)
    echo "BACKEND_UPSTREAM must be a valid http:// or https:// URL" >&2
    exit 1
    ;;
esac
