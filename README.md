# Clean frontend

Public landing page for Clean's booking experience.

## Development

```bash
npm install
npm run dev
```

Run checks with `npm test` and create production assets with `npm run build`.

## Container image

Build the independently runnable static frontend image without starting it:

```bash
docker build -t clean-frontend:booking-draft-service-summary .
```

The image listens on port `8080`. At runtime, it requires `BACKEND_UPSTREAM` to
be a valid `http://` or `https://` URL. Browser `/api/*` requests are proxied
to that upstream, including the authentication session, login, and signup
requests.
