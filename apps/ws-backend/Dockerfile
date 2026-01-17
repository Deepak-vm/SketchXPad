FROM node:20-alpine 
WORKDIR /app

RUN npm install -g pnpm turbo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

COPY packages ./packages
COPY apps/ws-backend  ./apps/ws-backend


RUN pnpm install --frozen-lockfile

RUN cd apps/ws-backend && pnpm build


ENV NODE_ENV=production
EXPOSE 8080

WORKDIR /app/apps/ws-backend

CMD ["node", "dist/index.js"]

