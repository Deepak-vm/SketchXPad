FROM node:20-alpine AS base
WORKDIR /app
RUN npm install -g pnpm turbo


FROM base AS pruner
COPY . .
RUN turbo prune --scope=http-backend --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .
RUN cd packages/db && pnpm prisma generate
RUN turbo run build --filter=http-backend...

FROM node:20-alpine AS runtime
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/http-backend/dist ./dist
COPY --from=builder /app/apps/http-backend/package.json .
COPY --from=builder /app/packages/db/prisma ./prisma
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]

