# syntax=docker/dockerfile:1
#
# IMPORTANT: build this with the REPO ROOT as context, not frontend/, because
# src/main.tsx imports the design system at ../../design/styles.css.
#   docker build -f frontend/Dockerfile --build-arg VITE_API_BASE_URL=... .
# (docker-compose.yml already sets the right context.)

# --- Stage 1: build the Vite SPA --------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app

# VITE_API_BASE_URL is baked into the bundle at build time (Vite inlines
# import.meta.env). Override per environment: --build-arg VITE_API_BASE_URL=...
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# The design system lives at repo-root /design; main.tsx reaches it via
# ../../design, which resolves to /design from /app/src. Copy both trees.
COPY design /design
COPY frontend ./
RUN npm run build

# --- Stage 2: serve the static bundle with nginx ----------------------------
FROM nginx:1.27-alpine AS runtime
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
