---
title: What is Bidirekt
description: A declarative, static, bidirectional contract testing tool, and the question its broker answers before a deployment.
---

Bidirekt is a declarative, static, bidirectional contract testing tool. Each side of an integration declares, in a small contract file, what it provides and what it consumes.

Bidirekt has two parts: the `bidirekt` CLI, which every pipeline and developer machine runs, and the broker, one server with its Postgres database that stores contracts and deployments. [Install the CLI](install-the-cli.md) installs the client, [Running local](running-local.md) starts both on your machine to try them, [Agent skill](agent-skill.md) lets your coding agent write the contracts, and [Run in production](run-the-broker.md) puts the server in production.

A provider declares the resources it provides and a consumer the resources it consumes, each with the schemas of its bodies. The broker stores every published contract, records which version is deployed to which environment, and answers one question before a deployment: can this version go to this environment without breaking anything that is already there?

Both sides declare, and nothing runs: no server needs to be running to answer `can-i-deploy` ([Bidirectional contract testing](../concepts/bidirectional-contract-testing.md)).
