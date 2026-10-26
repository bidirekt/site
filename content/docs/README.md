---
description: Every page of the Bidirekt docs, from installing the CLI to the reference, in the order of the journey.
---

# Bidirekt

Bidirekt is a [declarative, static, bidirectional](concepts/bidirectional-contract-testing.md) contract testing tool. The pages below follow the journey: start, understand the model, write the contracts, their REST resources and their schemas, ship, and look things up.

## Start

- [What is Bidirekt](start/what-is-bidirekt.md) — what Bidirekt is, its two parts, and the question its broker answers before a deployment.
- [Demo](start/demo.md) — `curl -sL bidirekt.com/demo | sh` runs the petstore example: a break caught by `can-i-deploy`, then fixed.
- [Try on your project](start/try.md) — `curl -sL bidirekt.com/try | sh` installs the CLI, the broker's compose file and the agent skill in your project.
- [Install the CLI](start/install-the-cli.md) — install `bidirekt` with curl, from the GitHub Release or as a Docker image, and point it at your broker.
- [Running local](start/running-local.md) — start Postgres and the broker on your machine to try them.
- [Agent skill](start/agent-skill.md) — let your coding agent write and fix the contract files.
- [Run in production](start/run-the-broker.md) — run the broker's Docker image in production, with its Postgres database.

## Understand

- [The problem](concepts/the-problem.md) — what breaks between two integrating services, and what a contract is.
- [Consumer- vs provider-driven](concepts/consumer-vs-provider-driven.md) — the two known approaches, and what each costs.
- [Bidirectional contract testing](concepts/bidirectional-contract-testing.md) — what bidirectional, declarative and static mean here, and where Bidirekt stands.
- [How the broker works](concepts/how-the-broker-works.md) — participant, environment, contract, version, snapshot, counterpart, can-i-deploy and deployment.

## Write contracts

- [Your first contract](contracts/your-first-contract.md) — what a contract file holds, with a provider and a consumer of the same resource.
- [Resources](contracts/resources.md) — the bodies a participant provides or consumes, the provider name a consumer writes, and `~` for a body the contract does not describe.
- [Several files](contracts/several-files.md) — how the files of one publish merge into one contract.
- [Which side decides](contracts/which-side-decides.md) — the rule behind every comparison: the side that reads a body decides what must be in it.
- [What is not compared](contracts/what-is-not-compared.md) — enum values, formats, descriptions, undeclared properties and unnamed schemas.

## REST

- [Resources](rest/resources.md) — what identifies a REST resource, and which side produces its body.
- [Endpoints](rest/endpoints.md) — how an endpoint is written so that both sides match.
- [Requests](rest/requests.md) — the schema of a request body, and the methods that accept one.
- [Responses](rest/responses.md) — the schema of each response status, and which statuses to declare.
- [What is not compared](rest/what-is-not-compared.md) — headers and query parameters.
- [Resource breaks](rest/breaks.md) — the breaks of an endpoint, a method, a status or a request body, and their fixes.

## Schemas

- [Nodes](schemas/nodes.md) — node types and their keys, `optional` and `nullable`, and schema names.
- [Primitives](schemas/primitives.md) — the five primitive types, and how `integer`, `float` and `number` compare.
- [Objects](schemas/objects.md) — `properties` and the names a property may have.
- [Arrays](schemas/arrays.md) — `items`, the node of every element.
- [Maps](schemas/maps.md) — objects whose keys are not known in advance.
- [References](schemas/references.md) — `ref` to a named schema, recursive schemas included.

## Ship

- [Participants & environments](ship/participants-and-environments.md) — create the participants and environments a check needs.
- [validate](ship/validate.md) — check contract files against an environment before you commit.
- [publish](ship/publish.md) — publish contract files as a version of a participant.
- [can-i-deploy](ship/can-i-deploy.md) — ask whether a version can go to an environment, and read the report.
- [Property breaks](ship/property-breaks.md) — every break of a property, with the fix of each side.
- [record-deployment](ship/record-deployment.md) — record a deployment, rollbacks included.

## Reference

- [CLI reference](reference/cli.md) — the help output, broker address, config file, exit codes and output, and every command.
- [File format](reference/file-format.md) — how a contract file is checked and parsed.
