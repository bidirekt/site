---
title: How the broker works
description: The terms the broker uses, in the order a pipeline meets them, from participant to deployment.
---

The broker stores what each service declares it provides and consumes, and before a deployment it compares that declaration with what is already running in the target environment. Eight terms cover what it knows, in the order a pipeline meets them: participant, environment, contract, version, snapshot, counterpart, can-i-deploy and deployment; a GraphQL graph is a kind of counterpart. The commands are documented in the [CLI reference](../reference/cli.md).

## Participant

A participant is a named service that publishes contracts. The name is the whole identity: it is how the broker files everything the participant publishes, and it is how other participants refer to it. The name is in snake_case: lowercase letters, digits and single underscores. A consumer names the provider it consumes from with this exact string, so a misspelled name publishes and fails at `can-i-deploy` ([REST: Resource breaks](../rest/breaks.md#every-break), [GraphQL: Breaks](../graphql/breaks.md#every-break)). The name can't change once the participant is created, and it can't be the name of a GraphQL [graph](../graphql/graphs.md): participants and graphs share one space of names. A participant must be created before it publishes: a publish under a name the broker does not know fails with `participant "petstore_api" not found → create it with: bidirekt create-participant petstore_api` ([publish](../ship/publish.md)).

A participant is not "a provider" or "a consumer". The same participant provides resources to some services and consumes resources from others, and declares both in one contract ([The contract file](../contracts/the-contract-file.md)).

## Environment

An environment is a named place where participants are deployed: `production`, `staging`, or whatever your pipeline calls them. For each environment, the broker keeps which version of each participant is deployed there now, the history of deployments recorded to it, and the can-i-deploy checks asked about it. It exists to answer one question: what is running together? It must be created before a check is asked about it or a deployment is recorded to it. It can be renamed at any time ([Web UI](../start/run-the-broker.md#web-ui)); its deployments and checks stay with it, and a pipeline that still passes the old name gets `environment not found`.

## Contract

A contract is what a participant declares about its integrations: the resources it provides and consumes, each with the schemas of its bodies. [The contract file](../contracts/the-contract-file.md) documents the format. A contract is written in YAML files and, for a GraphQL provider, in its GraphQL schema files. The broker compares properties and their types, never files. Publishing a contract compares nothing ([publish](../ship/publish.md)).

## Version

A version is the label you attach to a contract when you publish it. It is any string with no whitespace at either end; a commit hash or a release tag are the usual choices. Versions are unique within a participant and immutable once published:

- publishing the same version again with the same declarations succeeds and changes nothing;
- publishing the same version with different declarations is refused with `cannot post contract to broker: contract version already exists with different content`.

The broker never orders versions. It does not know that `2.0.0` comes after `1.0.0`, and it never needs to: every question it answers names a version explicitly. A version is what you ask about, what you deploy, and what you record.

## Snapshot

A snapshot is the stored content of a contract, and it is what a version points at. The broker identifies a snapshot by a checksum of its declarations, not by the text of the file. Formatting, comments, key order, the order of the files, the way the contract is split across files, a schema that nothing names and a `description` ([Types and their keys](../schemas/types.md#types-and-their-keys)) do not change the checksum. Schema names do: renaming a schema that a resource or a `ref` reaches is a different snapshot, so the same version published with a renamed schema is refused like any other change ([Version](#version)).

Publishing a new version with the same declarations as one already published makes the new version an alias: it points at the same snapshot. The broker compares snapshots, never versions, so the two versions are the same contract for every check. You never name a snapshot yourself; you always name a version, and the broker resolves it.

## Counterpart

A counterpart is a participant on the other side of an integration: a provider the participant consumes from, or a consumer of what the participant provides. In a check, each counterpart is read as the version currently deployed in the environment. A provider the participant consumes from that has no deployment in the environment is reported as not deployed, whatever it published, as in `petstore_web calls GET /pets/*, but petstore_api is not deployed in production` ([REST: Resource breaks](../rest/breaks.md#every-break), [GraphQL: Breaks](../graphql/breaks.md#every-break)).

A GraphQL graph is a counterpart too, though not a participant: a consumer of the graph is compared with the graph composed from the subgraphs deployed in the environment, and the report names the version of each one ([Graphs](../graphql/graphs.md)).

## can-i-deploy

`can-i-deploy` asks whether one version of one participant can be deployed to one environment. The broker compares the snapshot behind that version with every counterpart in the environment; [can-i-deploy](../ship/can-i-deploy.md) has the command and its report.

## Deployment

A deployment is the broker's record that a version of a participant is now the one running in an environment. You record it after your pipeline has deployed. The version must have been published and the environment must exist.

Each participant has exactly one current version per environment: the most recently recorded one. Recording the version that is already current changes nothing. Recording a version that was current earlier makes it current again; that is how a rollback is recorded, with the same command.

Recording never blocks. The broker takes your word that the deployment happened, whatever a check said; the check is a separate step, and it is your pipeline that decides not to deploy when the check fails.
