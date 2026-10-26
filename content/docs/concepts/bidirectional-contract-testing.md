---
title: Bidirectional contract testing
description: What bidirectional contract testing means in the industry, what declarative and static add, and where Bidirekt stands.
---

The industry defines bidirectional contract testing as the ability for both sides of an integration point to publish their own view of the integration: a consumer contract capturing what the consumer needs, and a provider contract publishing what the provider can do. A broker checks the two views against each other before a deployment, so that neither side has to run against the other to find out whether they still agree.

What the broker does is best described as declarative static bidirectional contract testing: **declarative**, because each side writes down what it provides and what it consumes in a contract file, instead of recording it from running code; **static**, because the broker compares those declarations without executing a service, a mock or a test; and **bidirectional**, because both sides publish, and a deployment of either side is checked against the other.

## Where Bidirekt stands

Bidirekt is neither [consumer-driven nor provider-driven](consumer-vs-provider-driven.md). **Both sides declare, symmetrically, in the same file format, and nothing runs.**

A provider declares what it provides: each resource, with the schema of every body. A consumer declares what it consumes, under the name of the provider it consumes from: the resources it consumes, the fields it sends and the fields it reads. Both declarations use the same three top-level keys, `provides`, `consumes` and `schemas`, and both are published to the broker under a version.

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

What Bidirekt does **not** do is record the consumer's interactions and replay them against a running provider; that is the consumer-driven mechanism, and it is the opposite of what happens here. It also does not treat the provider's document as the only truth. The two declarations meet in the broker, and a single rule decides which side's required fields are the checklist, described in [Which side decides](../contracts/which-side-decides.md).

The trade-off is stated plainly: the broker trusts the declarations. Nothing proves that a consumer really reads the fields it declares, or that a provider really serves the schema it declares. That proof moves to where the file is produced: written by hand and reviewed in the same pull request as the code, or generated from the code. See [Your first contract](../contracts/your-first-contract.md).
