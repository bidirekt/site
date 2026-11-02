---
title: Run the broker
description: How to start the broker and Postgres on your machine with Docker Compose, create the admin on the first access and give them their own profile, and how to run the broker's Docker image in production with its Postgres database, admin, users, health check and exposure.
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
      BIDIREKT_PUBLIC_URL: http://localhost:8080
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
$ curl -O https://raw.githubusercontent.com/bidirekt/broker/98fb4e2c5c5fedddb7c881830e5e62039ca42aec/docker-compose.yaml
$ docker compose up -d
$ curl -s http://localhost:8080/health
{"status":"ok","brokerVersion":"0.1.0","apiVersion":1}
```

The data lives in the `bidirekt_postgres-data` volume, the same from any folder, so it survives `docker compose down` and `up`; `docker compose down -v` erases it. Both containers start again by themselves when Docker restarts. The broker listens on `127.0.0.1` only, so other machines on your network cannot reach it.

Open http://localhost:8080 in the browser. The first access opens the setup: create the admin with an email and a password of 15 to 128 characters, and you are signed in. Open it at exactly `http://localhost:8080`, the compose's `BIDIREKT_PUBLIC_URL`: from `http://127.0.0.1:8080` the broker refuses every action on its pages.

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

The broker is self-hosted. It ships as a Docker image, for `linux/amd64` and `linux/arm64`:

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
| `BIDIREKT_PUBLIC_URL` | required | The address people and the CLI open the broker at, such as `https://bidirekt.example.com`. It builds the invite and reset links, and page actions from any other address are refused. |
| `BIDIREKT_TRUSTED_PROXIES` | none | The reverse proxies in front of the broker, as a comma-separated list of IPs or CIDRs, such as `172.17.0.1` or `10.0.0.5,10.0.0.6`. See [Exposing it](#exposing-it). |

### Start-up checks

The broker checks `BIDIREKT_PUBLIC_URL` and `BIDIREKT_TRUSTED_PROXIES` before it connects to the database, and refuses to start, with exit code 1, when one is missing or unsafe. It never corrects a value. The message names the variable and the rule:

- `BIDIREKT_PUBLIC_URL is required`
- `BIDIREKT_PUBLIC_URL must use https, or http on localhost or 127.0.0.1`
- `BIDIREKT_PUBLIC_URL must be an origin (scheme://host[:port]) without a path, query, fragment or userinfo`: `https://bidirekt.example.com/` (trailing `/`) and `https://bidirekt.example.com/broker` are refused.
- `BIDIREKT_PUBLIC_URL must have a lower-case host`
- `BIDIREKT_PUBLIC_URL must have an ASCII host (write an international name in its xn-- form)`: `https://bücher.example` is refused; `https://xn--bcher-kva.example` is accepted.
- `BIDIREKT_PUBLIC_URL must have a port from 1 to 65535 without leading zeros`
- `BIDIREKT_PUBLIC_URL must not write out the default port`: `https://bidirekt.example.com:443` is refused.
- `BIDIREKT_TRUSTED_PROXIES must be a comma-separated list of IPs or CIDRs, without spaces or empty entries`

### Postgres on another machine

With a managed database, or Postgres on its own server, pass its URL:

```
$ docker run -d --name bidirekt-broker --restart unless-stopped \
    -p 127.0.0.1:8080:8080 \
    -e BIDIREKT_DATABASE_URL='postgres://bidirekt:<password>@db.example.com:5432/bidirekt?sslmode=require' \
    -e BIDIREKT_PUBLIC_URL=https://bidirekt.example.com \
    ghcr.io/bidirekt/broker:0.1.0
```

### Postgres on the same VPS

Inside the container, `localhost` is the container itself, not the VPS. `--add-host` makes `host.docker.internal` point at the VPS:

```
$ docker run -d --name bidirekt-broker --restart unless-stopped \
    -p 127.0.0.1:8080:8080 \
    --add-host host.docker.internal:host-gateway \
    -e BIDIREKT_DATABASE_URL='postgres://bidirekt:<password>@host.docker.internal:5432/bidirekt' \
    -e BIDIREKT_PUBLIC_URL=https://bidirekt.example.com \
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

### Admin and users

The admin is created on the first access: until it exists, every page of the broker opens the setup, where you create it with an email and a password of 15 to 128 characters. After that the setup is gone, and the admin signs in at `<BIDIREKT_PUBLIC_URL>/sign-in` with that email and password.

The admin is a user with the permission `admin`: it does everything a `write` user does, uses the API with a token like any user, has a Profile page, and is the only one who manages users, on the Users page:

- **Invite a user** with an email and a permission: `read` lets them list participants and environments, validate contracts and ask can-i-deploy; `write` adds publishing, recording deployments, creating participants and environments, and renaming participants. The broker shows an invite link once: send it to them. It works once, for 24 hours.
- The user opens the link, sets a password of 15 to 128 characters, and signs in with their email.
- **Edit** changes a user's email or permission. **Deactivate** ends their sessions at once and stops their link; **Reactivate** lets them in again. Users are never deleted.
- **New reset link** gives an active user a link to set a new password, **New invite link** gives an invited user a new invite. Each new link stops the previous one.

A signed-in user changes their own password on the Profile page. A session ends after 8 hours without use, or 7 days after sign-in.

Failed sign-ins are limited per IP, over 15 minutes: after 10 for one email, that account's next attempts from that IP get `too many attempts, try again later`; after 50 for any accounts, every attempt from that IP does. Successful sign-ins never count.

### Health

`GET /health` answers `200` without touching the database, with the version running:

```
$ curl -s http://127.0.0.1:8080/health
{"status":"ok","brokerVersion":"0.1.0","apiVersion":1}
```

The image's own Docker healthcheck calls it, so `docker ps` shows the container as `healthy`. On `docker stop`, the broker finishes the requests in flight, for up to 8 seconds, and exits.

### Exposing it

The broker does not serve TLS. Put a reverse proxy of your choice in front of it, such as Caddy or Nginx, to serve HTTPS: outside `localhost` and `127.0.0.1`, `BIDIREKT_PUBLIC_URL` must be `https://`. Every example on this page publishes the port on `127.0.0.1` only, so only the proxy reaches it. Until the admin exists, whoever opens `BIDIREKT_PUBLIC_URL` first creates it: create it right after the first start, before the proxy lets anyone else in.

Open the broker at exactly `BIDIREKT_PUBLIC_URL`, and give the CLI that address too. From any other address, even one that reaches the same broker, its pages refuse every action.

Behind a proxy, every request reaches the broker from the proxy's address, so the sign-in limit would count everyone's failures together. List that address in `BIDIREKT_TRUSTED_PROXIES`. With the broker in Docker and the proxy on the same host, as on this page, that address is the Docker network's gateway, not `127.0.0.1`: `docker network inspect bridge -f '{{range .IPAM.Config}}{{.Gateway}}{{end}}'` prints it, usually `172.17.0.1`. The broker then takes the client's IP from the `X-Forwarded-For` header, read from the right past the listed proxies, so a value the client writes in the header changes nothing. From any other address the header is ignored. Without the variable the header is always ignored.
