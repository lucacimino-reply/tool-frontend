# STUDIO frontend

## Development

Install pinned dependencies with `npm ci`, then run `npm run dev`.

## Tests and build

Run client tests with `npm test` and create production assets with `npm run build`.

The browser posts submissions to `${VITE_API_BASE_URL:-/api}/submissions`. Set
`VITE_API_BASE_URL` at build time to use a different API base URL. During local
development, Vite forwards the default `/api` requests to `BACKEND_UPSTREAM` (or
`http://localhost:8081` when it is unset).

## Container image

Build the standalone frontend image with:

```sh
docker build --tag tool-frontend:connect-submission-lifecycle-and-confirmation .
```

The image listens on port `8080`. It requires `BACKEND_UPSTREAM` to be an HTTP
or HTTPS URL when started; Nginx uses it to forward `/api/*` requests unchanged.
