---
title: Installation
description: How to install the bidirekt CLI and run the broker.
---

Bidirekt has two parts: the `bidirekt` CLI, which every pipeline and developer machine runs, and the broker, one server with its Postgres database that stores contracts and deployments. [CLI](#cli) installs the client, [Broker](#broker) puts the server in production, and [Running local](#running-local) starts both on your machine to try them.

## CLI

### With curl

```
$ curl -sSfL https://raw.githubusercontent.com/bidirekt/cli/main/install.sh | sh
bidirekt 0.1.0 installed to /home/you/.local/bin/bidirekt
```

The script downloads the latest release for your system, checks it against the release's `checksums.txt` and installs it in `~/.local/bin`, without `sudo`. A checksum that does not match stops it before anything is installed. When the directory is not on your `PATH`, it prints the line to add to your shell profile.

`-b` picks the directory and a tag picks the version:

```
$ curl -sSfL https://raw.githubusercontent.com/bidirekt/cli/main/install.sh | sh -s -- -b /usr/local/bin v0.1.0
```

The script supports Linux and macOS, on `x86_64` and `arm64`. On Windows, download the archive by hand.

### From the GitHub Release

Every release at https://github.com/bidirekt/cli/releases has one archive per system, named `bidirekt_<version>_<os>_<arch>`: `linux` and `darwin` in `amd64` and `arm64` as `.tar.gz`, and `windows_amd64` as `.zip`. Check the archive against `checksums.txt` before extracting it:

```
$ curl -sSfLO https://github.com/bidirekt/cli/releases/download/v0.1.0/bidirekt_0.1.0_linux_amd64.tar.gz
$ curl -sSfLO https://github.com/bidirekt/cli/releases/download/v0.1.0/checksums.txt
$ sha256sum --check --ignore-missing checksums.txt
bidirekt_0.1.0_linux_amd64.tar.gz: OK
$ tar -xzf bidirekt_0.1.0_linux_amd64.tar.gz bidirekt
$ ./bidirekt version
bidirekt version 0.1.0
```

On macOS, `shasum -a 256 --check --ignore-missing checksums.txt` does the same check.

### Pointing it at your broker

The CLI has no default broker. Save yours once:

```
$ bidirekt configure
Broker URL: https://broker.example.com
```

It goes into the `default` profile of `~/.config/bidirekt/config.json` (`$XDG_CONFIG_HOME/bidirekt/config.json` when that is set, `%AppData%\bidirekt\config.json` on Windows, or the file `BIDIREKT_CONFIG_FILE` names). A profile is one broker: a group of companies, or a freelancer working for several clients, keeps one profile per broker and picks it with `--profile` or `BIDIREKT_PROFILE`:

```
$ bidirekt configure --profile acme --broker-url https://broker.acme.example
$ bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production --profile acme
```

Environments such as `production` and `staging` live inside a broker, so they are never profiles.

The first of these wins: `--broker-url`, then `BIDIREKT_BROKER_URL`, then the active profile's URL. Every command that calls the broker first prints which one it uses and where it came from, on stderr:

```
Broker: https://broker.acme.example (profile: acme)
```

**Without a broker.** A command that has no broker fails without calling anything, on your machine and in a pipeline alike; it never asks:

```
no broker configured — pass --broker-url, set BIDIREKT_BROKER_URL, or run "bidirekt configure"
```

On your machine, run `bidirekt configure`. In a pipeline, set `BIDIREKT_BROKER_URL`, or write a profile with `bidirekt configure --broker-url <url>`, which never asks. Every option is in the [CLI reference](../reference/cli.md#overview).

## Broker

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

### Health

`GET /health` answers `200` without touching the database, with the version running:

```
$ curl -s http://127.0.0.1:8080/health
{"status":"ok","brokerVersion":"0.1.0","apiVersion":1}
```

The image's own Docker healthcheck calls it, so `docker ps` shows the container as `healthy`. On `docker stop`, the broker finishes the requests in flight, for up to 8 seconds, and exits.

### Exposing it

The broker has no authentication yet. Anyone who reaches its port can publish contracts and record deployments. Keep it on a private network, or behind a reverse proxy that controls who gets in. Both examples above publish the port on `127.0.0.1` only, for that reason.

For TLS, put a reverse proxy of your choice in front of it, such as Caddy or Nginx, and give the CLI the `https://` address.

### Postgres in production

Nothing here is required. These are the choices worth making:

- Postgres 17 or newer: the local compose runs 17, and the broker's tests run on 18.
- `sslmode=require` in the URL whenever the database is on another machine.
- A dedicated user with a strong password, owning only the broker's database.
- Port `5432` never exposed to the internet.
- Regular backups: the database holds every contract and deployment.
- A managed database (RDS, Cloud SQL, Neon…) is a valid choice: give the broker its URL.
- Always pin the image tag, so the broker only changes when you choose.

## Running local

To try Bidirekt on your machine, `docker-compose.yaml` in https://github.com/bidirekt/broker starts Postgres and the latest broker on `localhost:8080`:

```yaml
# Local use only: fixed credentials, broker exposed on localhost:8080.
services:
  postgres:
    image: postgres:17-alpine
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
    image: ghcr.io/bidirekt/broker:latest
    environment:
      BIDIREKT_DATABASE_URL: postgres://bidirekt:bidirekt@postgres:5432/bidirekt?sslmode=disable
    ports:
      - "8080:8080"
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

The data lives in the `postgres-data` volume, so it survives `docker compose down` and `up`; `docker compose down -v` erases it.

Give the local broker its own profile, so it never mixes with your real one:

```
$ bidirekt configure --profile local --broker-url http://localhost:8080
$ bidirekt create-environment production --profile local
Broker: http://localhost:8080 (profile: local)
production environment created
```
