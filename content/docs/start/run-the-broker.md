---
title: Run the broker
description: How to run the broker's Docker image in production, with its Postgres database, health check and exposure.
---

The broker ships as a Docker image, for `linux/amd64` and `linux/arm64`:

```
ghcr.io/bidirekt/broker:0.1.0
```

Each release is tagged `X.Y.Z`, `X.Y`, `X` and `latest`. In production, pin the full version, `0.1.0`, and change it on purpose.

The image runs as a non-root user and has no shell. It needs one Postgres database, which it migrates on start. It is configured only through environment variables:

| Variable | Default | What it does |
|---|---|---|
| `BIDIREKT_DATABASE_URL` | required | The Postgres connection URL, such as `postgres://bidirekt:<password>@db.example.com:5432/bidirekt?sslmode=require`. Pool and TLS settings go in its parameters (`pool_max_conns=10`, `sslmode=require`). Without it the broker exits with `BIDIREKT_DATABASE_URL is required`. |
| `BIDIREKT_LISTEN_ADDR` | `:8080` | The address the broker listens on. |
| `BIDIREKT_DATABASE_CONNECT_RETRIES` | `10` | How many times the broker tries to reach the database on start: each attempt waits up to 5s (or the URL's `connect_timeout`), with 2s between attempts. When they run out, the broker exits with code 1. |

## Postgres on another machine

With a managed database, or Postgres on its own server, pass its URL:

```
$ docker run -d --name bidirekt-broker --restart unless-stopped \
    -p 127.0.0.1:8080:8080 \
    -e BIDIREKT_DATABASE_URL='postgres://bidirekt:<password>@db.example.com:5432/bidirekt?sslmode=require' \
    ghcr.io/bidirekt/broker:0.1.0
```

## Postgres on the same VPS

Inside the container, `localhost` is the container itself, not the VPS. `--add-host` makes `host.docker.internal` point at the VPS:

```
$ docker run -d --name bidirekt-broker --restart unless-stopped \
    -p 127.0.0.1:8080:8080 \
    --add-host host.docker.internal:host-gateway \
    -e BIDIREKT_DATABASE_URL='postgres://bidirekt:<password>@host.docker.internal:5432/bidirekt' \
    ghcr.io/bidirekt/broker:0.1.0
```

Postgres must listen on the Docker bridge, not only on `127.0.0.1`: add the bridge address to `listen_addresses` in `postgresql.conf` (for example `listen_addresses = 'localhost,172.17.0.1'`), and allow the Docker network in `pg_hba.conf` (for example `host bidirekt bidirekt 172.16.0.0/12 scram-sha-256`).

## Health

`GET /health` answers `200` without touching the database, with the version running:

```
$ curl -s http://127.0.0.1:8080/health
{"status":"ok","brokerVersion":"0.1.0","apiVersion":1}
```

The image's own Docker healthcheck calls it, so `docker ps` shows the container as `healthy`. On `docker stop`, the broker finishes the requests in flight, for up to 8 seconds, and exits.

## Exposing it

The broker has no authentication yet. Anyone who reaches its port can publish contracts and record deployments. Keep it on a private network, or behind a reverse proxy that controls who gets in. Both examples above publish the port on `127.0.0.1` only, for that reason.

For TLS, put a reverse proxy of your choice in front of it, such as Caddy or Nginx, and give the CLI the `https://` address.
