---
title: Install the CLI
description: How to install the bidirekt CLI with curl or from the GitHub Release, and point it at your broker.
---

Bidirekt has two parts: the `bidirekt` CLI, which every pipeline and developer machine runs, and the broker, one server with its Postgres database that stores contracts and deployments. [CLI](install-the-cli.md) installs the client, [Broker](run-the-broker.md) puts the server in production, [Running local](running-local.md) starts both on your machine to try them, and [Agent skill](agent-skill.md) lets your coding agent write the contracts.

## With curl

```
$ curl -sSfL https://raw.githubusercontent.com/bidirekt/cli/main/install.sh | sh -s -- v0.1.0-rc.1
bidirekt 0.1.0-rc.1 installed to /home/you/.local/bin/bidirekt
```

The script downloads that release for your system, checks it against the release's `checksums.txt` and installs it in `~/.local/bin`, without `sudo`. A checksum that does not match stops it before anything is installed. When the directory is not on your `PATH`, it prints the line to add to your shell profile.

The version is written with or without the `v`: `v0.1.0-rc.1` and `0.1.0-rc.1` install the same release. Without a version, the script installs the latest release, but only pre-releases are published so far, so it stops and names the newest one:

```error title="install.sh output"
only pre-releases are published at https://github.com/bidirekt/cli/releases. Install the newest one with:
  curl -sSfL https://raw.githubusercontent.com/bidirekt/cli/main/install.sh | sh -s -- v0.1.0-rc.1
```

`-b` picks the directory. A directory owned by root, such as `/usr/local/bin`, needs `sudo` on the `sh`:

```
$ curl -sSfL https://raw.githubusercontent.com/bidirekt/cli/main/install.sh | sudo sh -s -- -b /usr/local/bin v0.1.0-rc.1
```

The CLI is built for Linux and macOS, on `x86_64` and `arm64`.

## From the GitHub Release

Every release at https://github.com/bidirekt/cli/releases has one archive per system, named `bidirekt_<version>_<os>_<arch>`: `linux` and `darwin` in `amd64` and `arm64`, as `.tar.gz`. Check the archive against `checksums.txt` before extracting it:

```
$ curl -sSfLO https://github.com/bidirekt/cli/releases/download/v0.1.0-rc.1/bidirekt_0.1.0-rc.1_linux_amd64.tar.gz
$ curl -sSfLO https://github.com/bidirekt/cli/releases/download/v0.1.0-rc.1/checksums.txt
$ sha256sum --check --ignore-missing checksums.txt
bidirekt_0.1.0-rc.1_linux_amd64.tar.gz: OK
$ tar -xzf bidirekt_0.1.0-rc.1_linux_amd64.tar.gz bidirekt
$ ./bidirekt version
bidirekt version 0.1.0-rc.1
```

On macOS, `shasum -a 256 --check --ignore-missing checksums.txt` does the same check.

## Pointing it at your broker

The CLI has no default broker. Save yours once:

```
$ bidirekt configure
Broker URL: https://broker.example.com
```

It goes into the `default` profile of `~/.config/bidirekt/config.json` (`$XDG_CONFIG_HOME/bidirekt/config.json` when that is set, or the file `BIDIREKT_CONFIG_FILE` names). A profile is one broker: a group of companies, or a freelancer working for several clients, keeps one profile per broker and picks it with `--profile` or `BIDIREKT_PROFILE`:

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

```error title="CLI error"
no broker configured — pass --broker-url, set BIDIREKT_BROKER_URL, or run "bidirekt configure"
```

When the config file has other profiles, a second line names them and how to pick one:

```error title="CLI error"
the config file has the profile local — pass --profile local or set BIDIREKT_PROFILE=local
```

On your machine, run `bidirekt configure`. In a pipeline, set `BIDIREKT_BROKER_URL`, or write a profile with `bidirekt configure --broker-url <url>`, which never asks. Every option is in the [CLI reference](../reference/cli.md#overview).
