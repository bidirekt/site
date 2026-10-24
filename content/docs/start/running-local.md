---
title: Running local
description: How to start Postgres and the broker on your machine with Docker Compose, and give them their own profile.
---

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

An older copy of this file had no `name:`, so its data is in `<folder>_postgres-data`, named after the folder it ran from. Stop that project first with `docker compose down` in its folder, since it holds port 8080.

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
