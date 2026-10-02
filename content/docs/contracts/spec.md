---
title: Specification
description: The contract file, from the resources a participant provides or consumes to the schemas of their bodies and how several files publish as one contract.
---

A contract file is a YAML document that declares the resources a participant provides, the resources it consumes, and the schemas of their bodies. Both sides of an integration write the same format. The file holds only the declaration: the participant name and the version are flags of `bidirekt publish`, never keys in the file.

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

The two files have the same shape. `provides` holds what this participant serves, and `consumes` holds, under each provider's name, what it calls. `schemas` holds the bodies both sides name. The consumer declares only what it reads, so the provider is free to drop `petId`.

## Resources

A resource is one body the two sides exchange: the request of an endpoint and method, or one response of an endpoint, method and status. A provider declares its resources under `provides`, in a `rest` block. A consumer writes the same `rest` block under `consumes`, one level deeper, under the name of the provider it calls.

That name is the provider's participant name, in snake_case: lowercase letters, digits and single underscores. It is not checked against existing participants at publish, so a misspelled name publishes fine and fails at `can-i-deploy` with `no matching resource in provider`.

Each name on the right of `request` and `responses` is a schema name declared under `schemas`, never an inline schema.

### Request

```yaml
provides:
  rest:
    /pets:
      post:
        request: NewPet
```

`request` names the schema of the request body. A body exists only on `post` and `put`, so `request` is accepted on those two methods and nowhere else. A method needs nothing more than its `request`: the resource above is complete without any `responses`.

### Response

```yaml
provides:
  rest:
    /pets/*:
      get:
        responses:
          200: Pet
```

`responses` maps a status code to the schema of the response body. A status code is an integer from 100 to 599, quoted or not; patterns such as `2xx` are rejected.

A request and its responses live together under the same method:

```yaml
provides:
  rest:
    /pets:
      post:
        request: NewPet
        responses:
          201: Pet
          500: Error
```

This declares three resources: the request of `POST /pets`, its `201` response and its `500` response. Each one is compared on its own: a break in the `500` does not involve the `201`.

### Endpoints

The endpoint is part of a resource's identity, so a consumer's endpoint matches a provider's only when both are written the same way:

- An endpoint starts with `/` and has no empty segment. `/` alone is the root.
- A dynamic segment is `*`, one per segment, with no name: `/pets/*`, `/owners/*/pets/*`.
- `{petId}` and partial wildcards such as `p*` are rejected at publish, not rewritten. `:petId` is read as a literal segment that no request path matches, so write `*`.
- A trailing slash is removed: `/pets/` is `/pets`, and a provider that writes both has declared the same resources twice.
- The methods are `get`, `post`, `put` and `delete`, in lowercase. Any other key under an endpoint is rejected.

## Schemas

```yaml
schemas:
  Pet:
    type: object
    properties:
      petId:
        type: integer
      name:
        type: string
      nickname:
        type: string
        optional: true
  Pets:
    type: array
    items:
      ref: Pet
```

A node's `type` is one of `object`, `array`, `string`, `integer`, `float` and `boolean`, and every property may carry `optional`, `true` or `false`. A property is required unless it says `optional: true`; there is no `required` list. What `optional` means for a break depends on which side reads the body, and that rule is in [How the broker works](../concepts/how-the-broker-works.md#can-i-deploy). Any node may also carry `description`, free text that the broker ignores.

Schema names are unique across every file of a publish, and `request`, `responses` and `ref` resolve against all of them.

### Primitives

`string`, `integer`, `float` and `boolean`. There is no `number`. `integer` and `float` are two distinct types compared by exact equality, so a consumer that declares `float` where the provider declares `integer` is a type mismatch. Any other token is rejected at publish.

### Objects

`properties` maps each member name to its own node, nested as deep as the body is:

```yaml
Pet:
  type: object
  properties:
    owner:
      type: object
      properties:
        name:
          type: string
```

`type: object` may be left out when `properties` is present.

### Arrays

`items` is the node of every element, as in `Pets` above. An array without `items` is rejected. `type: array` may be left out when `items` is present.

### References

`ref` gives a node the shape of a named schema, at any depth: as a whole schema, as a member, or as the items of an array, like `Pets` does with `Pet`. Write `ref` on its own, with at most `optional` and `description` beside it. When a node also carries `type`, `properties` or `items`, that shape wins and the `ref` is ignored. A `ref` to a name no schema declares is rejected at publish.

### How a schema becomes a list of properties

The broker does not compare schema trees. At publish, every schema named by a resource is flattened into a list of properties, each with a type and an optional flag, and two resources are compared property by property:

- the root of the body is `$`;
- an object member appends `.name`;
- an array element appends `[]`;
- a `ref` adds nothing, because the named schema is expanded in place.

`Pets` above flattens to:

| Property | Type | Optional |
|---|---|---|
| `$` | `array` | no |
| `$[]` | `object` | no |
| `$[].petId` | `integer` | no |
| `$[].name` | `string` | no |
| `$[].nickname` | `string` | yes |

These are the names a break line shows, and a missing object produces one line for each of its properties.

## Several files

`bidirekt publish` takes any number of files, and all the files of one publish are one contract. The order does not matter, and the shell expands globs such as `contracts/*.yaml`. Reports name each file by the path you typed.

- **One schema namespace.** A schema declared in one file can be named from any other. The same name declared twice is a duplicate. A file that names schemas declared elsewhere is valid only when published together with that file.
- **A provider declares each resource once.** Files may split the endpoints, the methods or even the statuses of one method between them, but the same resource in two files is a duplicate. So is the same file passed twice. A request has no status, so the `request` of an endpoint and method belongs in exactly one file, even when its responses are spread over several.
- **A consumer merges by union.** Each module of a consumer may declare the resources it reads in its own file. Fragments of the same resource merge: in a response, a property is optional only if every fragment allows it; in a request, it is required only if every fragment sends it. Two fragments that give one property different types are rejected.

## What is not compared

The grammar has no place for the items below, so a change in any of them never makes `can-i-deploy` fail.

- **Headers.** A provider that starts requiring one, and a consumer that stops sending one, both pass.
- **Query parameters.** A renamed parameter, a newly required one, or a change in how pagination is requested is not a break.
- **Nullability.** There is no `null` type and no way to say that a property may be `null`.
- **Enum values.** A `string` is a `string`: a provider that starts returning a fourth value of `status` is compatible with a consumer that handles three.
- **Formats.** A `date-time` string, an email and free text are the same `string`.

## File format

- Every key at every level is checked against the grammar on this page. A key the grammar does not know, such as `patch`, an uppercase `GET` or a top-level `version`, is a violation. The report lists every violation in every file, and nothing is stored.
- The extension must be `.yaml` or `.yml`. The CLI refuses anything else before contacting the broker: `unsupported contract file extension: "petstore_api.txt"`.
- One YAML document per file. A second document after `---` is rejected with `malformed contract file: petstore_api.yaml: multiple documents are not supported`.
- YAML anchors and aliases are rejected with `malformed contract file: petstore_api.yaml: anchors and aliases are not supported`. To reuse a shape, name it under `schemas` and point to it with `ref`.
- YAML comments are allowed. They are ignored when the file is parsed.

How the file is published, and what the broker answers, is in the [CLI reference](../reference/cli.md#publish).
