---
title: CLI reference
description: The bidirekt help output, broker address, config file, exit codes and output, with every command and where it is documented.
---

`bidirekt` is the command-line client of the broker. [Overview](#overview) has the help output, [Broker address](#broker-address) and [Config file](#config-file) how the CLI finds its broker and its API key, [When the broker refuses](#when-the-broker-refuses) the errors the broker answers with, [Exit codes and output](#exit-codes-and-output) the exit codes and output streams, and [Commands](#commands) lists every command, in the order a pipeline uses them.

Every command that talks to the broker needs to know which broker, and an API key to sign in to it: there is no default. Save both once with [`login`](#login), or set `BIDIREKT_BROKER_URL` and `BIDIREKT_API_KEY`; see [Broker address](#broker-address) for the order that wins.

## Overview

```
$ bidirekt --help
CLI for Bidirekt

Usage:
  bidirekt [command]

Available Commands:
  can-i-deploy       Check whether a participant version can be deployed to an environment
  completion         Generate the autocompletion script for the specified shell
  create-environment Create a new environment on the broker
  create-participant Create a new participant on the broker
  help               Help about any command
  list-environments  List the environments on the broker
  list-participants  List the participants on the broker
  login              Sign in to a broker with an API key and save both in a profile
  logout             Remove the API key from a profile in the config file
  publish            Publish one or more contract YAML files or folders to the broker
  record-deployment  Record a deployment of a participant version to an environment
  validate           Validate contract YAML files or folders against an environment without publishing them
  version            Print the bidirekt version

Flags:
  -h, --help             help for bidirekt
      --profile string   Profile in the config file (falls back to BIDIREKT_PROFILE, then "default")
  -v, --version          version for bidirekt

Use "bidirekt [command] --help" for more information about a command.
```

## Broker address

The broker URL and the API key always come together, from one place. When the environment variables `BIDIREKT_BROKER_URL` and `BIDIREKT_API_KEY` are both set, they win, and the config file is not read. Otherwise the command uses the URL and the key saved in the active profile by [`login`](#login). The active profile is `--profile`, then `BIDIREKT_PROFILE`, then `default`. `--profile` goes before or after the command, and the variables suit a pipeline:

```
$ bidirekt record-deployment petstore_api --version 1.4.0 --environment production --profile acme
$ BIDIREKT_BROKER_URL=https://broker.example.com BIDIREKT_API_KEY=<key> bidirekt can-i-deploy petstore_api --version 1.4.0 --environment production
```

Set both variables or neither. Only one of them fails without calling anything, even when a profile has a URL and a key:

```error title="CLI error"
set both BIDIREKT_BROKER_URL and BIDIREKT_API_KEY, or neither
```

Before calling the broker, each command prints which broker it uses and where that came from, on stderr; a password in the URL shows as `xxxxx`:

```
Broker: https://broker.example.com (profile: default)
Broker: https://broker.example.com (from BIDIREKT_BROKER_URL)
```

With an `http://` URL on any host other than `localhost` and `127.0.0.1`, a second line warns that the key is sent without TLS, and the command goes on:

```
warning: the API key travels unencrypted to http://broker.example.com
```

When neither has a URL, the command fails without calling anything, in a terminal or in a pipeline alike; it never asks. Run `login` once, then run the command again:

```error title="CLI error"
no broker configured — run "bidirekt login" or set BIDIREKT_BROKER_URL and BIDIREKT_API_KEY
```

When the config file has other profiles, a second line names them and how to pick one:

```error title="CLI error"
the config file has the profile local — pass --profile local or set BIDIREKT_PROFILE=local
the config file has the profiles acme, local — pass --profile <name> or set BIDIREKT_PROFILE=<name>
```

The first form is printed for one other profile, the second for several. A profile named with `--profile` or `BIDIREKT_PROFILE` that is not in the config file fails the same way with `profile "acme" not found in <path>`. An invalid URL fails wherever it comes from, naming the source: `invalid broker URL "broker.example.com" (from BIDIREKT_BROKER_URL) — use http:// or https:// followed by a host`. An API key always starts with `bdk_`; any other value fails before calling anything, naming where it came from: `the API key from BIDIREKT_API_KEY doesn't start with bdk_` or `the API key in profile acme doesn't start with bdk_`.

## Config file

Profiles live in `~/.config/bidirekt/config.json` (`$XDG_CONFIG_HOME/bidirekt/config.json` when `XDG_CONFIG_HOME` is set), or in the file `BIDIREKT_CONFIG_FILE` names. `login` creates it, and `login` and `logout` rewrite it readable only by you:

```json
{
  "profiles": {
    "default": { "brokerUrl": "https://broker.example.com", "apiKey": "bdk_…" },
    "acme": { "brokerUrl": "https://broker.acme.example", "apiKey": "bdk_…" },
    "globex": { "brokerUrl": "https://broker.globex.example", "apiKey": "bdk_…" }
  }
}
```

A `.env` file in the current directory is not read. A request that gets no answer is cancelled after 30 seconds.

## When the broker refuses

A key the broker does not accept, because it was revoked, expired or its user was deactivated, or a profile with a URL but no key, as `logout` leaves it, gets:

```error title="CLI error"
not signed in to https://broker.example.com — run "bidirekt login" or set BIDIREKT_BROKER_URL and BIDIREKT_API_KEY
```

A key without the permission the command needs, such as a `read` key running `publish`, gets:

```error title="CLI error"
the API key can't do this — check its permission at https://broker.example.com/profile
```

A broker that no longer works with this version of the CLI answers before doing anything, with the versions in its message. Install the version it names, or a newer one:

```error title="CLI error"
bidirekt <version> doesn't work with this broker (<broker version>); upgrade bidirekt to <minimum version> or later
```

## Exit codes and output

The CLI exits `0` on success, help and version; `1` for everything else, including a refused publish and a `can-i-deploy` answer of no.

Success lines go to stdout and failures to stderr, except the `can-i-deploy` and `validate` reports, which always go to stdout. The `Broker:` line goes to stderr, before anything else, on success too. In a terminal, success is green and failures are red; `NO_COLOR` turns color off and `CLICOLOR_FORCE=1` keeps it on when the output is piped.

## Commands

- [`login`](#login) — sign in to a broker with an API key and save both in a profile.
- [`create-participant`](#create-participant) — create a new participant on the broker.
- [`create-environment`](#create-environment) — create a new environment on the broker.
- [`validate`](../ship/validate.md) — validate contract files or folders against an environment without publishing them.
- [`publish`](../ship/publish.md) — publish one or more contract files or folders to the broker.
- [`can-i-deploy`](../ship/can-i-deploy.md) — check whether a participant version can be deployed to an environment.
- [`record-deployment`](../ship/record-deployment.md) — record a deployment of a participant version to an environment.
- [`list-participants`](#list-participants) — list the participants on the broker.
- [`list-environments`](#list-environments) — list the environments on the broker.
- [`logout`](#logout) — remove the API key from a profile in the config file.
- [`version`](#version) — print the bidirekt version.

## login

Create an API key on your Profile page in the broker first, as in [Run the broker](../start/run-the-broker.md#api-keys). Then:

```
$ bidirekt login
Profile [default]: acme
Broker URL: https://broker.acme.example
Create an API key at https://broker.acme.example/profile/api-keys/new and paste it here.
API key:
Signed in to https://broker.acme.example as profile acme
```

- `--profile`: the profile to sign in. Without it, `login` asks, and Enter keeps `BIDIREKT_PROFILE`, then `default`.

The URL must start with `http://` or `https://` followed by a host; `http://localhost:8080` is valid. Anything else prints `invalid broker URL "broker.example.com" — use http:// or https:// followed by a host` and is asked again. For a profile that already has a URL, the question shows it, and Enter keeps it: `Broker URL [https://broker.acme.example]: `.

The key is not shown while you type or paste it. A key that does not start with `bdk_` fails with `an API key starts with bdk_`. With an `http://` URL outside `localhost` and `127.0.0.1`, `login` prints the same `warning: the API key travels unencrypted to <url>` as the other commands. It then asks the broker whether it accepts the key, and saves the URL and the key in the profile only when it does. Otherwise nothing is saved, and it fails with `the broker refused this API key`, or with `cannot reach the broker at <url>:` followed by the reason, such as `HTTP 404` or `not a Bidirekt broker`.

A profile is one broker. A company with one broker only needs `default`. A group of companies, or a freelancer working for several clients, keeps one profile per broker, such as `acme` and `globex`. Environments such as `production` and `staging` live inside a broker, so they are never profiles.

After signing in, `login` warns on stderr about what still differs from the new profile:

- `the previous key is still valid — revoke it at https://broker.acme.example/profile`, when the profile had another key.
- `BIDIREKT_BROKER_URL and BIDIREKT_API_KEY are set and win over this profile`.
- `only one of BIDIREKT_BROKER_URL and BIDIREKT_API_KEY is set — commands will fail until both or neither are`.

Outside a terminal, such as with stdin from `/dev/null` in a CI job or an agent's shell, it fails with `no terminal to sign in — set BIDIREKT_BROKER_URL and BIDIREKT_API_KEY`. A pipeline sets the two variables instead of signing in.

## create-participant

```
$ bidirekt create-participant petstore_api
petstore_api participant created
```

- `name`: the participant's [name](../concepts/how-the-broker-works.md#participant), in `snake_case`. Anything else fails with `cannot post participant to broker: participant name must be snake_case`.

Other participants' contracts refer to it by this name, so the name can't change later. A wrong name means creating another participant.

Running it again for an existing name prints `petstore_api participant already exists` and exits `0`, so a pipeline can run it on every build.

## create-environment

```
$ bidirekt create-environment production
production environment created
```

- `name`: the environment's name, such as `production` or `staging`.

Running it again prints `production environment already exists` and exits `0`.

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

## logout

```
$ bidirekt logout --profile acme
Signed out of https://broker.acme.example (profile acme). The key is still valid — revoke it at https://broker.acme.example/profile
```

- `--profile`: the profile to sign out of. Without it, `BIDIREKT_PROFILE`, then `default`.

It removes only the key from the config file, without calling the broker: the URL stays, so the next `login` shows it. The key itself keeps working until you revoke it on your Profile page. A profile without a key prints `not signed in on profile acme` and exits `0`. When `BIDIREKT_BROKER_URL` and `BIDIREKT_API_KEY` are set, it also prints `BIDIREKT_BROKER_URL and BIDIREKT_API_KEY are still set and keep signing commands in`.

## version

```
$ bidirekt version
bidirekt version dev
```

`bidirekt --version` and `bidirekt -v` print the same. `dev` is what a binary built without a version prints; a release prints its own.
