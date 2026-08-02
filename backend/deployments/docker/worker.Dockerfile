# Build context is expected to be backend/ (see deployments/compose/*.yml).
FROM golang:1.25-alpine AS build
WORKDIR /src

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/worker ./cmd/worker

FROM alpine:3.20
RUN apk add --no-cache ca-certificates && adduser -D -u 10001 app
COPY --from=build /out/worker /usr/local/bin/worker
USER app
EXPOSE 8081
ENTRYPOINT ["/usr/local/bin/worker"]
