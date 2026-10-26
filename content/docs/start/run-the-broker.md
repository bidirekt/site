---
title: Run the broker
description: How to start the broker and Postgres on your machine with Docker Compose and give them their own profile, and how to run the broker's Docker image in production with its Postgres database, health check and exposure.
---

## Local

To try Bidirekt on your machine, `docker-compose.yaml` in https://github.com/bidirekt/broker starts Postgres and the broker on `localhost:8080`:

```yaml
# Local use only: fixed credentials, broker exposed on localhost:8080.
name: bidirekt

services:
  postgres:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: bidirekt
      POSTGRES_PASSWORD: bidirekt
      POSTGRES_DB: bidirekt
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bidirekt -d bidirekt"]
      interval: 2s
      timeout: 3s
      retries: 15

  broker:
    image: ghcr.io/bidirekt/broker:0.1.0
    restart: unless-stopped
    environment:
      BIDIREKT_DATABASE_URL: postgres://bidirekt:bidirekt@postgres:5432/bidirekt?sslmode=disable
    ports:
      - "127.0.0.1:8080:8080"
    depends_on:
      postgres:
        condition: service_healthy

volumes:
  postgres-data:
```

In an empty folder:

```
$ curl -O https://raw.githubusercontent.com/bidirekt/broker/main/docker-compose.yaml
$ docker compose up -d
$ curl -s http://localhost:8080/health
{"status":"ok","brokerVersion":"0.1.0","apiVersion":1}
```

The data lives in the `bidirekt_postgres-data` volume, the same from any folder, so it survives `docker compose down` and `up`; `docker compose down -v` erases it. Both containers start again by themselves when Docker restarts. The broker listens on `127.0.0.1` only, so other machines on your network cannot reach it.

Give the local broker its own profile, so it never mixes with your real one:

```
$ bidirekt configure --profile local --broker-url http://localhost:8080
$ bidirekt create-environment production --profile local
Broker: http://localhost:8080 (profile: local)
production environment created
```

Every later command needs the profile too, including the ones your coding agent runs: pass `--profile local` each time, or set it once for the shell:

```
$ export BIDIREKT_PROFILE=local
```

## Production

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

### Postgres on another machine

With a managed database, or Postgres on its own server, pass its URL:

```
$ docker run -d --name bidirekt-broker --restart unless-stopped \
    -p 127.0.0.1:8080:8080 \
    -e BIDIREKT_DATABASE_URL='postgres://bidirekt:<password>@db.example.com:5432/bidirekt?sslmode=require' \
    ghcr.io/bidirekt/broker:0.1.0
```

### Postgres on the same VPS

Inside the container, `localhost` is the container itself, not the VPS. `--add-host` makes `host.docker.internal` point at the VPS:

```
$ docker run -d --name bidirekt-broker --restart unless-stopped \
    -p 127.0.0.1:8080:8080 \
    --add-host host.docker.internal:host-gateway \
    -e BIDIREKT_DATABASE_URL='postgres://bidirekt:<password>@host.docker.internal:5432/bidirekt' \
    ghcr.io/bidirekt/broker:0.1.0
```

Postgres must listen on the Docker bridge, not only on `127.0.0.1`: add the bridge address to `listen_addresses` in `postgresql.conf` (for example `listen_addresses = 'localhost,172.17.0.1'`), and allow the Docker network in `pg_hba.conf` (for example `host bidirekt bidirekt 172.16.0.0/12 scram-sha-256`).

### Postgres choices

Nothing here is required. These are the choices worth making:

- Postgres 17 or newer: the local compose runs 17, and the broker's tests run on 18.
- `sslmode=require` in the URL whenever the database is on another machine.
- A dedicated user with a strong password, owning only the broker's database.
- Port `5432` never exposed to the internet.
- Regular backups: the database holds every contract and deployment.
- A managed database (RDS, Cloud SQL, Neon…) is a valid choice: give the broker its URL.

### Health

`GET /health` answers `200` without touching the database, with the version running:

```
$ curl -s http://127.0.0.1:8080/health
{"status":"ok","brokerVersion":"0.1.0","apiVersion":1}
```

The image's own Docker healthcheck calls it, so `docker ps` shows the container as `healthy`. On `docker stop`, the broker finishes the requests in flight, for up to 8 seconds, and exits.

### Exposing it

The broker has no authentication yet. Anyone who reaches its port can publish contracts and record deployments. Keep it on a private network, or behind a reverse proxy that controls who gets in. Every example on this page publishes the port on `127.0.0.1` only, for that reason.

For TLS, put a reverse proxy of your choice in front of it, such as Caddy or Nginx, and give the CLI the `https://` address.
