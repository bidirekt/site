# Bidirekt

Bidirekt is a declarative, static, bidirectional contract testing tool. Each side of an integration declares, in a small contract file, what it provides and what it consumes.

A provider declares the endpoints it serves, with their request and response schemas. A consumer declares the endpoints it calls, also with request and response schemas. The broker stores every published contract, records which version is deployed to which environment, and answers one question before a deployment: can this version go to this environment without breaking anything that is already there?

No server, local or remote, needs to be running to answer `can-i-deploy`. Both sides, consumer and provider, write the same declarative contract file, by hand or generated, and the broker compares the declarations statically.

## Concepts

- [Contract testing](concepts/contract-testing.md) — what problem contract testing solves, the two known approaches, why this project is neither, and what bidirectional means here.
- [How the broker works](concepts/how-the-broker-works.md) — what the broker stores, what it compares before a deployment, and the seven terms it uses: participant, contract, version, snapshot, environment, can-i-deploy and deployment.

## Contracts

- [Specification](contracts/spec.md) — the contract file: the resources a participant provides or consumes, the schemas of their bodies, and how several files publish as one contract.

## Reference

- [CLI reference](reference/cli.md) — every `bidirekt` command, flag, output and exit code.

## Guides

- [Installation](guides/installation.md) — how to install the `bidirekt` CLI and run the broker. *(not written yet)*
- [Getting started](guides/getting-started.md) — from an empty broker to a first `can-i-deploy`. *(not written yet)*
- [CI integration](guides/ci-integration.md) — publishing contracts and gating deployments from a pipeline. *(not written yet)*
