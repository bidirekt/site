---
title: Specification
description: The contract file, from its three top-level keys to the endpoints under rest, the schemas they name, and how several files publish as one contract.
---

A contract file is a YAML document that declares what a participant provides, what it consumes, and the schemas those declarations name. Both sides of an integration write the same format: a provider fills `provides`, a consumer fills `consumes`, and either side carries `schemas`. The file holds only the declaration. The participant name and the version are flags of `bidirekt publish`, never keys in the file.

## A complete example

A provider named `petstore_api` serves the list of pets, creates a pet, and returns one pet by id:

```yaml
provides:
  rest:
    /pets:
      get:
        responses:
          200: Pets
      post:
        request: NewPet
        responses:
          201: Pet
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
  Pets:
    type: array
    items:
      ref: Pet
  NewPet:
    type: object
    properties:
      name:
        type: string
```

Published with the CLI, it is accepted as a whole or rejected as a whole:

```
$ bidirekt publish petstore_api.yaml --participant petstore_api --version 1.4.0
📜 petstore_api contract publish successful
```

## The three top-level keys

| Key | What it holds | Who writes it |
|---|---|---|
| `provides` | The endpoints this participant serves, under `rest` | A provider |
| `consumes` | One entry per provider this participant calls, each with the endpoints it uses under `rest` | A consumer |
| `schemas` | Named shapes that `request`, `responses` and `ref` point to | Either side |

