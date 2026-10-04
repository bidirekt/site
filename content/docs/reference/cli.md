---
title: CLI reference
description: Every bidirekt command with an example, its arguments, and the mistakes worth knowing about.
---

`bidirekt` is the command-line client of the broker. One section per command, in the order a pipeline uses them; the help output, exit codes and output streams are in [Overview](#overview) at the end.

Every command that talks to the broker needs to know which broker: there is no default. Save it once with [`configure`](#configure), or pass it with `--broker-url` or `BIDIREKT_BROKER_URL`; see [Broker address](#overview) for the order that wins.

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

Without `--broker-url` and outside a terminal, it fails with `no terminal to ask for the broker URL — pass --broker-url`. `BIDIREKT_BROKER_URL` is ignored here: `configure` only writes the config file.

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
petstore_web 2.3.0 can be deployed to production
```

- `participant`: the participant you are about to deploy.
- `--version`: the published version you are about to deploy.
- `--environment`: where you are about to deploy it.

It exits `0` when the answer is yes and `1` when it is no; the report goes to stdout either way. Errors that stop the check go to stderr: a version that was never published fails with `contract not found`, an environment that does not exist with `environment not found`, and an unknown participant with `participant not found`.

```
$ bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production
petstore_web 2.3.0 cannot be deployed to production

petstore_api (1.4.0, deployed):
  GET /pets/*
    response 200:
      - petstore_web reads "$.status", but petstore_api doesn't provide it → stop reading it, or mark it optional
      - petstore_web reads "$.weight" as string, but petstore_api provides integer → read it as integer

petstore_reviews:
  GET /reviews/summary
    response 200:
      - petstore_web calls GET /reviews/summary, but petstore_reviews doesn't provide it → stop calling it, or wait until petstore_reviews publishes it
```

One block per counterpart that is not compatible, with the version of it deployed in the environment; the version is left out when it is not deployed there. Every line a break can carry, written from the side of `<participant>`, the participant under check, against `<counterpart>`, the counterpart it breaks:

| Line | When |
|---|---|
| `<participant> reads "<property>", but <counterpart> doesn't provide it → stop reading it, or mark it optional` | response: the participant requires a property the provider does not declare |
| `<participant> doesn't provide "<property>", but <counterpart> reads it → keep providing it` | response: the consumer requires a property the participant does not declare |
| `<participant> requires "<property>", but <counterpart> only sometimes provides it → mark it optional` | response: the participant requires a property the provider marks optional |
| `<participant> provides "<property>" only sometimes, but <counterpart> requires it → keep it required` | response: the consumer requires a property the participant marks optional |
| `<participant> doesn't send "<property>", but <counterpart> requires it → send it` | request: the provider requires a property the participant does not send |
| `<participant> requires "<property>", but <counterpart> doesn't send it → make it optional` | request: the participant requires a property the consumer does not send |
| `<participant> sends "<property>" only sometimes, but <counterpart> requires it → always send it` | request: the provider requires a property the participant marks optional |
| `<participant> requires "<property>", but <counterpart> sends it only sometimes → make it optional` | request: the participant requires a property the consumer marks optional |
| `<participant> reads "<property>" as <type>, but <counterpart> provides <counterpart type> → read it as <counterpart type>` | response: the participant reads the property with a different type than the provider declares |
| `<participant> provides "<property>" as <type>, but <counterpart> reads <counterpart type> → provide <counterpart type>` | response: the participant declares the property with a different type than the consumer reads |
| `<participant> sends "<property>" as <type>, but <counterpart> expects <counterpart type> → send <counterpart type>` | request: the participant sends the property with a different type than the provider declares |
| `<participant> expects "<property>" as <type>, but <counterpart> sends <counterpart type> → accept <counterpart type>` | request: the participant declares the property with a different type than the consumer sends |
| `<participant> calls <METHOD> <endpoint>, but <counterpart> doesn't provide it → stop calling it, or wait until <counterpart> publishes it` | the participant names an endpoint, method or status that no published contract of the provider declares, or a provider that does not exist |
| `<participant> calls <METHOD> <endpoint>, but <counterpart> is not deployed in <environment> (deployed in: <environments>) → deploy <counterpart> first` | the provider is not deployed in the target environment; the parenthesis is left out when it is deployed nowhere |
| `<participant> removed <METHOD> <endpoint>, but <counterpart> still calls it → keep it until <counterpart> stops calling it` | the participant dropped a resource that a consumer deployed in the environment still consumes |

`<property>` is written from the root of the body: `$.owner.name` for a member, `$[].photoUrl` for a member of each array item. An array type prints its item type, such as `array<object>`. Which side's required properties count is in [How the broker works](../concepts/how-the-broker-works.md#can-i-deploy).

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

Between steps 2 and 3 one side fails with a line such as `petstore_web calls GET /stock/*, but petstore_inventory doesn't provide it → stop calling it, or wait until petstore_inventory publishes it`: consumers still on the old name stop matching once the new version is deployed, and consumers already on the new name fail until it is. Renaming a consumer needs none of this.

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
  configure          Save the broker URL of a profile in the config file
  create-environment Create a new environment on the broker
  create-participant Create a new participant on the broker
  help               Help about any command
  publish            Publish one or more contract YAML files to the broker
  record-deployment  Record a deployment of a participant version to an environment
  rename-participant Rename an existing participant on the broker
  version            Print the bidirekt version

Flags:
      --broker-url string   Broker base URL
  -h, --help                help for bidirekt
      --profile string      Profile in the config file (falls back to BIDIREKT_PROFILE, then "default")
  -v, --version             version for bidirekt

Use "bidirekt [command] --help" for more information about a command.
```

**Broker address.** The first of these wins: `--broker-url`, then the `BIDIREKT_BROKER_URL` environment variable, then the URL saved in the active profile. The active profile is `--profile`, then `BIDIREKT_PROFILE`, then `default`. The flags go before or after the command, and the variables suit a pipeline:

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

When none of them has a URL, a terminal asks `Broker URL:` and saves the answer to the active profile, so the next run does not ask. Outside a terminal, as in a pipeline, the command fails without calling anything:

```
no broker configured — pass --broker-url, set BIDIREKT_BROKER_URL, or run "bidirekt configure"
```

A profile named with `--profile` or `BIDIREKT_PROFILE` that is not in the config file fails the same way with `profile "acme" not found in <path>`. An invalid URL fails wherever it comes from, naming the source: `invalid broker URL "broker.example.com" (from BIDIREKT_BROKER_URL) — use http:// or https:// followed by a host`.

**Config file.** Profiles live in `~/.config/bidirekt/config.json` (`$XDG_CONFIG_HOME/bidirekt/config.json` when `XDG_CONFIG_HOME` is set, `%AppData%\bidirekt\config.json` on Windows), or in the file `BIDIREKT_CONFIG_FILE` names. `configure` creates it readable only by you:

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

**Exit codes.** `0` on success, help and version; `1` for everything else, including a refused publish and a `can-i-deploy` answer of no.

**Output.** Success lines go to stdout and failures to stderr, except the `can-i-deploy` report, which always goes to stdout. In a terminal, success is green and failures are red; `NO_COLOR` turns color off and `CLICOLOR_FORCE=1` keeps it on when the output is piped.
