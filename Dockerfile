FROM node:22.22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.28.0-alpine

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["/bin/sh", "-c", "case \"$BACKEND_UPSTREAM\" in http://*|https://*) exec /docker-entrypoint.sh nginx -g 'daemon off;' ;; *) echo 'BACKEND_UPSTREAM must be a valid HTTP or HTTPS URL.' >&2; exit 1 ;; esac"]