All three are optional, and a file may carry any combination. A service in the middle of a chain provides to some participants and consumes from others in the same file. Nothing outside these three keys is accepted; see [Only the grammar is accepted](#only-the-grammar-is-accepted).

## `provides`

`provides` has a single key, `rest`, and `rest` maps each endpoint to its methods, as in the example above. Each method names the schema of its request (`post` and `put` only) and the schema of each response, by status code. The rules for the endpoint key, the four methods, `request` and `responses` are in [Endpoints](#endpoints). The names on the right (`Pets`, `NewPet`, `Pet`) must exist under `schemas`, in this file or in another file of the same publish.

## `consumes`

`consumes` has one more level than `provides`: the name of the provider being consumed. Under that name comes the same `rest` block a provider writes:

```yaml
consumes:
  petstore_api:
    rest:
      /pets:
        get:
          responses:
            200: Pets
```

Two things about that name.

**It is the provider's participant name.** The broker matches a consumed endpoint to a provided one by participant name, endpoint, method and status. The name is the one the provider was created with (`bidirekt create-participant`). A misspelled name publishes without complaint, because publishing does not check that the named participant exists. It fails later, at `bidirekt can-i-deploy`, where nothing matches:

```
❌ petstore_web cannot be deployed to staging

petstore_apy:
  GET /pets
    response 200:
      - no matching resource in provider
```

**It must be snake_case.** Lowercase ASCII letters and digits, words separated by single underscores. `petstore_api` is valid; `Petstore-API`, `petstore__api` and `_api` are not. Anything else is rejected at publish:

```yaml
consumes:
  Petstore-API:
    rest:
      /pets:
        get:
          responses:
            200: Pets

schemas:
  Pets:
    type: array
    items:
      type: string
```

```
❌ contract validation failed
  - petstore_web.yaml: invalid service name "Petstore-API" at consumes;Petstore-API
      must be snake_case
```

Forgetting the extra level is a common mistake. When `rest` is written directly under `consumes`, the broker reads `rest` as a provider name and then finds an endpoint where it expects `rest`:

```
❌ contract validation failed
  - petstore_web.yaml: unknown key "/pets" at consumes;rest;/pets
```

## `schemas`

`schemas` maps a name to a schema, as in the example above. The name is any string. The schema grammar (`type`, `properties`, `items`, `ref`, `optional`, `description`) is in [Schemas](#schemas).

One publish has one schema namespace. Every name must be unique across all the files of that publish, and `ref`, `request` and `responses` resolve against all of them. See [Several files](#several-files).

## A consumer example

`petstore_web` reads the list of pets and, from each pet, only the name:

```yaml
consumes:
  petstore_api:
    rest:
      /pets:
        get:
          responses:
            200: Pets

schemas:
  Pet:
    type: object
    properties:
      name:
        type: string
  Pets:
    type: array
    items:
      ref: Pet
```

The consumer declares only what it reads. `petId` is not listed, so the provider is free to drop it. Which side must satisfy which, and what `optional` means on each side, is the subject of [The direction rule](../concepts/direction-rule.md).

## Endpoints

An endpoint is a key under `rest`, in `provides` or in `consumes`. The same rules apply on both sides, and they matter beyond syntax: the endpoint is part of a resource's identity, so a consumer's `/pets` matches a provider's `/pets` only when both are written the same way after the normalization described here. The examples in this section omit the `schemas` block that the names on the right (`Pets`, `Pet`, `NewPet`, `Error`) point to; see [Schemas](#schemas).

### 1. An endpoint starts with `/`

`/pets` and `/pets/*` are endpoints. `/` alone is valid and names the root.

```yaml
provides:
  rest:
    /:
      get:
        responses:
          200: Pets
    /pets:
      get:
        responses:
          200: Pets
```

A key without the leading slash, or with an empty segment such as `/pets//toys`, is a malformed path:

```yaml
provides:
  rest:
    pets:
      get:
        responses:
          200: Pets
    /pets//toys:
      get:
        responses:
          200: Pets
```

```
❌ contract validation failed
  - petstore_api.yaml: invalid endpoint "/pets//toys" at provides;rest;/pets//toys
      malformed path
  - petstore_api.yaml: invalid endpoint "pets" at provides;rest;pets
      malformed path
```

### 2. A dynamic segment is `*`, one per segment

A `*` stands for exactly one path segment, whatever its value. Use one per dynamic segment:

```yaml
provides:
  rest:
    /pets/*:
      get:
        responses:
          200: Pet
    /owners/*/pets/*:
      get:
        responses:
          200: Pet
```

The parameter has no name. The name is not part of the resource's identity, so `/pets/*` is the whole spelling, on both sides.

### 3. `{id}` is rejected, not rewritten

The broker does not translate other conventions into `*`. A segment written as `{petId}`, or a partial wildcard such as `p*`, is rejected at publish, and the file stays as you wrote it:

```yaml
provides:
  rest:
    /pets/{petId}:
      get:
        responses:
          200: Pet
    /pets/p*:
      get:
        responses:
          200: Pet
```

```
❌ contract validation failed
  - petstore_api.yaml: invalid endpoint "/pets/p*" at provides;rest;/pets/p*
      dynamic path segments must use *
  - petstore_api.yaml: invalid endpoint "/pets/{petId}" at provides;rest;/pets/{petId}
      dynamic path segments must use *
```

Only `*`, `{` and `}` are inspected. A segment written as `:petId` contains none of them, so it publishes as a literal segment named `:petId`, which no request path will ever match. Write `*`.

### 4. A trailing slash is removed

`/pets/` is read as `/pets`. This is the one normalization the broker applies to an endpoint, and it applies before anything else: a consumer that writes `/pets/` matches a provider that writes `/pets`, and a provider that writes both spellings has declared the same resource twice:

```yaml
provides:
  rest:
    /pets:
      get:
        responses:
          200: Pets
    /pets/:
      get:
        responses:
          200: Pets
```

```
❌ contract validation failed
  - petstore_api.yaml: duplicate resource "provides GET /pets 200", declared twice
```

`/` alone keeps its slash.

### 5. Exactly four methods, in lowercase

| Method | Keys it accepts |
|---|---|
| `get` | `responses` |
| `post` | `request`, `responses` |
| `put` | `request`, `responses` |
| `delete` | `responses` |

Any other key under an endpoint is unknown: an uppercase spelling, `patch`, `head`, `options`, or anything that is not one of the four.

```yaml
provides:
  rest:
    /pets:
      GET:
        responses:
          200: Pets
      patch:
        responses:
          200: Pet
```

```
❌ contract validation failed
  - petstore_api.yaml: unknown key "GET" at provides;rest;/pets;GET
  - petstore_api.yaml: unknown key "patch" at provides;rest;/pets;patch
```

### 6. `request` goes on `post` and `put`, and it is a schema name

`request` names the schema of the request body. It exists only where a body exists, on `post` and `put`, and its value is the name of a schema, never an inline schema:

```yaml
provides:
  rest:
    /pets:
      post:
        request: NewPet
        responses:
          201: Pet
```

A `request` under `get` is an unknown key. An inline schema is a value of the wrong kind:

```yaml
provides:
  rest:
    /pets:
      get:
        request: NewPet
        responses:
          200: Pets
      post:
        request:
          type: object
        responses:
          201: Pet
```

```
❌ contract validation failed
  - petstore_api.yaml: unknown key "request" at provides;rest;/pets;get;request
  - petstore_api.yaml: unexpected mapping at provides;rest;/pets;post;request, expected string
```

### 7. `responses` maps a status code to a schema name

Each key under `responses` is an integer from 100 to 599, quoted or not, and each value is the name of a schema. A method may declare as many statuses as it needs:

```yaml
provides:
  rest:
    /pets:
      get:
        responses:
          200: Pets
          "404": Error
      post:
        request: NewPet
        responses:
          201: Pet
          400: Error
      delete:
        responses:
          204: Error
```

A status outside the range, a pattern such as `2xx`, or an inline schema as the value is rejected. Note that an unquoted `007` is read as the number `7` before it is checked, and the report shows it that way:

```yaml
provides:
  rest:
    /pets:
      get:
        responses:
          2xx: Pets
          600: Error
          007: Error
          99: Error
      post:
        request: NewPet
        responses:
          201:
            type: object
```

```
❌ contract validation failed
  - petstore_api.yaml: invalid status code "2xx" at provides;rest;/pets;get;responses;2xx
      must be between 100 and 599
  - petstore_api.yaml: invalid status code "600" at provides;rest;/pets;get;responses;600
      must be between 100 and 599
  - petstore_api.yaml: invalid status code "7" at provides;rest;/pets;get;responses;7
      must be between 100 and 599
  - petstore_api.yaml: invalid status code "99" at provides;rest;/pets;get;responses;99
      must be between 100 and 599
  - petstore_api.yaml: unexpected mapping at provides;rest;/pets;post;responses;201, expected string
```

### What an endpoint declares

Every `responses` entry becomes one resource, identified by participant, endpoint, method and status. The `request` becomes one resource identified by participant, endpoint and method, with no status. Two consequences follow:

- Each status is compared on its own. The `200` of `GET /pets` and its `404` can name different schemas, and a break in one does not involve the other.
- A request has one identity per endpoint and method, whatever statuses sit next to it. This decides where `request` may be written when a contract is split across files; see [Several files](#several-files).

How `can-i-deploy` checks resources is in [How the broker works](../concepts/how-the-broker-works.md).

## Schemas

A schema describes the shape of a request or response body. Schemas live under the top-level `schemas` key, each under a name, and endpoints point to them by that name in `request` and `responses`. The grammar is small on purpose: a type, the properties of an object, the items of an array, a reference to another named schema, and a flag for optional properties. Everything the broker compares between two contracts comes from here.

### A schema node

```yaml
schemas:
  Pet:
    type: object
    description: A pet in the store.
    properties:
      petId:
        type: integer
      name:
        type: string
      nickname:
        type: string
        optional: true
      owner:
        ref: Owner
      tags:
        type: array
        items:
          type: string
  Owner:
    type: object
    properties:
      name:
        type: string
  Pets:
    type: array
    items:
      ref: Pet
```

Every node, at any depth, accepts the same six keys and nothing else:

| Key | Value | Meaning |
|---|---|---|
| `type` | one of the six types | What the value is |
| `properties` | map of name to schema node | The members of an object |
| `items` | a schema node | The element of an array |
| `ref` | a schema name | This node has the shape of that named schema |
| `optional` | `true` or `false` | The property may be absent; default `false` |
| `description` | free text | Documentation only; the broker ignores it |

### The six types

`object`, `array`, `string`, `integer`, `float`, `boolean`.

There is no `number`. `integer` and `float` are two distinct types, compared by exact equality: a consumer that declares `integer` where the provider declares `float` is a type mismatch. Any other token is rejected at publish:

```yaml
schemas:
  Pet:
    type: object
    properties:
      weight:
        type: number
```

```
❌ contract validation failed
  - petstore_api.yaml: invalid value "number" for "type" at schemas;Pet;properties;weight;type
      expected one of: object, array, string, integer, float, boolean
```

`type` can be left out when the node has `properties` (then it is an object) or `items` (then it is an array). A node with none of `type`, `properties`, `items` or `ref` is rejected:

```yaml
schemas:
  Pet: {}
```

```
❌ contract validation failed
  - petstore_api.yaml: missing "type" at schemas;Pet
      expected one of: object, array, string, integer, float, boolean
```

### Objects: `properties`

`properties` maps each member name to its own schema node. Members nest without limit other than the depth budget below.

```yaml
schemas:
  Pet:
    type: object
    properties:
      petId:
        type: integer
      owner:
        type: object
        properties:
          name:
            type: string
```

Every member listed is required unless it carries `optional: true`. There is no `required` list; `optional` is written on the property itself.

### Arrays: `items`

`items` is the schema node of every element. An array without `items` is rejected:

```yaml
schemas:
  Pets:
    type: array
```

```
❌ contract validation failed
  - petstore_api.yaml: array schema without items at schemas;Pets
```

### References: `ref`

`ref` gives a node the shape of a named schema. It works at any depth: as a whole schema, inside `properties`, inside `items`, and inside a schema that is itself reached through a `ref`.

```yaml
schemas:
  Pet:
    type: object
    properties:
      owner:
        ref: Owner
  Owner:
    type: object
    properties:
      name:
        type: string
  Pets:
    type: array
    items:
      ref: Pet
```

The name must be declared under `schemas` in the same publish, in this file or in another one. A `ref` to a missing name is reported once, where it is written. The place is named as `Schema.property`, or `Schema[]` for the items of an array:

```yaml
schemas:
  Pet:
    type: object
    properties:
      owner:
        ref: Owner
  Toys:
    type: array
    items:
      ref: Toy
```

```
❌ contract validation failed
  - petstore_api.yaml: unresolved ref "Owner" in Pet.owner
  - petstore_api.yaml: unresolved ref "Toy" in Toys[]
```

The same applies to the names written in `request` and `responses`; a name that no schema declares is rejected with `unresolved schema "Petz" referenced by provides GET /pets 200`.

Write `ref` on its own, with at most `optional` and `description` beside it. When a node carries `type`, `properties` or `items`, that shape wins and the `ref` is ignored without a violation.

### Optional properties: `optional`

`optional: true` marks a property that may be absent. Everything is required by default. The value must be a boolean; a string such as `"yes"` is a value of the wrong kind:

```yaml
schemas:
  Pet:
    type: object
    properties:
      name:
        type: string
        optional: "yes"
```

```
❌ contract validation failed
  - petstore_api.yaml: unexpected string at schemas;Pet;properties;name;optional, expected boolean
```

`optional` on a property whose node is a `ref` marks that property optional, like on any other node. What `optional` means for the comparison depends on who reads and who writes: in a response the consumer reads, in a request the provider reads. The tables are in [The direction rule](../concepts/direction-rule.md).

### How a schema becomes a list of properties

The broker does not compare schema trees. When a contract is published, every schema named by a `request` or a `responses` entry is flattened into a list of properties, one per node, and each property carries a type and an optional flag. The comparison is property by property, and the properties are what break reports show, written from the root of the body:

- The root of the body is `$`.
- An object member appends `.name`.
- An array element appends `[]`.
- A `ref` adds nothing: the referenced schema is expanded in place.

Flattening the `Pet` and `Pets` schemas of [A schema node](#a-schema-node) gives:

| Property | Type | Optional |
|---|---|---|
| `$` | `object` | no |
| `$.petId` | `integer` | no |
| `$.name` | `string` | no |
| `$.nickname` | `string` | yes |
| `$.owner` | `object` | no |
| `$.owner.name` | `string` | no |
| `$.tags` | `array` | no |
| `$.tags[]` | `string` | no |

and, for `Pets`, an array whose items are `Pet`:

| Property | Type | Optional |
|---|---|---|
| `$` | `array` | no |
| `$[]` | `object` | no |
| `$[].petId` | `integer` | no |
| `$[].name` | `string` | no |
| `$[].nickname` | `string` | yes |
| `$[].owner` | `object` | no |
| `$[].owner.name` | `string` | no |
| `$[].tags` | `array` | no |
| `$[].tags[]` | `string` | no |

This is why one missing object shows up as several lines: a consumer that reads `owner.name` from `GET /pets/*`, and `photoUrl` from each item of `GET /pets`, against a provider that has neither, gets one break per property:

```
❌ petstore_mobile cannot be deployed to staging

petstore_api (1.6.0):
  GET /pets
    response 200:
      - property "$[].photoUrl" is missing in provider
  GET /pets/*
    response 200:
      - property "$.owner.name" is missing in provider
      - property "$.owner" is missing in provider
```

### The depth limit

A schema may be at most 10 levels deep. The named schema is level 1, and every step down consumes a level: each `properties` entry, each `items`, and each `ref`. A `ref` costs one level for the node that carries it and the schema it points to starts the next one, so following a reference is one level more expensive than writing the same shape inline.

| Node | Level |
|---|---|
| `Pets` (array) | 1 |
| `items: ref: Pet` | 2 |
| `Pet` (object) | 3 |
| `owner: ref: Owner` | 4 |
| `Owner` (object) | 5 |
| `name` (string) | 6 |

The check runs from every named schema, including the ones only reached through `ref`. A schema that fits on its own can be too deep when another schema reaches it: a `Pet` with a chain of nine nested properties under it passes by itself, and fails as soon as `Pets` wraps it in `items: ref: Pet`, because that adds two levels.

A cycle is not detected as a cycle. Following the references never ends, so the budget runs out and every schema on the loop, plus every schema that reaches the loop, is reported as too deep:

```yaml
schemas:
  Pet:
    type: object
    properties:
      name:
        type: string
      owner:
        ref: Owner
  Owner:
    type: object
    properties:
      name:
        type: string
      favorite:
        ref: Pet
  Pets:
    type: array
    items:
      ref: Pet
```

```
❌ contract validation failed
  - petstore_api.yaml: schema "Owner" is deeper than 10 levels
  - petstore_api.yaml: schema "Pet" is deeper than 10 levels
  - petstore_api.yaml: schema "Pets" is deeper than 10 levels
```

To describe a recursive shape, cut the loop: declare the nested level with only the members that are actually read, and stop there.

## Several files

A contract does not have to be one file. `bidirekt publish` takes any number of files, and the broker reads them as fragments of a single contract for one participant and one version. Splitting is useful when a provider has many endpoints, when the schemas are shared by several endpoint files, or when each module of a consumer declares only what it reads. This section is the six rules that govern how fragments combine.

### 1. N files, one contract

Every file passed to one `bidirekt publish` call becomes part of the same contract. The CLI does not expand patterns; the shell does, so `contracts/*.yaml` works wherever a glob works:

```
$ bidirekt publish contracts/*.yaml --participant petstore_api --version 2.1.0
📜 petstore_api contract publish successful
```

A provider split into an endpoints file and a schemas file:

```yaml
# contracts/pets.yaml
provides:
  rest:
    /pets:
      get:
        responses:
          200: Pets
      post:
        request: NewPet
        responses:
          201: Pet
```

```yaml
# contracts/schemas.yaml
schemas:
  Pet:
    type: object
    properties:
      petId:
        type: integer
      name:
        type: string
  Pets:
    type: array
    items:
      ref: Pet
  NewPet:
    type: object
    properties:
      name:
        type: string
  Error:
    type: object
    properties:
      message:
        type: string
```

The order of the files does not matter: the same set published in another order is the same contract. Reports name each file by the path you typed, so `contracts/pets.yaml` is what a violation quotes.

### 2. One schema namespace

All the `schemas` blocks of a publish form one namespace. A `ref`, a `request` or a `responses` entry in one file resolves against the schemas of every file, which is what lets `pets.yaml` above name `Pets` without declaring it. Two consequences:

A name declared twice is a duplicate, whichever files it is in:

```yaml
# schemas_again.yaml, published together with contracts/schemas.yaml
schemas:
  Pet:
    type: object
    properties:
      petId:
        type: integer
```

```
❌ contract validation failed
  - schemas_again.yaml: duplicate schema "Pet", also declared in contracts/schemas.yaml
```

And a file that names schemas is only valid together with the file that declares them. `contracts/pets.yaml` published alone is rejected:

```
❌ contract validation failed
  - contracts/pets.yaml: unresolved schema "Pets" referenced by provides GET /pets 200
  - contracts/pets.yaml: unresolved schema "NewPet" referenced by provides POST /pets request
  - contracts/pets.yaml: unresolved schema "Pet" referenced by provides POST /pets 201
```

### 3. Provider fragments must not overlap

A provider declares each resource exactly once. A resource is an endpoint, a method and a status (or the request of an endpoint and method), so two files may split the endpoints, the methods, or even the statuses of one method between them, but the same status of the same method of the same endpoint in two files is a collision:

```yaml
# pets_again.yaml, published together with contracts/pets.yaml
provides:
  rest:
    /pets:
      get:
        responses:
          200: Pets
```

```
❌ contract validation failed
  - pets_again.yaml: duplicate resource "provides GET /pets 200", also declared in contracts/pets.yaml
```

Trailing slashes are removed before this check, so `/pets/` in one file collides with `/pets` in another; see [A trailing slash is removed](#4-a-trailing-slash-is-removed).

### 4. Consumer fragments merge by union

A consumer may declare the same resource in several files, because each module of the consumer reads its own subset. The declarations are merged into one resource whose properties are the union of all of them, and the merge follows [The direction rule](../concepts/direction-rule.md):

- **In a response, a property is optional only if every fragment that mentions it allows it.** The consumer reads the response; if one module needs the field, the provider must send it.
- **In a request, a property is required only if every fragment sends it.** The consumer writes the request; if one module does not send the field, the provider must accept its absence.

Two modules of `petstore_web` reading `GET /pets/*`:

```yaml
# web_list.yaml
consumes:
  petstore_api:
    rest:
      /pets/*:
        get:
          responses:
            200: PetRow
schemas:
  PetRow:
    type: object
    properties:
      petId:
        type: integer
      name:
        type: string
```

```yaml
# web_card.yaml
consumes:
  petstore_api:
    rest:
      /pets/*:
        get:
          responses:
            200: PetCard
schemas:
  PetCard:
    type: object
    properties:
      petId:
        type: integer
      photoUrl:
        type: string
        optional: true
```

Published together, the consumer needs `petId` and `name`, and tolerates a missing `photoUrl`; against a provider that returns only `petId` and `name` it is deployable. Remove `optional: true` from `photoUrl` in `web_card.yaml` and the union now requires it, because one reader does:

```
❌ petstore_web cannot be deployed to staging

petstore_api (1.6.0):
  GET /pets/*
    response 200:
      - property "$.photoUrl" is missing in provider
```

The request side works the other way round. One module sends `POST /pets` with only `name`, another sends `name` and `tag`; the union sends `tag` optionally, and a provider that requires `tag` rejects the consumer:

```
❌ petstore_web cannot be deployed to staging

petstore_api (1.6.0):
  POST /pets
    request:
      - property "$.tag" is optional in consumer but required in provider
```

The union merges presence, never types. Two fragments that give one property different types are a conflict:

```
❌ contract validation failed
  - web_list.yaml: conflicting type for property "$.petId" of consumes petstore_api GET /pets/* 200: integer here, string in web_conflict.yaml
```

### 5. The same file twice collides with itself

Fragments are identified by the path you typed. Passing a file twice, by hand or through two globs that overlap, makes it two fragments with the same content, and for a provider every resource in it is now declared twice:

```
$ bidirekt publish contracts/pets.yaml contracts/pets.yaml contracts/schemas.yaml --participant petstore_api --version 2.1.1
❌ contract validation failed
  - contracts/pets.yaml: duplicate resource "provides GET /pets 200", declared twice
  - contracts/pets.yaml: duplicate resource "provides POST /pets request", declared twice
  - contracts/pets.yaml: duplicate resource "provides POST /pets 201", declared twice
```

### 6. `request` lives in one fragment per endpoint and method

A request resource has no status ([What an endpoint declares](#what-an-endpoint-declares)). So while a provider may put the `201` of `POST /pets` in one file and its `400` in another, the `request` of `POST /pets` is a single resource, and writing it next to both statuses declares it twice:

```yaml
# pets_post_400.yaml, published together with contracts/pets.yaml
provides:
  rest:
    /pets:
      post:
        request: NewPet
        responses:
          400: Error
```

```
❌ contract validation failed
  - pets_post_400.yaml: duplicate resource "provides POST /pets request", also declared in contracts/pets.yaml
```

The fix is to keep `request` in exactly one of the fragments and let the other declare only its `responses`:

```yaml
# pets_post_400.yaml
provides:
  rest:
    /pets:
      post:
        responses:
          400: Error
```

For a consumer the same identity applies, but with rule 4 instead of a collision: several fragments may each write the `request` of `POST /pets`, and they merge by union.

## Only the grammar is accepted

Every key at every level is checked against the grammar. A key the grammar does not know is a violation, and the whole publish is rejected: a method outside the four, a block the grammar has no place for, or anything that looks like metadata, such as a version key:

```yaml
version: 1
provides:
  message:
    greeting: hello
  rest:
    /pets:
      get:
        responses:
          200: Pets
      patch:
        responses:
          200: Pet
```

```
❌ contract validation failed
  - petstore_api.yaml: unknown key "message" at provides;message
  - petstore_api.yaml: unknown key "patch" at provides;rest;/pets;patch
  - petstore_api.yaml: unknown key "version" at version
```

The report lists every violation in the file, keys in alphabetical order at each level, and nothing is stored. A value of the wrong kind is reported the same way, for example a mapping where a schema name is expected:

```
  - petstore_api.yaml: unexpected mapping at provides;rest;/pets;post;request, expected string
```

## File format

- The extension must be `.yaml` or `.yml`. The CLI refuses anything else before contacting the broker: `❌ unsupported contract file extension: "petstore_api.txt"`.
- One YAML document per file. A second document after `---` is rejected with `malformed contract file: petstore_api.yaml: multiple documents are not supported`.
- YAML anchors and aliases are rejected with `malformed contract file: petstore_api.yaml: anchors and aliases are not supported`. To reuse a shape, name it under `schemas` and point to it with `ref`.
- YAML comments are allowed. They are ignored when the file is parsed.

How the file is published, and what the broker answers, is in the [CLI reference](../reference/cli.md#publish).
