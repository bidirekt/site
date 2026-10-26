---
title: How the broker works
description: The terms the broker uses, in the order a pipeline meets them, from participant to deployment.
---

The broker stores what each service declares it provides and consumes, and before a deployment it compares that declaration with what is already running in the target environment. Eight terms cover everything it knows, in the order a pipeline meets them: participant, environment, contract, version, snapshot, counterpart, can-i-deploy and deployment. The commands are documented in the [CLI reference](../reference/cli.md).

## Participant

A participant is a named service that publishes contracts. The name is the whole identity: it is how the broker files everything the participant publishes, and it is how other participants refer to it. The name is in snake_case: lowercase letters, digits and single underscores. A consumer names the provider it consumes from with this exact string, so a typo in a name is a contract with a provider that does not exist.

A participant is not "a provider" or "a consumer". The same participant provides resources to some services and consumes resources from others, and its contract file declares both sides at once.

## Environment

An environment is a named place where participants are deployed: `production`, `staging`, or whatever your pipeline calls them. The broker knows nothing about an environment except its name and which version of each participant is currently deployed there. It exists to answer one question: what is running together? It must be created before a check is asked about it or a deployment is recorded to it.

## Contract

A contract is what a participant declares about its integrations: the resources it provides and consumes, each with the schemas of its bodies. [Write contracts](../contracts/your-first-contract.md) documents the format. The broker compares properties and their types, never files. Publishing a contract compares nothing; the breaks appear at `can-i-deploy` ([publish](../ship/publish.md)).

## Version

A version is the label you attach to a contract when you publish it. It is any string; a commit hash or a release tag are the usual choices. Versions are unique within a participant and immutable once published:

- publishing the same version again with the same declarations succeeds and changes nothing;
- publishing the same version with different declarations is refused with `cannot post contract to broker: contract version already exists with different content`.

The broker never orders versions. It does not know that `2.0.0` comes after `1.0.0`, and it never needs to: every question it answers names a version explicitly. A version is what you ask about, what you deploy, and what you record.

## Snapshot

A snapshot is the stored content of a contract, and it is what a version points at. The broker identifies a snapshot by a checksum of its declarations, not by the text of the file. Formatting, comments, `description`, key order, the order of the files, the way the contract is split across files and a schema that nothing names do not change the checksum. Schema names do: renaming a schema that a resource or a `ref` reaches is a different snapshot, so the same version published with a renamed schema is refused with `cannot post contract to broker: contract version already exists with different content`.

Publishing a new version with the same declarations as one already published makes the new version an alias: it points at the same snapshot. The broker compares snapshots, never versions, so the two versions are the same contract for every check. You never name a snapshot yourself; you always name a version, and the broker resolves it.

## Counterpart

A counterpart is a participant on the other side of an integration: a provider the participant consumes from, or a consumer of what the participant provides. In a check, each counterpart is read as the version currently deployed in the environment.

## can-i-deploy

`can-i-deploy` asks whether one version of one participant can be deployed to one environment. The broker compares the snapshot behind that version with every counterpart in the environment; [can-i-deploy](../ship/can-i-deploy.md) has the command and its report.

## Deployment

A deployment is the broker's record that a version of a participant is now the one running in an environment. You record it after your pipeline has deployed. The version must have been published and the environment must exist.

Each participant has exactly one current version per environment: the most recently recorded one. Recording the version that is already current changes nothing. Recording a version that was current earlier makes it current again; that is how a rollback is recorded, with the same command.

Recording never blocks. The broker takes your word that the deployment happened, whatever a check said; the check is a separate step, and it is your pipeline that decides not to deploy when the check fails.
