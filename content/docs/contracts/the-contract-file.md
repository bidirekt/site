---
title: The contract file
description: The rules every contract file follows, for every kind of resource: its keys and resources, which side decides what a body must hold, how to describe what the code does, several files, what is not compared and the file rules.
---

A contract file is a YAML document with three keys: `provides` declares the resources a participant provides, `consumes` the resources it consumes, and `schemas` the schemas of their bodies. Both sides of an integration write the same format. The file holds only the declaration: the participant name and the version are flags of [`bidirekt publish`](../ship/publish.md), never keys in the file.

## Example

The provider `petstore_api` serves one pet by id:

```yaml
provides:
  rest:
    /pets/*:
      get:
        responses:
          200: Pet

schemas:
  Pet:
    type: object
    properties:
      petId:
        type: integer
      name:
        type: string
```

The consumer `petstore_web` reads that pet, and from it only the name:

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
```

The two files have the same shape. All three keys are optional, and one file may carry both `provides` and `consumes`: a service in the middle of a chain declares both sides in the same contract.

## Resources

A resource is one body the two sides exchange, and what identifies it depends on its kind. Under `provides`, resources sit in a block named after their kind. Under `consumes`, the same block sits one level deeper, under the name of the provider they are consumed from. `rest` is the only kind today ([REST: Resources](../rest/resources.md)).

The name under `consumes` is the provider's [participant name](../concepts/how-the-broker-works.md#participant). It is not checked against existing participants at publish, so a misspelled name publishes fine and fails at `can-i-deploy` ([Resource breaks](../rest/breaks.md#every-break)).

Every body a resource declares names a schema declared under `schemas`, never an inline schema, or is `~`.

## Bodies not described

`~` in place of a schema name says that the contract does not describe the body. On the side that produces the body it promises no structure, and on the side that reads it it reads nothing from it. The resource still exists. Nothing inside the body is compared, and `~` does not tell a body that is empty from a body that is not described. An empty string is not `~`: it names a schema called `""`, which no schema declares, and is rejected.

How REST writes it, and for which bodies, is in [REST: Bodies not described](../rest/resources.md#bodies-not-described).

## Which side decides

Every comparison follows one rule: the side that reads a body decides what must be in it. Each body has a producer and a reader, and which side is which depends on the resource: in REST, the provider produces a response and the consumer produces a request ([REST: Resources](../rest/resources.md)).

A property the reader requires must be declared by the producer, required too and with a type the reader accepts: the same type, or `integer`, `float` or `number` when the reader declares `number` ([Primitives](../schemas/types.md#primitives)). A property the reader marks optional may be absent, but if both sides declare it the reader must accept its type. A property the producer marks nullable must be nullable for the reader too. A property the reader does not declare is not checked: in the example, `petstore_web` does not declare `petId`, so `petstore_api` is free to drop it.

A property is required only where its parent is present. When the producer does not declare a parent, only the parent can break, and only if it is required; nothing inside it is checked, and its members, array items and map values are never reported on their own. The body itself has no parent, so it is always compared.

## Describe what the code does

The contract describes what the code does, not the type the code declares. The side that reads a body writes [`optional` and `nullable`](../schemas/optional-and-nullable.md) from how its code reads each property, and the side that produces it from what its code can send.

The side that reads the body asks one question for each property: if this value comes `null` or is missing, does the code keep working?

- It keeps working with `null`: `nullable: true`.
- It keeps working without the key: `optional: true`.
- It breaks: neither.

The side that produces the body writes `nullable: true` when its code may send `null` for the property, and `optional: true` when it may leave the key out.

A provider that reads a body marks a property by what it accepts without answering an error. When `petstore_api` answers `400` to a `POST /pets` without `name`, `name` is required, even if the code that parses the body lets it be missing.

When `petstore_api` gives `name` a nullable type, such as `String?`, but always fills it, its contract writes `name` without `nullable`. With `nullable: true`, `can-i-deploy` fails against every consumer that reads `name` with no fallback.

## Several files

All the files of one [publish](../ship/publish.md) are one contract:

- **One schema namespace.** A file can name a schema declared in another file of the same publish; published alone, a file that does fails with `unresolved schema`, or `unresolved ref` when a `ref` names it. A name declared twice is a duplicate.
- **A provider declares each resource once**, in any of its files ([REST: In several files](../rest/resources.md#in-several-files)).
- **A consumer merges by union** the fragments of one resource, such as one file per module. In a body it reads, a property is optional only if every fragment that declares it marks it optional, and nullable only if every fragment that declares it accepts `null`. In a body it produces, a property is required only if every fragment that declares its parent sends it, and nullable if any fragment may send `null`; a fragment that leaves out the parent too makes only the parent optional. Two types for one property, even `number` and `integer`, are rejected at publish.

If two files of `petstore_web` read the same response, `web_list.yaml` its `petId` and `name` and `web_card.yaml` its `petId` and an optional `photoUrl`, the merge requires `petId` and `name`, so a provider that returns only those is compatible. Without `optional: true` in `web_card.yaml`, `photoUrl` becomes required, since `web_list.yaml` does not declare it.

## What is not compared

The grammar has no key for enum values or string formats, so `enum` and `format` are rejected at publish as unknown keys:

```yaml
Pet:
  type: object
  properties:
    status:
      type: string
      enum: [available, adopted]
    birthDate:
      type: string
      format: date
```

```error title="publish error"
contract validation failed
  - petstore_api.yaml: unknown key "format" at schemas Pet properties birthDate
  - petstore_api.yaml: unknown key "enum" at schemas Pet properties status
```

A `string` is a `string`: a provider that starts returning a fourth value of `status` is compatible with a consumer that handles three, and a `date-time`, an email and free text are the same `string`.

A change in any of the items below never makes `can-i-deploy` fail:

- **`description`.** Free text on any node, which the broker ignores.
- **A schema that no resource or `ref` names.** It is accepted and never compared, so a file with only `schemas` publishes too.
- **A property the reader does not declare.** It is not checked ([Which side decides](#which-side-decides)).
- **Headers and query parameters**, which a `rest` block has no place for ([REST: What is not compared](../rest/resources.md#what-is-not-compared)).

## File rules

- Every key at every level is checked against the grammar of this page, [REST](../rest/resources.md) and [Schemas](../schemas/types.md). A key the grammar does not know, such as `options`, an uppercase `GET`, a top-level `version` or `enum`, is a violation. The report lists the violations of every file, and nothing is stored. The checks between files, such as a name declared twice, run once every file has the right shape ([publish](../ship/publish.md)).
- The extension must be `.yaml` or `.yml`. The CLI refuses a file passed with anything else before contacting the broker: `unsupported contract file extension: "petstore_api.txt"`. Inside a folder, such a file is skipped ([publish](../ship/publish.md)).
- One YAML document per file. A second document after `---` is rejected with `cannot post contract to broker: malformed contract file: petstore_api.yaml: multiple documents are not supported`.
- YAML anchors and aliases are rejected with `cannot post contract to broker: malformed contract file: petstore_api.yaml: anchors and aliases are not supported`. To reuse a shape, name it under `schemas` and point to it with [`ref`](../schemas/references.md).
- YAML comments are allowed. They are ignored when the file is parsed.

How the file is published, and what the broker answers, is in [`publish`](../ship/publish.md). [`validate`](../ship/validate.md) prints the same errors, with `cannot validate contract on broker:` in place of `cannot post contract to broker:`.
