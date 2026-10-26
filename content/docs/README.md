---
description: What Bidirekt is, what its CLI and its broker do, and where to start.
---

# Bidirekt

Bidirekt is a [declarative, static, bidirectional](concepts/why-bidirectional.md) contract testing tool. Each side of an integration declares, in a small contract file, the resources it provides and the resources it consumes, each with the schemas of its bodies.

Bidirekt has two parts: the `bidirekt` CLI, which every pipeline and developer machine runs, and the broker, one server with its Postgres database. The broker stores every published contract and records which version is deployed to which environment. Before a deployment, `bidirekt can-i-deploy` asks it one question: can this version go to this environment without breaking anything that is already there? The broker answers by comparing the declarations, so no service needs to be running.

To see it work, run the [Demo](start/demo.md): a break caught by `can-i-deploy` on the petstore example, then fixed. To set up your own project in one command, run [Try on your project](start/try.md). [Install](start/install.md) installs the CLI and the agent skill that lets your coding agent write the contracts, and [Run the broker](start/run-the-broker.md) runs the broker on your machine or in production.
