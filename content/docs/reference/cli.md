---
title: CLI reference
description: Every bidirekt command, flag, output and exit code.
---

`bidirekt` is the command-line client of the broker. This page lists the six commands and `version`: flags with their help text, what each prints, how the broker address is resolved, and the exit codes.

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
  publish            Publish one or more contract YAML files to the broker
  record-deployment  Record a deployment of a participant version to an environment
  rename-participant Rename an existing participant on the broker
  version            Print the bidirekt version

Flags:
      --broker-url string   Broker base URL (default "http://localhost:8080")
  -h, --help                help for bidirekt
  -v, --version             version for bidirekt

Use "bidirekt [command] --help" for more information about a command.
```

`help` and `completion` are the standard help and shell-completion commands. Every command accepts `-h, --help` and the global `--broker-url`. Every command that talks to the broker prints one line on success; `create-participant` and `create-environment` given a name that already exists print `… already exists` instead and still exit `0`.

## Broker address

The broker base URL is resolved once per run, in this order:

1. `--broker-url <url>`, a global flag accepted before or after the command (`bidirekt --broker-url http://broker:8080 publish ...` and `bidirekt publish ... --broker-url http://broker:8080` are equivalent);
2. the `BIDIREKT_BROKER_URL` environment variable;
3. `http://localhost:8080`.

Before reading the environment, `bidirekt` loads a `.env` file from the current working directory, if there is one. A variable already set in the process environment is never overridden by the file, so a `BIDIREKT_BROKER_URL` exported in the shell beats the same key in `.env`, and the flag beats both. A missing `.env` is silently ignored. The file is looked up where you run `bidirekt`, not where the contract files live.

The help text shows the value that will actually be used: with `BIDIREKT_BROKER_URL=http://127.0.0.1:2` in `.env`, `bidirekt --help` prints `--broker-url string   Broker base URL (default "http://127.0.0.1:2")`.

Every command that talks to the broker sends exactly one `POST` request with a JSON body to the resolved URL. The request is cancelled after 30 seconds.

## Exit codes and output streams

| Exit code | When |
|---|---|
| `0` | the command succeeded, or you asked for help or the version |
| `1` | anything else: a usage error, a file the CLI refused before sending, a broker that could not be reached, a non-success answer from the broker, a publish rejected with violations, or a `can-i-deploy` answer of "not deployable" |

There is no other exit code. Success lines, help and `version` go to stdout; failure lines go to stderr, except the failing `can-i-deploy` report, described under that command.

When the stream is a terminal, the success line is printed in green and the failure headline in red (text color only). `NO_COLOR` disables color; `CLICOLOR_FORCE=1` forces it when the output is piped.

## create-participant

```
bidirekt create-participant [name]
```

```
petstore_api participant created
```

## create-environment

```
bidirekt create-environment [name]
```

```
production environment created
```

## publish

```
bidirekt publish [file...] --participant <name> --version <version>
```

| Flag | Help text |
|---|---|
| `--participant string` | `Participant name (required)` |
| `--version string` | `Contract version, e.g. a commit hash or semver tag (required)` |

All the files given in one call are published together as one contract version ([Several files](../contracts/spec.md#several-files)); globs are expanded by the shell. The extension of each file must be `.yaml` or `.yml`, and the content is validated by the broker against the [specification](../contracts/spec.md).

```
petstore_api contract publish successful
```

## record-deployment

```
bidirekt record-deployment [participant] --version <version> --environment <name>
```

| Flag | Help text |
|---|---|
| `--version string` | `Deployed version, e.g. a commit hash or semver tag (required)` |
| `--environment string` | `Target environment name (required)` |

```
petstore_api deployment recorded to production
```

## rename-participant

```
bidirekt rename-participant [old] [new]
```

Only the new name has to be `snake_case`; the old one is looked up as is.

The rename changes only the name: the participant keeps its published versions and recorded deployments. Resources, though, are identified by the provider name they were published under, and a rename never recomputes that identity. A consumer that keeps the old name in `consumes` keeps matching the resources published before the rename and keeps passing `can-i-deploy`. A consumer that switches to the new name matches only the versions the provider publishes after the rename; until one of those is deployed to the environment, its check fails with `no matching resource in provider`. Renaming a provider is therefore a migration: the provider publishes and deploys a new version under the new name, and every consumer switches its `consumes` key; whichever order you choose, one side is red in between. Renaming a consumer changes nothing about what it matches, because matching only looks at the provider's name.

```
petstore_inventory participant renamed to petstore_inventory_v2
```

## can-i-deploy

```
bidirekt can-i-deploy [participant] --version <version> --environment <name>
```

| Flag | Help text |
|---|---|
| `--version string` | `Version to check, e.g. a commit hash or semver tag (required)` |
| `--environment string` | `Target environment name (required)` |

Deployable, exit code `0`:

```
petstore_api can be deployed to production
```

Not deployable, exit code `1`. The report is the command's result, not an error, so it goes to **stdout**; a pipeline that captures only stderr sees nothing when a deployment is refused. This is real output for a consumer `petstore_web` whose contract disagrees with the deployed `petstore_api` and consumes a `petstore_reviews` that never published anything; a third counterpart, `petstore_inventory`, was compatible and is therefore not listed:

```
petstore_web cannot be deployed to production

petstore_api (1.4.0):
  POST /pets
    request:
      - property "$.name" is missing in consumer
    response 201:
      - property "$.weight" type mismatch — consumer has string, provider has integer
      - property "$.status" is missing in provider
  GET /pets/*
    response 200:
      - property "$.status" is missing in provider
      - property "$.weight" type mismatch — consumer has string, provider has integer

petstore_reviews:
  GET /reviews/summary
    response 200:
      - no matching resource in provider
```

One block per counterpart that is **not** deployable; compatible counterparts are omitted. The version in parentheses is the one deployed to the environment, and it is omitted when the counterpart is not deployed there, whether it published nothing at all or is deployed only to other environments.

Ordering: counterpart blocks in alphabetical order; endpoints in alphabetical order and, within an endpoint, methods in alphabetical order; `request:` always before the response statuses, statuses in ascending order; break lines in the order the broker returned them, which is not sorted.

Which line a break gets, and when, is in the [direction rule](../concepts/direction-rule.md).

## version

```
bidirekt version
```

```
$ bidirekt version
bidirekt version dev
$ bidirekt --version
bidirekt version dev
$ bidirekt -v
bidirekt version dev
```

All three print to stdout and exit with `0`. `dev` is the value of a binary built without a version injected at build time; release builds inject theirs.
