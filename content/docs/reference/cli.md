---
title: CLI reference
description: The bidirekt help output, broker address, config file, exit codes and output, with every command and where it is documented.
---

`bidirekt` is the command-line client of the broker. [Overview](#overview) has the help output, [Broker address](#broker-address) and [Config file](#config-file) how the CLI finds its broker, [Exit codes and output](#exit-codes-and-output) the exit codes and output streams, and [Commands](#commands) lists every command, in the order a pipeline uses them.

Every command that talks to the broker needs to know which broker: there is no default. Save it once with [`configure`](#configure), or pass it with `--broker-url` or `BIDIREKT_BROKER_URL`; see [Broker address](#broker-address) for the order that wins.

## Overview

```
$ bidirekt --help
CLI for Bidirekt

Usage:
  bidirekt [command]

Available Commands:
  can-i-deploy       Check whether a participant version can be deployed to an environment
  completion         Generate the autocompletion script for the specified shell
  configure          Save the broker URL of a profile in the config file
  create-environment Create a new environment on the broker
  create-participant Create a new participant on the broker
  help               Help about any command
  list-environments  List the environments on the broker
  list-participants  List the participants on the broker
  publish            Publish one or more contract YAML files or folders to the broker
  record-deployment  Record a deployment of a participant version to an environment
  rename-participant Rename an existing participant on the broker
  validate           Validate contract YAML files or folders against an environment without publishing them
  version            Print the bidirekt version

Flags:
      --broker-url string   Broker base URL
  -h, --help                help for bidirekt
      --profile string      Profile in the config file (falls back to BIDIREKT_PROFILE, then "default")
  -v, --version             version for bidirekt

Use "bidirekt [command] --help" for more information about a command.
```

## Broker address

The first of these wins: `--broker-url`, then the `BIDIREKT_BROKER_URL` environment variable, then the URL saved in the active profile. The active profile is `--profile`, then `BIDIREKT_PROFILE`, then `default`. The flags go before or after the command, and the variables suit a pipeline:

```
$ bidirekt --broker-url https://broker.example.com publish contracts/*.yaml --participant petstore_api --version 1.4.0
$ BIDIREKT_BROKER_URL=https://broker.example.com bidirekt can-i-deploy petstore_api --version 1.4.0 --environment production
$ bidirekt record-deployment petstore_api --version 1.4.0 --environment production --profile acme
```

Before calling the broker, each command prints which broker it uses and where that came from, on stderr; a password in the URL shows as `xxxxx`:

```
Broker: https://broker.example.com (profile: default)
Broker: https://broker.example.com (from BIDIREKT_BROKER_URL)
Broker: https://broker.example.com (from --broker-url)
```

When none of them has a URL, the command fails without calling anything, in a terminal or in a pipeline alike; it never asks. Run `configure` once, then run the command again:

```error title="CLI error"
no broker configured — pass --broker-url, set BIDIREKT_BROKER_URL, or run "bidirekt configure"
```

When the config file has other profiles, a second line names them and how to pick one:

```error title="CLI error"
the config file has the profile local — pass --profile local or set BIDIREKT_PROFILE=local
the config file has the profiles acme, local — pass --profile <name> or set BIDIREKT_PROFILE=<name>
```

The first form is printed for one other profile, the second for several. A profile named with `--profile` or `BIDIREKT_PROFILE` that is not in the config file fails the same way with `profile "acme" not found in <path>`. An invalid URL fails wherever it comes from, naming the source: `invalid broker URL "broker.example.com" (from BIDIREKT_BROKER_URL) — use http:// or https:// followed by a host`.

## Config file

Profiles live in `~/.config/bidirekt/config.json` (`$XDG_CONFIG_HOME/bidirekt/config.json` when `XDG_CONFIG_HOME` is set), or in the file `BIDIREKT_CONFIG_FILE` names. `configure` creates it readable only by you:

```json
{
  "profiles": {
    "default": { "brokerUrl": "https://broker.example.com" },
    "acme": { "brokerUrl": "https://broker.acme.example" },
    "globex": { "brokerUrl": "https://broker.globex.example" }
  }
}
```

A `.env` file in the current directory is not read. A request that gets no answer is cancelled after 30 seconds.

## Exit codes and output

The CLI exits `0` on success, help and version; `1` for everything else, including a refused publish and a `can-i-deploy` answer of no.

Success lines go to stdout and failures to stderr, except the `can-i-deploy` and `validate` reports, which always go to stdout. The `Broker:` line goes to stderr, before anything else, on success too. In a terminal, success is green and failures are red; `NO_COLOR` turns color off and `CLICOLOR_FORCE=1` keeps it on when the output is piped.

## Commands

- [`configure`](#configure) — save the broker URL of a profile in the config file.
- [`create-participant`](../ship/participants-and-environments.md#create-participant) — create a new participant on the broker.
- [`create-environment`](../ship/participants-and-environments.md#create-environment) — create a new environment on the broker.
- [`validate`](../ship/validate.md) — validate contract files or folders against an environment without publishing them.
- [`publish`](../ship/publish.md) — publish one or more contract files or folders to the broker.
- [`can-i-deploy`](../ship/can-i-deploy.md) — check whether a participant version can be deployed to an environment.
- [`record-deployment`](../ship/record-deployment.md) — record a deployment of a participant version to an environment.
- [`rename-participant`](#rename-participant) — rename an existing participant on the broker.
- [`list-participants`](#list-participants) — list the participants on the broker.
- [`list-environments`](#list-environments) — list the environments on the broker.
- [`version`](#version) — print the bidirekt version.

## configure

```
$ bidirekt configure
Broker URL: https://broker.example.com
```

- `--profile`: the profile to save into. Without it, `BIDIREKT_PROFILE`, then `default`.
- `--broker-url`: saves this URL without asking, which is how a script or a pipeline configures a profile.

The URL must start with `http://` or `https://` followed by a host; `http://localhost:8080` is valid. Anything else is asked again, or with `--broker-url` fails with `invalid broker URL "broker.example.com" (from --broker-url) — use http:// or https:// followed by a host`, and nothing is saved.

A profile is one broker. A company with one broker only needs `default`. A group of companies, or a freelancer working for several clients, keeps one profile per broker, such as `acme` and `globex`. Environments such as `production` and `staging` live inside a broker, so they are never profiles.

Running it again for a profile that already has a URL shows it, and Enter keeps it:

```
$ bidirekt configure --profile acme
Broker URL [https://broker.acme.example]:
```

Without `--broker-url` and outside a terminal, such as with stdin from `/dev/null` in a CI job or an agent's shell, it fails with `no terminal to ask for the broker URL — pass --broker-url`. `BIDIREKT_BROKER_URL` is ignored here: `configure` only writes the config file.

## rename-participant

```
$ bidirekt rename-participant petstore_inventory petstore_stock
petstore_inventory participant renamed to petstore_stock
```

- `old`: the current name.
- `new`: the new name, in `snake_case`. A name that is already taken fails with `cannot post participant rename to broker: participant already exists` and exits `1`; unlike `create-participant`, renaming is not idempotent.

Renaming works only before the participant's first publish. A participant with at least one published contract keeps its name: the rename fails with `cannot post participant rename to broker: participant has published contracts, create a new participant and switch every consumer's consumes to it` and exits `1`.

To change the name of a participant that has published:

1. Create a new participant with the new name and publish its contract.
2. Every consumer switches its `consumes` key to the new name and publishes.
3. The old participant stays, with its versions and deployments.

A participant that has not published may already be named under other participants' `consumes`, because a consumer can publish before its provider. After the rename, those consumers switch their `consumes` key to the new name.

## list-participants

```
$ bidirekt list-participants
petstore_api
petstore_reviews
petstore_web
```

One name per line, in alphabetical order. Use it to check a participant's exact name before writing it under `consumes` or passing it to a command. With no participants it prints nothing and exits `0`.

## list-environments

```
$ bidirekt list-environments
production
staging
```

One name per line, in alphabetical order. Use it to check an environment's exact name before passing it to `--environment`. With no environments it prints nothing and exits `0`.

## version

```
$ bidirekt version
bidirekt version dev
```

`bidirekt --version` and `bidirekt -v` print the same. `dev` is what a binary built without a version prints; a release prints its own.
