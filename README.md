# STUDIO contact form

## Local development

```sh
npm install
npm run dev
```

The browser API base is `VITE_API_BASE_URL`, which defaults to the same origin
when unset or empty. The request client posts to
`${VITE_API_BASE_URL}/contact-submissions`, sending only the `name` and `email`
JSON properties. The form uses the conventional client-side check
`^[^\s@]+@[^\s@]+\.[^\s@]+$`; validation counts raw JavaScript string code units
and does not trim or normalize entered values.

## Runtime image

Build the repository-local image without starting it:

```sh
docker build -t studio-contact-frontend:build-studio-contact-form .
```

The image listens on port `8080`. It requires `BACKEND_UPSTREAM` at runtime to
be a valid `http://` or `https://` URL. Nginx proxies the same-origin
`/contact-submissions` request to that upstream without rewriting its path.
