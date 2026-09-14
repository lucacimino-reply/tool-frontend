FROM node:22.14.0-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27.4-alpine
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --chmod=755 nginx/10-validate-backend-upstream.sh /docker-entrypoint.d/10-validate-backend-upstream.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
