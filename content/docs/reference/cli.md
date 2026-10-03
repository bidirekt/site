---
title: CLI reference
description: Every bidirekt command with an example, its arguments, and the mistakes worth knowing about.
---

`bidirekt` is the command-line client of the broker. One section per command, in the order a pipeline uses them; the help output, exit codes and output streams are in [Overview](#overview) at the end.

Every command talks to the broker at `http://localhost:8080` unless you pass `--broker-url` or set `BIDIREKT_BROKER_URL`; see [Broker address](#overview) for examples.

## create-participant

```
$ bidirekt create-participant petstore_api
petstore_api participant created
```

- `name`: the participant's name, in `snake_case` (lowercase letters, digits and single underscores). Anything else fails with `participant name must be snake_case`.

Running it again for an existing name prints `petstore_api participant already exists` and exits `0`, so a pipeline can run it on every build.

## create-environment

```
$ bidirekt create-environment production
production environment created
```

- `name`: the environment's name, such as `production` or `staging`.

Running it again prints `production environment already exists` and exits `0`.

## publish

```
$ bidirekt publish contracts/*.yaml --participant petstore_api --version 1.4.0
petstore_api contract publish successful
```

- `file...`: one or more contract files, `.yaml` or `.yml`. All of them publish together as one contract ([Several files](../contracts/spec.md#several-files)); the shell expands globs.
- `--participant`: the participant the contract belongs to. It must exist, or the publish fails with `contract participant not found`.
- `--version`: any label, usually a commit hash or a release tag.

Publishing the same version again with different content fails with `contract version already exists with different content`; a version never changes once published.

A file that breaks the [specification](../contracts/spec.md) is rejected as a whole, with one line per violation:

```
$ bidirekt publish petstore_api.yaml --participant petstore_api --version 1.4.0
contract validation failed
  - petstore_api.yaml: invalid endpoint "/pets/{petId}" at provides rest, dynamic path segments must use *
```

## can-i-deploy

```
$ bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production
petstore_web can be deployed to production
```

- `participant`: the participant you are about to deploy.
- `--version`: the published version you are about to deploy.
- `--environment`: where you are about to deploy it.

It exits `0` when the answer is yes and `1` when it is no; the report goes to stdout either way. Errors that stop the check go to stderr: a version that was never published fails with `contract not found`, an environment that does not exist with `environment not found`, and an unknown participant with `participant not found`.

```
$ bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production
petstore_web cannot be deployed to production

petstore_api (1.4.0):
  GET /pets/*
    response 200:
      - property "$.status" is missing in provider
      - property "$.weight" type mismatch — consumer has string, provider has integer

petstore_reviews:
  GET /reviews/summary
    response 200:
      - no matching resource in provider
```

One block per counterpart that is not compatible, with the version of it deployed in the environment; the version is left out when it is not deployed there. Every line a break can carry:

| Line | When |
|---|---|
| `property "<property>" is missing in provider` | response: the consumer requires a property the provider does not declare |
| `property "<property>" is optional in provider but required in consumer` | response: the consumer requires a property the provider marks optional |
| `property "<property>" is missing in consumer` | request: the provider requires a property the consumer does not send |
| `property "<property>" is optional in consumer but required in provider` | request: the provider requires a property the consumer marks optional |
| `property "<property>" type mismatch — consumer has <type>, provider has <type>` | both sides declare the property with different types; an array prints its item type, such as `array<object>` |
| `no matching resource in provider` | the consumer names an endpoint, method or status that no published contract of the provider declares, or a provider that does not exist |
| `provider is not deployed in "<environment>" (deployed in: <environments>)` | the provider is not deployed in the target environment; the parenthesis is left out when it is deployed nowhere |
| `resource removed but still consumed` | the provider under check dropped a resource that a consumer deployed in the environment still consumes |

`<property>` is written from the root of the body: `$.owner.name` for a member, `$[].photoUrl` for a member of each array item. Which side's required properties count is in [How the broker works](../concepts/how-the-broker-works.md#can-i-deploy).

## record-deployment

```
$ bidirekt record-deployment petstore_web --version 2.3.0 --environment production
petstore_web deployment recorded to production
```

- `participant`: the participant you deployed.
- `--version`: the version you deployed. It must be published, or the command fails with `version not found`.
- `--environment`: where you deployed it. It must exist, or the command fails with `environment not found`.

Run it after the deployment succeeds. It never checks compatibility and never blocks; recording an earlier version again is how a rollback is recorded.

## rename-participant

```
$ bidirekt rename-participant petstore_inventory petstore_stock
petstore_inventory participant renamed to petstore_stock
```

- `old`: the current name.
- `new`: the new name, in `snake_case`. A name that is already taken fails with `participant already exists` and exits `1`; unlike `create-participant`, renaming is not idempotent.

The participant keeps its versions and deployments, but a provider's published resources keep the old name. Renaming a provider is a migration:

1. Rename the participant.
2. Publish and deploy a new version of the provider, so its resources carry the new name.
3. Switch every consumer's `consumes` key to the new name.

Between steps 2 and 3 one side fails with `no matching resource in provider`: consumers still on the old name stop matching once the new version is deployed, and consumers already on the new name fail until it is. Renaming a consumer needs none of this.

## version

```
$ bidirekt version
bidirekt version dev
```

`bidirekt --version` and `bidirekt -v` print the same. `dev` is what a binary built without a version prints; a release prints its own.

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

**Broker address.** The first of these wins: `--broker-url`, then the `BIDIREKT_BROKER_URL` environment variable, then `http://localhost:8080`. The flag goes before or after the command, and the variable suits a pipeline:

```
$ bidirekt --broker-url https://broker.example.com publish contracts/*.yaml --participant petstore_api --version 1.4.0
$ BIDIREKT_BROKER_URL=https://broker.example.com bidirekt can-i-deploy petstore_api --version 1.4.0 --environment production
```

A `.env` file in the current directory is read too, but never overrides a variable already set in the shell. A request that gets no answer is cancelled after 30 seconds.

**Exit codes.** `0` on success, help and version; `1` for everything else, including a refused publish and a `can-i-deploy` answer of no.

**Output.** Success lines go to stdout and failures to stderr, except the `can-i-deploy` report, which always goes to stdout. In a terminal, success is green and failures are red; `NO_COLOR` turns color off and `CLICOLOR_FORCE=1` keeps it on when the output is piped.
