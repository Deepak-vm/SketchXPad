FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm turbo


ARG VITE_HTTP_URL=http://localhost:3000
ARG VITE_WS_URL=ws://localhost:8080
ENV VITE_HTTP_URL=$VITE_HTTP_URL
ENV VITE_WS_URL=$VITE_WS_URL

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./

COPY packages ./packages
COPY apps/sketchxpad-frontend ./apps/sketchxpad-frontend

RUN pnpm install --frozen-lockfile

RUN cd apps/sketchxpad-frontend && pnpm build

FROM nginx:alpine AS runtime
COPY --from=builder /app/apps/sketchxpad-frontend/dist /usr/share/nginx/html
COPY apps/sketchxpad-frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD [ "nginx" , "-g" , "daemon off;" ]