---
title: The direction rule
description: The one sentence that decides every can-i-deploy, the optional and required tables for each direction, the checks that come before it, and what is never compared.
---

Every property break the broker reports comes from one rule. This page states
it once, says who reads and who produces in each direction, gives the two
tables that follow from it, shows the rule producing real report lines, and
ends with the checks that run before the rule and with what is never
compared.

## The rule

> **The required properties of the side that reads are the checklist; the side that
> produces must satisfy all of them, and nothing the reader did not ask for is
> checked.**

Who reads depends on the direction of the interaction:

- In a **response**, the provider produces the body and the consumer reads
  it. The consumer's required properties are the checklist.
- In a **request**, the consumer produces the body and the provider reads it.
  The provider's required properties are the checklist.

The rule is applied per interaction, not per participant. One contract file
declares both `provides` and `consumes`, so the same participant is the reader
of what it consumes in responses and the reader of what it provides in
requests.

## Reading the rule

Three consequences follow directly, and the tables below are nothing more
than these three spelled out.

1. **What the reader did not declare is free.** A provider may return fields
   no consumer reads, and a consumer may send fields the provider never
   declared. Neither is checked, so neither can break.
2. **Optional on the reader's side is tolerance.** A property the reader marks
   `optional` is a property it can live without. Whatever the producer does with
   it, declare it required, declare it optional, or not declare it at all,
   there is no break.
3. **Optional on the producer's side is a risk the reader must have
   accepted.** A property the producer marks `optional` may be absent, so it
   satisfies only a reader that marked it optional too. A reader that
   requires it gets a break.

Every row in the tables assumes both sides declare the property with the same
type. When both declare it and the types differ, the broker reports a type
mismatch for that property and does not evaluate its optional/required row:

```
property "<property>" type mismatch — consumer has <type>, provider has <type>
```

