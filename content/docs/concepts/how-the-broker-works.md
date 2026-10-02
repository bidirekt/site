---
title: How the broker works
description: What the broker stores, what it compares before a deployment, and the seven terms it uses to do it.
---

The broker stores what each service declares it provides and consumes, and before a deployment it compares that declaration with what is already running in the target environment. Seven terms cover everything it knows: participant, contract, version, snapshot, environment, can-i-deploy and deployment. The commands are documented in the [CLI reference](../reference/cli.md).

## Participant

```
$ bidirekt create-participant petstore_api
petstore_api participant created
```

A participant is a named service that publishes contracts. The name is the whole identity: it is how the broker files everything the participant publishes, and it is how other participants refer to it. A consumer names the provider it calls with this exact string, so a typo in a name is a contract with a provider that does not exist.

A participant is not "a provider" or "a consumer". The same participant provides endpoints to some services and consumes endpoints from others, and its contract file declares both sides at once.

## Contract

```
$ bidirekt publish petstore_api.yaml --participant petstore_api --version 1.0.0
petstore_api contract publish successful
```

A contract is what a participant declares about its integrations: the endpoints it provides and the endpoints it consumes, each with the schemas of its bodies. The [specification](../contracts/spec.md) documents the format. The broker compares properties and their types, never files: how a schema becomes the list of properties that are compared is in [the specification](../contracts/spec.md#how-a-schema-becomes-a-list-of-properties).

Publishing validates the file and stores it; it compares nothing. A contract that removes an endpoint another participant consumes publishes without an error, because a published version is not in use yet: nothing depends on it until it is deployed. The breaks appear when you run `can-i-deploy` for that version against the environment you intend to deploy it to.

## Version

A version is the label you attach to a contract when you publish it. It is any string; a commit hash or a release tag are the usual choices. Versions are unique within a participant and immutable once published:

- publishing the same version again with the same declarations succeeds and changes nothing;
- publishing the same version with different declarations is refused with `contract version already exists with different content`.

The broker never orders versions. It does not know that `2.0.0` comes after `1.0.0`, and it never needs to: every question it answers names a version explicitly. A version is what you ask about, what you deploy, and what you record.

## Snapshot

A snapshot is the stored content of a contract, and it is what a version points at. The broker identifies a snapshot by a checksum of its declarations, not by the text of the file. Formatting, comments, key order, schema names and the way the contract is split across files do not change the checksum.

Publishing a new version with the same declarations as one already published makes the new version an alias: it points at the same snapshot. The broker compares snapshots, never versions, so the two versions are the same contract for every check. You never name a snapshot yourself; you always name a version, and the broker resolves it.

## Environment

```
$ bidirekt create-environment production
production environment created
```

An environment is a named place where participants are deployed: `production`, `staging`, or whatever your pipeline calls them. The broker knows nothing about an environment except its name and which version of each participant is currently deployed there. It exists to answer one question: what is running together? It must be created before a check is asked about it or a deployment is recorded to it.

## Can I Deploy

`can-i-deploy` is the broker's answer to one question: can this version of this participant be deployed to this environment without breaking anything deployed there? To answer it, the broker takes the snapshot behind the version and compares it with every counterpart in the environment: the providers this participant consumes from and the consumers of what it provides, each read as the version currently deployed there.

When the answer is yes:

```
$ bidirekt can-i-deploy petstore_api --version 2.0.0 --environment production
petstore_api can be deployed to production
```

When it is no, the report lists every failing counterpart, with the version of it that is deployed in the environment:

```
$ bidirekt can-i-deploy petstore_api --version 2.0.0 --environment production
petstore_api cannot be deployed to production

petstore_app (1.0.0):
  GET /pets/*
    response 200:
      - property "$.status" is missing in provider
```

The command exits 0 on yes and 1 on no, which is what a pipeline gates on. The answer is yes only if every counterpart is compatible; nothing to check means yes, so a participant that only provides, with no consumer of it deployed in the environment, passes. Every line a break can carry is listed in the [CLI reference](../reference/cli.md#can-i-deploy).

Every comparison follows one rule: the side that reads a body decides what must be in it. In a response the provider produces the body and the consumer reads it; in a request the consumer produces it and the provider reads it. A property the reader requires must be declared by the producer, required too and with the same type. A property the reader marks optional may be absent, but if both sides declare it the types must match. A property the reader does not declare is not checked.

Three breaks come before any property is compared, because there is nothing to compare yet:

- the consumer names an endpoint, method or status that no published contract of the provider declares, or a provider that does not exist;
- the provider has published the resource but is not deployed in the environment;
- the provider under check no longer declares a resource that a consumer deployed in the environment still consumes.

## Deployment

```
$ bidirekt record-deployment petstore_api --version 1.0.0 --environment production
petstore_api deployment recorded to production
```

A deployment is the broker's record that a version of a participant is now the one running in an environment. You record it after your pipeline has deployed. The version must have been published and the environment must exist.

Each participant has exactly one current version per environment: the most recently recorded one. Recording the version that is already current changes nothing. Recording a version that was current earlier makes it current again; that is how a rollback is recorded, with the same command.

Recording never blocks. The broker takes your word that the deployment happened, whatever a check said; the check is a separate step, and it is your pipeline that decides not to deploy when the check fails.
