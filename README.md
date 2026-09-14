# STUDIO frontend

## Development

Install pinned dependencies with `npm ci`, then run `npm run dev`.

## Tests and build

Run client tests with `npm test` and create production assets with `npm run build`.

## Container image

Build the standalone frontend image with:

```sh
docker build --tag tool-frontend:create-validated-studio-contact-form .
```

The image listens on port `8080`. It requires `BACKEND_UPSTREAM` to be an HTTP
or HTTPS URL when started; Nginx uses it to forward `/api/*` requests unchanged.