A property yields at most one break. Arrays are printed with their item
type, `array<object>` or `array<array<integer>>`, read from the `[]` property
of the same schema. How a schema becomes the list of properties that are
compared is in [schemas](../contracts/spec.md#how-a-schema-becomes-a-list-of-properties).

## Responses: the consumer reads

The consumer's required properties are the checklist. The reader's declaration is
in the first column, the producer's in the second.

| Consumer (reads) | Provider (produces) | Outcome |
|---|---|---|
| required | required | compatible |
| required | optional | `property "<property>" is optional in provider but required in consumer` |
| required | not declared | `property "<property>" is missing in provider` |
| optional | required | compatible |
| optional | optional | compatible |
| optional | not declared | compatible |
| not declared | required, optional or not declared | compatible: the property is not checked |

## Requests: the provider reads

The mirror image. The provider's required properties are the checklist; the
reader is now in the first column again.

| Provider (reads) | Consumer (produces) | Outcome |
|---|---|---|
| required | required | compatible |
| required | optional | `property "<property>" is optional in consumer but required in provider` |
| required | not declared | `property "<property>" is missing in consumer` |
| optional | required | compatible |
| optional | optional | compatible |
| optional | not declared | compatible |
| not declared | required, optional or not declared | compatible: the property is not checked |

Each table has seven rows because a property has three states on each side,
required, optional or not declared, and the two sides give nine
combinations; a property nobody declares is not a property, and the three
combinations in which the reader did not declare it all end the same way, so
they share one row.

## The rule producing a report

The reports below are real output. `petstore_api` version `3.0.0` is deployed
to the `sandbox` environment, and two versions of `petstore_app` are checked
against it, one for each direction.

### A response

The provider's schema for the `200` response of `GET /pets/*`:

```yaml
Pet:
  type: object
  properties:
    petId:
      type: integer
    weight:
      type: float
    status:
      type: string
      optional: true
```

The consumer's schema for the same response. It reads `weight` as a string,
requires `status`, and reads a `photoUrl` the provider does not have:

```yaml
Pet:
  type: object
  properties:
    petId:
      type: integer
    weight:
      type: string
    status:
      type: string
    photoUrl:
      type: string
```

```
petstore_app cannot be deployed to sandbox

petstore_api (3.0.0):
  GET /pets/*
    response 200:
      - property "$.weight" type mismatch — consumer has string, provider has float
      - property "$.status" is optional in provider but required in consumer
      - property "$.photoUrl" is missing in provider
```

`$.petId` produces no line: both sides declare it, same type, both
required. `$.weight` is the type mismatch, reported instead of its
optional/required row. `$.status` and `$.photoUrl` are the second and third
rows of the response table.

### A request

The provider's schema for the request of `POST /pets`:

```yaml
NewPet:
  type: object
  properties:
    ownerId:
      type: integer
    name:
      type: string
    nickname:
      type: string
      optional: true
```

The consumer's schema for the same request. It never sends `ownerId`,
sends `name` only sometimes, and sends `nickname` only sometimes:

```yaml
NewPet:
  type: object
  properties:
    name:
      type: string
      optional: true
    nickname:
      type: string
      optional: true
```

```
petstore_app cannot be deployed to sandbox

petstore_api (3.0.0):
  POST /pets
    request:
      - property "$.ownerId" is missing in consumer
      - property "$.name" is optional in consumer but required in provider
```

`$.nickname` produces no line: the provider marked it optional, so the reader can
live without it, whatever the consumer does. The other two are the third and
second rows of the request table.

### The same checklist from the other side

Which participant asks does not change the checklist. With `petstore_app`
version `2.1.0` deployed to `sandbox`, the provider's own check meets the
same reader, the same producer and the same two lines:

```
petstore_api cannot be deployed to sandbox

petstore_app (2.1.0):
  POST /pets
    request:
      - property "$.ownerId" is missing in consumer
      - property "$.name" is optional in consumer but required in provider
```

The lines are the same because the comparison is the same; only the
counterpart named in parentheses changes. The response side works the same
way: [How the broker works](how-the-broker-works.md) shows a provider version dropping `status` and
being stopped by the consumer deployed in production.

## Optional is per property

The rule judges every property on its own, and `optional` belongs to
the property it is written on. It does not extend to the properties beneath it. A
consumer that marks a nested object optional but requires a member of it:

```yaml
Pet:
  type: object
  properties:
    petId:
      type: integer
    owner:
      ref: Owner
      optional: true

Owner:
  type: object
  properties:
    name:
      type: string
```

flattens to `$.owner` optional and `$.owner.name` required. Against a
provider that has no owner at all, `$.owner` is tolerated and
`$.owner.name` is not:

```
petstore_app cannot be deployed to sandbox

petstore_api (3.0.0):
  GET /pets/*
    response 200:
      - property "$.owner.name" is missing in provider
```

To tolerate the absence of the whole object, mark the members the reader can
live without as optional too.

## Before the rule applies

The rule compares the bodies of two declarations of the same resource. It
runs only once the broker has found the counterpart: the same provider name,
endpoint, method and, for a response, status code, at the version deployed in
the environment. When there is no counterpart, or the provider is not
deployed there, or the provider under check removed the resource, the report
carries one of the three breaks below instead, and no property is compared.

Within one interaction, the lines come out in the order the broker returned
them, which is not sorted and not stable between calls, so do not diff two
reports line by line; see the [CLI reference](../reference/cli.md) for the
layout of the whole report.

These three breaks are about what exists and what is deployed, not about schemas. They are resolved on every call, from the current deployments, and they never become part of a stored answer.

### No matching resource in provider

The consumer declares, under `consumes`, a resource that no published contract of the named provider declares: the provider never published, the provider's relevant version does not declare that endpoint, method or status, or the name under `consumes` is not a participant at all. In every case the resource has no counterpart, so there is nothing to compare and no version to report.

The whole report when `petstore_web` is checked before `petstore_api` has published anything:

```
petstore_web cannot be deployed to production

petstore_api:
  POST /pets
    request:
      - no matching resource in provider
    response 201:
      - no matching resource in provider
  GET /pets/*
    response 200:
      - no matching resource in provider
```

The counterpart line has no version in parentheses because the broker has no version to name: on the wire, `participantVersion` is `null`.

### Provider is not deployed in the environment

The provider has published the resource, but it has no deployment in the target environment. The broker looks at the provider's latest published contract to know that the resource exists, and at its deployments to know where it runs. The line lists every environment where the provider is deployed; when it is deployed nowhere, it ends after the environment name.

```
      - provider is not deployed in "production"
```

Once `petstore_api` is deployed to `staging` only, the same check prints the whole report as:

```
petstore_web cannot be deployed to production

petstore_api:
  POST /pets
    request:
      - provider is not deployed in "production" (deployed in: staging)
    response 201:
      - provider is not deployed in "production" (deployed in: staging)
  GET /pets/*
    response 200:
      - provider is not deployed in "production" (deployed in: staging)
```

The environment name in the line comes from the `--environment` you passed. The counterpart has no version in parentheses, because no version of it is deployed there.

### Resource removed but still consumed

Only a provider under check can get this one. The version being checked no longer declares a resource that an earlier version declared, and a consumer deployed in the target environment still consumes it. Removing the resource would break that consumer in that environment.

`petstore_api` version `v2` dropped `GET /pets/*` while `petstore_web` version `v1`, which consumes it, is deployed to `production`:

```
petstore_api cannot be deployed to production

petstore_web (v1):
  GET /pets/*
    response 200:
      - resource removed but still consumed
```

The removal is only a problem where a consumer is deployed. The same `petstore_api` version `v2` is deployable to an environment where no consumer of the removed resource runs.

## What is not compared

Each item below is invisible to the checker: a change in it never turns a
`can-i-deploy` red. This list exists so that nobody reads a green `can-i-deploy` as
covering them.

### Not supported yet

These are planned. Until they land, the file has no place to declare them.

- **Headers.** A provider that starts requiring one, and a consumer that
  stops sending one, both pass.
- **Query parameters.** A renamed parameter, a newly required one, or a change
  in how pagination is requested is not a break.
- **Nullability.** There is no `null` type and no way to say that a property
  may be `null`; a property that is sometimes `null` and one that never is
  look identical.

### No plan to support

- **Enum membership.** A `string` is a `string`. A provider that starts
  returning a fourth value of `status` is compatible with a consumer that
  handles three.
- **Format.** A `date-time` string, an email and free text are the same
  `string`.
- **Numeric subtyping.** `integer` and `float` are two tokens compared for
  equality, and there is no `number`. The checker does not know that every
  integer is a valid float: a consumer declaring `float` where the provider
  declares `integer` is a type mismatch, and so is the reverse. This is the
  one item on the list that the checker reports rather than ignores, but it
  reports it without understanding it.
