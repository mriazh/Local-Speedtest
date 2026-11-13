# Multi-arch Dockerfile for Local Speedtest (linux/amd64, linux/arm64).
# Builds the LibreSpeed Go backend and serves the HTML5 frontend.
# syntax=docker/dockerfile:1

FROM --platform=$BUILDPLATFORM alpine:3.20 AS downloader
ARG TARGETARCH
ARG VERSION=v1.1.6

RUN apk add --no-cache curl tar

WORKDIR /tmp
RUN case "$TARGETARCH" in \
      amd64) ARCH=amd64 ;; \
      arm64) ARCH=arm64 ;; \
      *) echo "Unsupported architecture: $TARGETARCH" && exit 1 ;; \
    esac && \
    curl -fsSL -o speedtest-backend.tar.gz \
      "https://github.com/librespeed/speedtest-go/releases/download/${VERSION}/speedtest-go_${VERSION#v}_linux_${ARCH}.tar.gz" && \
    tar -xzf speedtest-backend.tar.gz && \
    mv speedtest-backend /speedtest-backend && \
    chmod +x /speedtest-backend

FROM alpine:3.20
RUN apk add --no-cache ca-certificates && \
    mkdir -p /app/config /app/data /app/web

COPY --from=downloader /speedtest-backend /app/speedtest-backend
COPY config/settings.toml /app/config/settings.toml
COPY web /app/web

WORKDIR /app
EXPOSE 8989
ENTRYPOINT ["/app/speedtest-backend", "-c", "/app/config/settings.toml"]
