#!/bin/sh

case "${BACKEND_UPSTREAM:-}" in
  http://*|https://*) ;;
  *)
    echo "BACKEND_UPSTREAM must be a valid HTTP or HTTPS URL" >&2
    exit 1
    ;;
esac
