# syntax=docker/dockerfile:1

# --- Stage 1: build a static Go binary --------------------------------------
# Pinned to the toolchain in go.mod (go 1.24.1); bump together with it.
FROM golang:1.26-bookworm AS build
WORKDIR /src

# Cache module downloads independently of source changes.
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# CGO is off (the pdf and genai deps are pure Go), so the binary is fully static
# and runs on a scratch/distroless base. Trim the binary with -s -w.
ENV CGO_ENABLED=0 GOOS=linux
RUN go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

# --- Stage 2: minimal runtime ------------------------------------------------
# distroless/static ships CA certificates (needed for HTTPS to Vertex AI and
# GitHub) and tzdata, runs as a non-root user, and contains no shell.
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app

COPY --from=build /out/server /app/server

# ANALYSIS_MODE, PORT, and the Gemini/Vertex variables are injected at runtime
# (ECS task definition / docker run -e). Defaults keep the image self-contained.
ENV PORT=8080 \
    ANALYSIS_MODE=mock
EXPOSE 8080

USER nonroot:nonroot
ENTRYPOINT ["/app/server"]
