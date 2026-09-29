---
title: Contract testing
description: The problem two integrating services create for each other, where this project stands among the known approaches, and what bidirectional means here.
---

Contract testing checks that the two sides of an integration agree on what they exchange, without running them together. This page explains the problem that contract testing solves, the two approaches you will find in the industry, and the route this project takes: both sides declare what they provide and what they consume, in the same file format, and nothing runs.

## The problem

Take a pet API and a mobile app that calls it. The app requests `GET /pets/123` and reads two fields from the response: the pet's name and its status. The two are built by different people, tested separately, and deployed separately.

One day the API team renames `status` to `state`. Their code compiles, their tests pass, their deployment succeeds. The app keeps reading `status`, gets nothing, and shows every pet as unavailable. The break is discovered in production, by users, and the team that caused it is the last to hear about it.

Nothing in the usual test pyramid catches this in time:

- **Unit tests never call the real API.** The app's tests run against a fake API that answers with `status`, because that is what the app believed when the fake was written. When the real API changes, the fake does not, and the tests stay green.
- **End-to-end tests run both sides together, but not the right versions.** They run in a shared environment, such as staging, against whatever was deployed there last. That pair of versions is rarely the pair that will meet in production. The suite is slow and the environment is shared, so it runs late and not often. When it fails, it says that something is broken, not which two versions disagree on which field.

The sentence nobody gets is the useful one: _the version you are about to deploy removes a field that a deployed consumer still reads._ Producing that sentence before the deployment is what contract testing is for.

## What a contract is

A provider usually serves more than one client, and more than any one of them needs. The pet API returns more fields than the two the app reads, and serves endpoints the app never calls. The contract between the API and the app is only the part the app depends on: the endpoints it calls, with which methods, what it sends, and which fields it reads from each response.

Only a change inside that part can break the app. The API can rename or remove a field the app never reads, or drop an endpoint it never calls, and the app never notices.

Contract testing writes that part down for each pair of services, and checks every change against it before the change ships.

## The two known approaches

The industry has two established ways of getting hold of the contract. Both work; they put the effort in different places.

### Consumer-driven

The consumer states what it needs, and the provider is checked against the union of what its consumers need. Ian Robinson described the pattern in "Consumer-Driven Contracts: A Service Evolution Pattern" (martinfowler.com, June 2006).

The usual implementation works by execution. The consumer's tests run against a mock of the provider; the mock records each request the consumer makes and the response the consumer expects, and writes them to a contract file. Later, that file is replayed against the running provider: each recorded request is sent to the real provider, and the actual response is compared with what the consumer expected.

The strength is precision: the provider learns exactly which fields each consumer reads, and the recording proves the consumer really makes those calls. The cost is execution: the provider has to run, with the data each recorded interaction expects, for every consumer's recordings, on every change.

### Provider-driven

The provider publishes a specification of what it serves, usually an OpenAPI document, and that document is the reference. Consumers check themselves against it: they validate their own calls, stubs or recordings against the specification, or generate their test doubles from it. The provider, in turn, checks that its implementation matches its own document.

The strength is independence: one document serves any number of consumers, and nobody has to coordinate a test run. The cost is blindness: the provider never learns which parts of the document anyone depends on, so a change that stays within the specification, such as making a field optional, can still remove something a consumer relies on.

## Where this project stands

This project is neither. **Both sides declare, symmetrically, in the same file format, and nothing runs.**

A provider declares what it provides: each endpoint, its methods, and the schema of every request and every response status. A consumer declares what it consumes, under the name of the provider it consumes from: the endpoints it calls, the fields it sends, and the fields it reads. Both declarations use the same three top-level keys, `provides`, `consumes` and `schemas`, and both are published to the broker under a version.

The pet API and the mobile app from the first section look like this. The provider, `petstore_api`, creates, reads, updates and deletes pets:

```yaml
provides:
  rest:
    /pets:
      post:
        request: NewPet
        responses:
          201: Pet
    /pets/*:
      get:
        responses:
          200: Pet
      put:
        request: NewPet
        responses:
          200: Pet
      delete:
        responses:
          200: Pet

schemas:
  Pet:
    type: object
    properties:
      id:
        type: integer
      name:
        type: string
      status:
        type: string
  NewPet:
    type: object
    properties:
      name:
        type: string
      status:
        type: string
```

The consumer, `petstore_app`, which calls one of the four endpoints and reads two of the three fields:

```yaml
consumes:
  petstore_api:
    rest:
      /pets/*:
        get:
          responses:
            200: Pet

schemas:
  Pet:
    type: object
    properties:
      name:
        type: string
      status:
        type: string
```

Before a deployment, `bidirekt can-i-deploy` asks whether one version of one participant can go to one environment. The broker answers by comparing that version's declarations with the declarations of every counterpart deployed in that environment. If the API publishes a version without `status` and asks whether it can go to production while this app is deployed there, the answer is no, and the report names the field.

What this project does **not** do is record the consumer's interactions and replay them against a running provider; that is the consumer-driven mechanism described above, and it is the opposite of what happens here. It also does not treat the provider's document as the only truth. The two declarations meet in the broker, and a single rule decides which side's required fields are the checklist: the [direction rule](direction-rule.md).

The trade-off is stated plainly: the broker trusts the declarations. Nothing proves that a consumer really reads the fields it declares, or that a provider really serves the schema it declares. That proof moves to where the file is produced: written by hand and reviewed in the same pull request as the code, or generated from the code. See the [specification](../contracts/spec.md).

## Bidirectional contract testing

The industry defines bidirectional contract testing as the ability for both sides of an integration point to publish their own view of the integration: a consumer contract capturing what the consumer needs, and a provider contract publishing what the provider can do. A broker checks the two views against each other before a deployment, so that neither side has to run against the other to find out whether they still agree.

What the broker does is best described as declarative static bidirectional contract testing: **declarative**, because each side writes down what it provides and what it consumes in a contract file, instead of recording it from running code; **static**, because the broker compares those declarations without executing a service, a mock or a test; and **bidirectional**, because both sides publish, and a deployment of either side is checked against the other.

## Where to go next

- [How the broker works](how-the-broker-works.md): the seven terms the broker uses.
- [The direction rule](direction-rule.md): the one sentence that decides every `can-i-deploy`, and what the broker does not compare.
- [CLI reference](../reference/cli.md): the commands mentioned on this page.
