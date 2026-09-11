# STUDIO contact form

## Local development

```sh
npm install
npm run dev
```

The browser API base is `VITE_API_BASE_URL`, which defaults to the same-origin
`/api`. The request client posts to `${VITE_API_BASE_URL}/contact-submissions`.

## Runtime image

Build the repository-local image without starting it:

```sh
docker build -t studio-contact-frontend:build-studio-contact-form .
```

The image listens on port `8080`. It requires `BACKEND_UPSTREAM` at runtime to
be a valid `http://` or `https://` URL. Nginx proxies same-origin `/api/*`
requests to that URL without rewriting the `/api` prefix.
