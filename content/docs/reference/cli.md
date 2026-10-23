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

Without `--broker-url` and outside a terminal, such as with stdin from `/dev/null` in a CI job or an agent's shell, it fails with `no terminal to ask for the broker URL — pass --broker-url`. `BIDIREKT_BROKER_URL` is ignored here: `configure` only writes the config file.

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

## validate

```
$ bidirekt validate contracts/*.yaml --participant petstore_web --environment production
petstore_web local contract can be deployed to production
compared with: petstore_api, petstore_reviews
```

- `file or folder...`: one or more contract files or folders, the same ones [`publish`](#publish) takes.
- `--participant`: the participant the files belong to.
- `--environment`: the environment to check against.

It answers, before you commit, what `can-i-deploy` would answer after a publish: the files are checked as `publish` checks them, then compared with every counterpart deployed in the environment. Nothing is stored: no version, no check.

It exits `0` when the answer is yes and `1` when it is no; the report goes to stdout either way, with the same lines as [`can-i-deploy`](#can-i-deploy), including the line that names what it compared with:

```
$ bidirekt validate contracts/*.yaml --participant petstore_web --environment production
petstore_web local contract cannot be deployed to production

petstore_api (1.4.0, deployed):
  POST /pets/*/adopt
    response 200:
      - petstore_web reads response 200, but petstore_api answers only 204
        → petstore_web: read response 204
        → petstore_api: answer 200
  Pet.status — petstore_web reads it, but petstore_api doesn't provide it (2 places)
    → petstore_web: stop reading it, or handle its absence in the code and mark it optional
    → petstore_api: provide it
      · GET /pets response 200 at "$[].status"
      · GET /pets/* response 200 at "$.status"
  Pet.weight — petstore_web reads it as string, but petstore_api provides integer (2 places)
    → petstore_web: read it as integer
    → petstore_api: provide it as string there
      · GET /pets response 200 at "$[].weight" (petstore_api: PetRecord.weight)
      · GET /pets/* response 200 at "$.weight" (petstore_api: PetRecord.weight)

petstore_reviews:
  GET /reviews/summary
    response 200:
      - petstore_web calls GET /reviews/summary, but petstore_reviews doesn't provide it
        → petstore_web: stop calling it
        → petstore_reviews: publish it
```

Errors that stop the check go to stderr. The participant and the environment are checked before any file: an unknown participant fails with `participant "petstore_web" not found → create it with: bidirekt create-participant petstore_web`, an environment that does not exist with `environment not found`. Then a file that breaks the [specification](../contracts/spec.md) prints its violations as [`publish`](#publish) does.

## publish

```
$ bidirekt publish contracts/*.yaml --participant petstore_api --version 1.4.0
petstore_api contract publish successful
```

- `file or folder...`: one or more contract files, `.yaml` or `.yml`, or folders that hold them. All of them publish together as one contract ([Several files](../contracts/spec.md#several-files)); the shell expands globs.
- `--participant`: the participant the contract belongs to. It must exist, or the publish fails with `participant "petstore_api" not found → create it with: bidirekt create-participant petstore_api`, before any file is checked.
- `--version`: any label, usually a commit hash or a release tag. Publish from a commit that holds the contract files: a version never changes, so files that are not committed yet should not take the hash of the commit before them. Commit first, then publish.

A folder is read with its subfolders, and only its `.yaml` and `.yml` files count; a folder without any fails with `no contract YAML files in folder: "./docs"`. Files and folders can be mixed in one command. The files are read in alphabetical order, and a file reached twice, such as a file passed on its own and again through its folder, is read once, under the name the first argument gives it. A file found in a folder is named by the folder and its path inside it, so `./contracts/` gives `contracts/rest/pets.yaml`; a file passed on its own keeps the name you typed.

Publishing the same version again with different content fails with `contract version already exists with different content`; a version never changes once published.

A file that breaks the [specification](../contracts/spec.md) is rejected as a whole, with one line per violation:

```
$ bidirekt publish petstore_api.yaml --participant petstore_api --version 1.4.0
contract validation failed
  - petstore_api.yaml: invalid endpoint "/pets/{petId}" at provides rest, dynamic path segments must use *
```

The files are checked in two steps. First the shape of each file: its keys, endpoints, methods, statuses and schema nodes. Only when every file passes come the checks between names: a resource or a schema declared twice, a property given two types by two files of a consumer, and a schema name that no schema declares. While any file has a shape violation, the report lists only the shape violations; after they are fixed, the next run lists the others. If `petstore_api.yaml` above also named an undeclared schema, `200: Pett`, the second run would print:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: unresolved schema "Pett" referenced by provides GET /pets/* 200
```

## can-i-deploy

```
$ bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production
petstore_web 2.3.0 can be deployed to production
compared with: petstore_api, petstore_reviews
```

- `participant`: the participant you are about to deploy.
- `--version`: the published version you are about to deploy.
- `--environment`: where you are about to deploy it.

It exits `0` when the answer is yes and `1` when it is no; the report goes to stdout either way. A yes names, below it, the counterparts deployed in the environment that it compared with, in alphabetical order, or says there were none: `nothing deployed in production to compare with`. Errors that stop the check go to stderr: a version that was never published fails with `contract not found`, an environment that does not exist with `environment not found`, and an unknown participant with `participant not found`.

```
$ bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production
petstore_web 2.3.0 cannot be deployed to production

petstore_api (1.4.0, deployed):
  POST /pets/*/adopt
    response 200:
      - petstore_web reads response 200, but petstore_api answers only 204
        → petstore_web: read response 204
        → petstore_api: answer 200
  Pet.status — petstore_web reads it, but petstore_api doesn't provide it (2 places)
    → petstore_web: stop reading it, or handle its absence in the code and mark it optional
    → petstore_api: provide it
      · GET /pets response 200 at "$[].status"
      · GET /pets/* response 200 at "$.status"
  Pet.weight — petstore_web reads it as string, but petstore_api provides integer (2 places)
    → petstore_web: read it as integer
    → petstore_api: provide it as string there
      · GET /pets response 200 at "$[].weight" (petstore_api: PetRecord.weight)
      · GET /pets/* response 200 at "$.weight" (petstore_api: PetRecord.weight)

petstore_reviews:
  GET /reviews/summary
    response 200:
      - petstore_web calls GET /reviews/summary, but petstore_reviews doesn't provide it
        → petstore_web: stop calling it
        → petstore_reviews: publish it
```

One block per counterpart that is not compatible, with the version of it deployed in the environment; the version is left out when it is not deployed there. Each break is one line, written from the side of `<participant>`, the participant under check, against `<counterpart>`, the counterpart it breaks. Below it come the fixes, one line per side, the fix of `<participant>` first. The breaks of an endpoint, a method, a status or a request body come first, under the endpoint and the request or response status they are about:

```
<METHOD> <endpoint>
  response <status>:
    - <break>
      → <participant>: <fix>
      → <counterpart>: <fix>
```

Then the breaks of a property, one block per field, break and fix, in alphabetical order of the field. A block holds one break: the break and its fixes once, then every place where it happens, one line per request or response status and property. ` (<N> places)` is left out when there is one place. A place line takes one of two forms, for a response or for a request:

```
<field> — <break> (<N> places)
  → <participant>: <fix>
  → <counterpart>: <fix> there
    · <METHOD> <endpoint> response <status> at "<property>" (<counterpart>: <counterpart field>)
    · <METHOD> <endpoint> request at "<property>" (<counterpart>: <counterpart field>)
```

A fix is a change in the code first, then in the contract, so that the contract keeps describing what the code does. `<counterpart field>` is the field of `<counterpart>` at that property, the place to edit in its contract, and ` there` points the fix of `<counterpart>` at it; both are left out when `<counterpart>` has no field there. Every break and its fixes:

| Break | Fix of `<participant>` | Fix of `<counterpart>` | When |
|---|---|---|---|
| `<participant> reads it, but <counterpart> doesn't provide it` | `stop reading it, or handle its absence in the code and mark it optional` | `provide it` | response: the participant requires a property the provider does not declare, inside a parent the provider declares |
| `<participant> doesn't provide it, but <counterpart> reads it` | `provide it` | `stop reading it, or handle its absence in the code and mark it optional there` | response: the consumer requires a property the participant does not declare, inside a parent the participant declares |
| `<participant> requires it, but <counterpart> only sometimes provides it` | `handle its absence in the code, then mark it optional` | `always provide it there` | response: the participant requires a property the provider marks optional |
| `<participant> provides it only sometimes, but <counterpart> requires it` | `always provide it` | `handle its absence in the code, then mark it optional there` | response: the consumer requires a property the participant marks optional |
| `<participant> doesn't send it, but <counterpart> requires it` | `send it` | `stop requiring it, then mark it optional there` | request: the provider requires a property the participant does not send, inside a parent the participant sends |
| `<participant> requires it, but <counterpart> doesn't send it` | `stop requiring it, then mark it optional` | `send it` | request: the participant requires a property the consumer does not send, inside a parent the consumer sends |
| `<participant> sends it only sometimes, but <counterpart> requires it` | `always send it` | `handle its absence in the code, then mark it optional there` | request: the provider requires a property the participant marks optional |
| `<participant> requires it, but <counterpart> sends it only sometimes` | `handle its absence in the code, then mark it optional` | `always send it there` | request: the participant requires a property the consumer marks optional |
| `<participant> reads it as <type>, but <counterpart> provides <counterpart type>` | `read it as <counterpart type>` | `provide it as <type> there` | response: the participant reads the property as a type that does not accept the type the provider declares |
| `<participant> provides it as <type>, but <counterpart> reads <counterpart type>` | `provide it as <counterpart type>` | `read it as <type> there` | response: the consumer reads the property as a type that does not accept the type the participant declares |
| `<participant> sends it as <type>, but <counterpart> expects <counterpart type>` | `send <counterpart type>` | `accept <type> there` | request: the provider expects the property as a type that does not accept the type the participant sends |
| `<participant> expects it as <type>, but <counterpart> sends <counterpart type>` | `accept <counterpart type>` | `send <type> there` | request: the participant expects the property as a type that does not accept the type the consumer sends |
| `<participant> doesn't accept null, but <counterpart> may provide null` | `handle null in the code, then mark it nullable` | `stop providing null there` | response: the provider marks the property nullable and the participant does not |
| `<participant> may provide null, but <counterpart> doesn't accept it` | `stop providing null` | `handle null in the code, then mark it nullable there` | response: the participant marks the property nullable and the consumer does not |
| `<participant> may send null, but <counterpart> doesn't accept it` | `stop sending null` | `handle null in the code, then mark it nullable there` | request: the participant marks the property nullable and the provider does not |
| `<participant> doesn't accept null, but <counterpart> may send it` | `handle null in the code, then mark it nullable` | `stop sending null there` | request: the consumer marks the property nullable and the participant does not |
| `<participant> calls <METHOD> <endpoint>, but <counterpart> doesn't provide it` | `stop calling it` | `publish it` | the participant names an endpoint or method that no published contract of the provider declares, or a provider that does not exist |
| `<participant> reads response <status>, but <counterpart> answers only <statuses>` | `read response <statuses>` | `answer <status>` | response: the provider declares the endpoint and method, but not that status; `<statuses>` are the ones it declares, such as `201, 204 or 404` |
| `<participant> reads response <status>, but <counterpart> declares no response` | `stop reading it` | `answer <status>` | response: the provider declares the endpoint and method with no response at all |
| `<participant> sends a request body, but <counterpart> declares none` | `stop sending it` | `accept a request body` | request: the provider declares the endpoint and method with no `request` |
| `<participant> calls <METHOD> <endpoint>, but <counterpart> is not deployed in <environment> (deployed in: <environments>)` | none | `deploy it to <environment> first` | the provider is not deployed in the target environment; the parenthesis is left out when it is deployed nowhere |
| `<participant> removed <METHOD> <endpoint>, but <counterpart> still calls it` | `keep it until <counterpart> stops calling it` | `stop calling it` | the participant dropped a resource that a consumer deployed in the environment still consumes; printed once, right below `<METHOD> <endpoint>` |

A removed endpoint is reported once, right below `<METHOD> <endpoint>`, not under each request and response status it had. Any other break of that endpoint stays under its body or in its block:

```error title="can-i-deploy output"
petstore_web (2.3.0, deployed):
  POST /pets
    - petstore_api removed POST /pets, but petstore_web still calls it
      → petstore_api: keep it until petstore_web stops calling it
      → petstore_web: stop calling it
```

When the provider declares the endpoint and method but not the status the participant reads, or no request body, the break says what is missing and which statuses the provider answers, instead of `doesn't provide it`. A status only the provider declares obliges no consumer:

```error title="can-i-deploy output"
petstore_api (1.4.0, deployed):
  POST /files
    request:
      - petstore_web sends a request body, but petstore_api declares none
        → petstore_web: stop sending it
        → petstore_api: accept a request body
  POST /pets/*/adopt
    response 200:
      - petstore_web reads response 200, but petstore_api answers only 204
        → petstore_web: read response 204
        → petstore_api: answer 200
```

A property is only required where its parent is present. When the producing side does not declare a parent, only the parent can break, and only if it is required; its members, array items and map values are never reported on their own. The body itself has no parent, so it is always compared.

`<property>` is written from the root of the body: `$.owner.name` for a member, `$[].photoUrl` for a member of each array item, `$.pets{}.name` for a member of each map value; the root itself prints as `the body`, without quotes. An array type prints its item type, such as `array<object>`, and a map type its value type, such as `map<object>`.

`<field>` is the field of `<participant>` at that path: the schema name and the path inside that schema, the place to edit in the participant's own contract. `Pet.vaccinations[].name` is a member of each array item, `Pets{}.name` a member of each map value, and at the root it is only the schema name:

```error title="can-i-deploy output"
Address.city — petstore_web reads it, but petstore_api doesn't provide it
  → petstore_web: stop reading it, or handle its absence in the code and mark it optional
  → petstore_api: provide it
    · GET /pets/* response 200 at "$.owner.address.city"
Pet — petstore_web reads it as object, but petstore_api provides array<object>
  → petstore_web: read it as array<object>
  → petstore_api: provide it as object there
    · GET /owners/*/pet response 200 at the body (petstore_api: PetRecords)
```

When `<participant>` has no field at that path, as in the `doesn't provide` and `doesn't send` blocks, the block is named by the field of `<counterpart>`. A difference inside a schema used in several places is one block with its places, one for each request or each response status that reaches it; `<property>` is one of the properties that reach it there. A block holds only requests or only responses: the same difference in a request and in a response is two blocks, each with its own break and fixes. Which side's required properties count is in [How the broker works](../concepts/how-the-broker-works.md#can-i-deploy).

## record-deployment

```
$ bidirekt record-deployment petstore_web --version 2.3.0 --environment production
petstore_web deployment recorded to production
```

- `participant`: the participant you deployed.
- `--version`: the version you deployed. It must be published, or the command fails with `version not found`.
- `--environment`: where you deployed it. It must exist, or the command fails with `environment not found`.

Run it after the deployment succeeds. It never checks compatibility and never blocks.

Recording a version that was deployed in the environment before, and is not the current one there, is a rollback, and the line says so:

```
$ bidirekt record-deployment petstore_web --version 2.2.0 --environment production
petstore_web rolled back to 2.2.0 in production
```

Any other version prints `petstore_web deployment recorded to production`, as above.

## rename-participant

```
$ bidirekt rename-participant petstore_inventory petstore_stock
petstore_inventory participant renamed to petstore_stock
```

- `old`: the current name.
- `new`: the new name, in `snake_case`. A name that is already taken fails with `participant already exists` and exits `1`; unlike `create-participant`, renaming is not idempotent.

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

**Config file.** Profiles live in `~/.config/bidirekt/config.json` (`$XDG_CONFIG_HOME/bidirekt/config.json` when `XDG_CONFIG_HOME` is set), or in the file `BIDIREKT_CONFIG_FILE` names. `configure` creates it readable only by you:

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

**Output.** Success lines go to stdout and failures to stderr, except the `can-i-deploy` and `validate` reports, which always go to stdout. The `Broker:` line goes to stderr, before anything else, on success too. In a terminal, success is green and failures are red; `NO_COLOR` turns color off and `CLICOLOR_FORCE=1` keeps it on when the output is piped.
