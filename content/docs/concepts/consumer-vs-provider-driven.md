---
title: Consumer- vs provider-driven
description: The two known approaches to contract testing, and where Bidirekt stands among them.
---

The industry has two established ways of getting hold of the contract. Both work; they put the effort in different places.

## Consumer-driven

The consumer states what it needs, and the provider is checked against the union of what its consumers need. Ian Robinson described the pattern in "Consumer-Driven Contracts: A Service Evolution Pattern" (martinfowler.com, June 2006).

The usual implementation works by execution. The consumer's tests run against a mock of the provider; the mock records each request the consumer makes and the response the consumer expects, and writes them to a contract file. Later, that file is replayed against the running provider: each recorded request is sent to the real provider, and the actual response is compared with what the consumer expected.

The strength is precision: the provider learns exactly which fields each consumer reads, and the recording proves the consumer really makes those calls. The cost is execution: the provider has to run, with the data each recorded interaction expects, for every consumer's recordings, on every change.

## Provider-driven

The provider publishes a specification of what it serves, usually an OpenAPI document, and that document is the reference. Consumers check themselves against it: they validate their own calls, stubs or recordings against the specification, or generate their test doubles from it. The provider, in turn, checks that its implementation matches its own document.

The strength is independence: one document serves any number of consumers, and nobody has to coordinate a test run. The cost is blindness: the provider never learns which parts of the document anyone depends on, so a change that stays within the specification, such as making a field optional, can still remove something a consumer relies on.

## Where Bidirekt stands

Bidirekt is neither. **Both sides declare, symmetrically, in the same file format, and nothing runs.**

A provider declares what it provides: each endpoint, its methods, and the schema of every request and every response status. A consumer declares what it consumes, under the name of the provider it consumes from: the endpoints it calls, the fields it sends, and the fields it reads. Both declarations use the same three top-level keys, `provides`, `consumes` and `schemas`, and both are published to the broker under a version.

The pet API and the web app from [The problem](the-problem.md) look like this. The provider, `petstore_api`, creates, reads, updates and deletes pets:

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
          204:

schemas:
  Pet:
    type: object
    properties:
      petId:
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

The consumer, `petstore_web`, calls `GET /pets/*`, one of the four methods the provider serves, and reads two of the three fields:

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

What Bidirekt does **not** do is record the consumer's interactions and replay them against a running provider; that is the consumer-driven mechanism described above, and it is the opposite of what happens here. It also does not treat the provider's document as the only truth. The two declarations meet in the broker, and a single rule decides which side's required fields are the checklist, described in [Which side decides](../ship/can-i-deploy.md#which-side-decides).

The trade-off is stated plainly: the broker trusts the declarations. Nothing proves that a consumer really reads the fields it declares, or that a provider really serves the schema it declares. That proof moves to where the file is produced: written by hand and reviewed in the same pull request as the code, or generated from the code. See [Your first contract](../contracts/your-first-contract.md).
