FROM node:20-alpine
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

COPY packages ./packages

COPY apps/http-backend ./apps/http-backend

RUN pnpm install --frozen-lockfile

RUN cd packages/db && npx prisma generate

RUN cd apps/http-backend && pnpm build

ENV NODE_ENV=production
EXPOSE 3000

WORKDIR /app/apps/http-backend
CMD ["node", "dist/index.js"]


