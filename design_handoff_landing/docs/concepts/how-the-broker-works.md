---
title: How the broker works
description: The seven terms you meet, in the order you meet them, from participant to can-i-deploy.
---

Seven words cover everything the broker knows: participant, contract, version,
snapshot, environment, deployment and can-i-deploy. This page defines each one in
the order the `bidirekt` commands make you meet them, so that every definition
stands on its own. The commands themselves are documented in the
[CLI reference](../reference/cli.md).

## Participant

```
bidirekt create-participant petstore_api
petstore_api participant created
```

A participant is a named service that publishes contracts. The name is the
whole identity: it is how the broker files everything the participant
publishes, and it is how other participants refer to it. A consumer names the
provider it calls with this exact string, so a typo in a name is a contract
with a provider that does not exist.

Names are snake_case: lowercase letters, digits and underscores, with no
empty word between underscores. A name that breaks the rule is refused with
`participant name must be snake_case`.

Creating a participant is idempotent: running the command again for a name
that already exists answers `participant already exists` and exits 0, so a
pipeline can run it on every build without checking first.

A participant is not "a provider" or "a consumer". The same participant
provides endpoints to some services and consumes endpoints from others, and
its contract file declares both sides at once.

## Contract

```
bidirekt publish petstore_api.yaml --participant petstore_api --version 1.0.0
petstore_api contract publish successful
```

A contract is what a participant declares about its integrations: what it
provides, meaning each endpoint, its methods, and the schema of every request
and every response status; and what it consumes, meaning, for each named
provider, the endpoints it calls, the fields it sends, and the fields it
reads. A contract is written in YAML with three top-level keys,
`provides`, `consumes` and `schemas`, and may be split across several files
that publish together as one contract. The
[specification](../contracts/spec.md) documents the format.

The broker does not keep the contract as a document. At publish time it
breaks the file into resources: one request per endpoint and method, and one
response per endpoint, method and status code. Each resource carries a flat
list of properties, nested ones included, written from the root of the body,
such as `$.petId` or `$.tags[].name`, and for each property a type and
whether it is optional. Every comparison the broker makes is between two such
lists. This is why the schema names in a file, `Pet` or `NewPet`, are for the
reader only: the broker sees properties and types.

Publishing validates the file and stores it. Nothing is compared at publish
time, and a contract that removes an endpoint publishes fine; whether that
removal breaks anyone is answered later, by a check against a specific
environment.

## Version

```
bidirekt publish petstore_api.yaml --participant petstore_api --version 1.0.0
```

A version is the label you attach to a contract when you publish it. It is
any string; a commit hash or a release tag are the usual choices. Versions
are unique within a participant and immutable once published:

- publishing the same version again with the same declarations succeeds and
  changes nothing;
- publishing the same version with different declarations is refused with
  `contract version already exists with different content`.

The broker never orders versions. It does not know that `2.0.0` comes after
`1.0.0`, and it never needs to: every question it answers names a version
explicitly. A version is what you deploy, what you record, and what you ask
about.

## Snapshot

A snapshot is the stored content of a contract, and it is what a version
points at. The broker identifies a snapshot by a checksum of its
declarations, the resources and their properties, not by the text of the
file. Formatting, comments, key order, schema names and the way the contract
is split across files do not change the checksum.

Two versions with identical declarations point at the same snapshot. The
broker compares snapshots, never versions, so those two versions are, for
every check, the same thing. You never name a snapshot yourself; you always
name a version, and the broker resolves it.

## Environment

```
bidirekt create-environment sandbox
sandbox environment created
```

An environment is a named place where participants are deployed:
`production`, `staging`, or whatever your pipeline calls them. The broker
knows nothing about an environment except its name and which version of each
participant is currently deployed there. It exists to answer one question:
what is running together?

An environment must be created before a deployment is recorded to it or a
check is asked about it; both commands answer `environment not found`
otherwise. Creating an environment is idempotent: the command answers
`environment already exists` and exits 0.

## Deployment

```
bidirekt record-deployment petstore_api --version 1.0.0 --environment production
petstore_api deployment recorded to production
```

A deployment is the broker's record that a version of a participant is now
the one running in an environment. You record it after your pipeline has
deployed. The version must have been published, or the command answers
`version not found`; the environment must exist.

Each participant has exactly one current version per environment: the most
recently recorded one. Recording the version that is already current changes
nothing. Recording a version that was current earlier makes it current again;
that is how a rollback is recorded, with the same command.

Recording never blocks. The broker takes your word that the deployment
happened, whatever a check said; the check is a separate step, and it is your
pipeline that decides not to deploy when the check fails.

## Can I Deploy

```
bidirekt can-i-deploy petstore_api --version 2.0.0 --environment production
```

`can-i-deploy` is the broker's answer to one question: can this version of this
participant be deployed to this environment without breaking anything
deployed there? To answer it, the broker takes the snapshot behind the
version, finds every counterpart in the environment, and compares. The
counterparts are the providers this participant consumes from and the
consumers of what it provides, each read as the version currently deployed in
that environment.

The answer comes per counterpart: compatible, or a list of breaks, each
naming the endpoint, the method, the request or the response status, and a
reason. The answer for the whole question is yes only if every counterpart
is compatible. Nothing to check means yes: a participant that only provides,
with no consumer of it deployed in the environment, passes. A participant
that consumes needs each provider it names to be deployed in that environment
and to declare what it reads; otherwise the report says so.

When the answer is yes:

```
petstore_api can be deployed to production
```

When it is no, the report lists every failing counterpart, with the version
of it that is deployed in the environment:

```
petstore_api cannot be deployed to production

petstore_app (1.0.0):
  GET /pets/*
    response 200:
      - property "$.status" is missing in provider
```

The command exits 0 on yes and 1 on no, which is what a pipeline gates on.
The lines a break can carry, the rule that decides which side is at fault,
and what is never compared, are in the [direction rule](direction-rule.md).

Part of the answer is remembered. The comparison of two snapshots is computed
once and stored, because two snapshots never change; the checks that depend
on deployments, such as whether the provider is deployed in the environment
at all, are computed on every call.

## The seven terms in one run

The order above is the order of a first run. Two participants, a provider
and its consumer, publish a version each, are checked and deployed to
production one after the other, and then the provider tries a second version
that drops a field the consumer reads:

```
bidirekt create-environment production
bidirekt create-participant petstore_api
bidirekt create-participant petstore_app
bidirekt publish petstore_api_v1.yaml --participant petstore_api --version 1.0.0
bidirekt publish petstore_app_v1.yaml --participant petstore_app --version 1.0.0
bidirekt can-i-deploy petstore_api --version 1.0.0 --environment production
bidirekt record-deployment petstore_api --version 1.0.0 --environment production
bidirekt can-i-deploy petstore_app --version 1.0.0 --environment production
bidirekt record-deployment petstore_app --version 1.0.0 --environment production
bidirekt publish petstore_api_v2.yaml --participant petstore_api --version 2.0.0
bidirekt can-i-deploy petstore_api --version 2.0.0 --environment production
```

Every command up to the last one succeeds. The first check of `petstore_api`
passes because no consumer is deployed yet; the check of `petstore_app` passes
because the provider it needs is deployed and declares everything it reads.
The last check fails with the report shown above, and `petstore_api` version
`2.0.0` stays out of production. The contract files are the two shown in
[contract testing](contract-testing.md), plus a second provider file without
`status`.
