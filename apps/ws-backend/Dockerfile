FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm turbo


FROM base AS pruner
COPY . .
RUN turbo prune --scope=ws-backend --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .
RUN cd packages/db && pnpm prisma generate
RUN turbo run build --filter=ws-backend...

FROM node:20-alpine AS runtime
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/ws-backend/dist ./dist
COPY --from=builder /app/apps/ws-backend/package.json .
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]

