---
title: Install the CLI
description: How to install the bidirekt CLI with curl, from the GitHub Release or as a Docker image, and point it at your broker.
---

## With curl

```
$ curl -sSfL https://raw.githubusercontent.com/bidirekt/cli/main/install.sh | sh
bidirekt 0.1.0 installed to /home/you/.local/bin/bidirekt
```

The script downloads the latest release for your system, checks it against the release's `checksums.txt` and installs it in `~/.local/bin`, without `sudo`. A checksum that does not match stops it before anything is installed. When the directory is not on your `PATH`, it prints the line to add to your shell profile.

To pin a version, pass it to the script, with or without the `v`: `sh -s -- v0.1.0` and `sh -s -- 0.1.0` install the same release.

`-b` picks the directory. A directory owned by root, such as `/usr/local/bin`, needs `sudo` on the `sh`:

```
$ curl -sSfL https://raw.githubusercontent.com/bidirekt/cli/main/install.sh | sudo sh -s -- -b /usr/local/bin v0.1.0
```

The CLI is built for Linux and macOS, on `x86_64` and `arm64`.

## From the GitHub Release

Every release at https://github.com/bidirekt/cli/releases has one archive per system, named `bidirekt_<version>_<os>_<arch>`: `linux` and `darwin` in `amd64` and `arm64`, as `.tar.gz`. Check the archive against `checksums.txt` before extracting it:

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

## With Docker

The CLI also ships as a Docker image, `ghcr.io/bidirekt/cli`, for `linux/amd64` and `linux/arm64`. Each release is tagged only with its full version, such as `0.1.0`; there is no `latest`:

```
$ docker run --rm ghcr.io/bidirekt/cli:0.1.0 version
bidirekt version 0.1.0
```

To publish, mount the project as the working directory and pass the broker's URL in `BIDIREKT_BROKER_URL`:

```
$ docker run --rm -v "$PWD:/work" -w /work \
    -e BIDIREKT_BROKER_URL=https://broker.acme.example \
    ghcr.io/bidirekt/cli:0.1.0 publish contracts/*.yaml --participant petstore_web --version 2.3.0
Broker: https://broker.acme.example (from BIDIREKT_BROKER_URL)
petstore_web contract publish successful
```

Inside the container, `localhost` is the container itself. To reach the broker of [Running local](running-local.md) on `localhost:8080`, add `--network host`; it works on Linux and with Docker Desktop on macOS:

```
$ docker run --rm --network host -v "$PWD:/work" -w /work \
    -e BIDIREKT_BROKER_URL=http://localhost:8080 \
    ghcr.io/bidirekt/cli:0.1.0 publish contracts/*.yaml --participant petstore_web --version 2.3.0
Broker: http://localhost:8080 (from BIDIREKT_BROKER_URL)
petstore_web contract publish successful
```

## Pointing it at your broker

The CLI has no default broker. Save yours once:

```
$ bidirekt configure
Broker URL: https://broker.example.com
```

In a pipeline, pass `--broker-url` or set `BIDIREKT_BROKER_URL`, or write a profile with `bidirekt configure --broker-url <url>`, which never asks. Profiles, the config file and the order that wins are in the [CLI reference](../reference/cli.md#broker-address).
