---
description: Every page of the Bidirekt docs, from installing the CLI to the reference, in the order of the journey.
---

# Bidirekt

Bidirekt is a declarative, static, bidirectional contract testing tool. The pages below follow the journey: start, write the contracts and their schemas, ship, understand the model, and look things up.

## Start

- [Demo](start/demo.md) — `curl -sL bidirekt.com/demo | sh` runs the petstore example: a break caught by `can-i-deploy`, then fixed.
- [What is Bidirekt](start/what-is-bidirekt.md) — what Bidirekt is and the question its broker answers before a deployment.
- [Try on your project](start/try.md) — `curl -sL bidirekt.com/try | sh` installs the CLI, the broker's compose file and the agent skill in your project.
- [Install the CLI](start/install-the-cli.md) — install `bidirekt` with curl or from the GitHub Release, and point it at your broker.
- [Run the broker](start/run-the-broker.md) — run the broker's Docker image in production, with its Postgres database.
- [Running local](start/running-local.md) — start Postgres and the broker on your machine to try them.
- [Agent skill](start/agent-skill.md) — let your coding agent write and fix the contract files.

## Write contracts

- [Your first contract](contracts/your-first-contract.md) — what a contract file holds, with a provider and a consumer of the same endpoint.
- [Resources](contracts/resources.md) — the bodies a participant provides or consumes, and the provider name a consumer writes.
- [Endpoints](contracts/endpoints.md) — how an endpoint is written so that both sides match.
- [Requests](contracts/requests.md) — the schema of a request body, and the methods that accept one.
- [Responses](contracts/responses.md) — the schema of each response status, and which statuses to declare.
- [Bodies not described](contracts/bodies-not-described.md) — `~` for a body the contract does not describe.
- [Several files](contracts/several-files.md) — how the files of one publish become one contract.
- [What is not compared](contracts/what-is-not-compared.md) — headers, query parameters, enum values and formats.

## Schemas

- [Primitives](schemas/primitives.md) — node types, `optional` and `nullable`, schema names, and the primitive types.
- [Objects](schemas/objects.md) — `properties` and the names a property may have.
- [Arrays](schemas/arrays.md) — `items`, the node of every element.
- [Maps](schemas/maps.md) — objects whose keys are not known in advance.
- [References](schemas/references.md) — `ref` to a named schema, recursive schemas included.

## Ship

- [Participants & environments](ship/participants-and-environments.md) — create the participants and environments a check needs.
- [validate](ship/validate.md) — check contract files against an environment before you commit.
- [publish](ship/publish.md) — publish contract files as a version of a participant.
- [can-i-deploy](ship/can-i-deploy.md) — ask whether a version can go to an environment, read the report, and the rule behind it.
- [record-deployment](ship/record-deployment.md) — record a deployment, rollbacks included.

## Understand

- [The problem](concepts/the-problem.md) — what breaks between two integrating services, and what a contract is.
- [Consumer- vs provider-driven](concepts/consumer-vs-provider-driven.md) — the two known approaches, and where this project stands.
- [Bidirectional contract testing](concepts/bidirectional-contract-testing.md) — what bidirectional, declarative and static mean here.
- [Participant](concepts/participant.md) — what the broker stores, and the named service that publishes contracts.
- [Contract, version & snapshot](concepts/contract-version-snapshot.md) — what a participant declares, the label it publishes under, and what the broker compares.
- [Environment](concepts/environment.md) — a named place where participants are deployed.
- [Deployment](concepts/deployment.md) — the record that a version is running in an environment.

## Reference

- [CLI reference](reference/cli.md) — the help output, broker address, config file, exit codes and output, and every command.
- [File format](reference/file-format.md) — how a contract file is checked and parsed.
- [Postgres in production](reference/postgres-in-production.md) — the choices worth making for the broker's database.
