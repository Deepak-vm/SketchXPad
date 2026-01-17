FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm turbo

FROM base AS pruner
COPY . .
RUN turbo prune --scope=sketchxpad-frontend --docker 

FROM base AS installer
COPY --from=pruner /app/out/json .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=installer /app . 
COPY --from=pruner /app/out/full/ .
RUN turbo run build --filter=sketchxpad-frontend...


FROM nginx:alpine AS runtime
COPY --from=builder /app/apps/sketchxpad-frontend/dist /usr/share/nginx/html
COPY apps/sketchxpad-frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD [ "nginx" , "-g" , "daemon off;" ]