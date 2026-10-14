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

The two files have the same shape. `provides` holds what this participant serves, and `consumes` holds, under each provider's name, what it calls. `schemas` holds the bodies both sides name. The consumer declares only what it reads, so the provider is free to drop `petId`. All three keys are optional, and one file may carry both `provides` and `consumes`: a service in the middle of a chain declares both sides in the same contract.

## Resources

A resource is one body the two sides exchange: the request of an endpoint and method, or one response of an endpoint, method and status. A provider declares its resources under `provides`, in a `rest` block. A consumer writes the same `rest` block under `consumes`, one level deeper, under the name of the provider it calls.

That name is the provider's participant name, in snake_case: lowercase letters, digits and single underscores. It is not checked against existing participants at publish, so a misspelled name, such as `petstore_apl` for `petstore_api`, publishes fine and fails at `can-i-deploy` with `petstore_web calls GET /pets/*, but petstore_apl doesn't provide it`.

The value of `request` and of each status in `responses` is the name of a schema declared under `schemas`, never an inline schema, or `~` for a body the contract does not describe.

### Request

```yaml
provides:
  rest:
    /pets:
      post:
        request: NewPet
```

`request` names the schema of the request body. A body exists only on `post`, `put` and `patch`, so `request` is accepted on those three methods and nowhere else. A method needs nothing more than its `request`: the resource above is complete without any `responses`.

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

### Bodies not described

`~` in place of a schema name says that the contract does not describe the body: the provider promises no structure, and the consumer reads nothing from it. A status left without a value, such as `204:`, is the same `~`, since YAML reads both as null. It fits a response without a body, a file download and a multipart upload:

```yaml
provides:
  rest:
    /pets/*:
      delete:
        responses:
          204:
    /files/*:
      get:
        responses:
          200: ~
    /files:
      post:
        request: ~
        responses:
          201: File
```

The resource still exists, so a consumer that calls `DELETE /pets/*` matches it. Nothing inside the body is compared, and `~` does not tell a body that is empty from a body that is not described. Against a counterpart:

| Provider | Consumer | Result |
|---|---|---|
| `200: ~` | `200: ~` | compatible |
| `200: Pet` | `200: ~` | compatible |
| `200: ~` | `200: Pet` | break: `petstore_web reads the body (Pet), but petstore_api doesn't provide it` |
| `request: ~` | `request: NewFile` | compatible |
| no `request` | `request: NewFile` | break: `petstore_web calls POST /files, but petstore_api doesn't provide it` |

An empty string is not `~`: `204: ""` and `request: ""` name a schema called `""`, which no schema declares, and are rejected.

### Endpoints

The endpoint is part of a resource's identity, so a consumer's endpoint matches a provider's only when both are written the same way:

- An endpoint starts with `/` and has no empty segment. `/` alone is the root.
- A dynamic segment is `*`, one per segment, with no name: `/pets/*`, `/owners/*/pets/*`.
- `{petId}` and partial wildcards such as `p*` are rejected at publish, not rewritten. `:petId` is read as a literal segment that no request path matches, so write `*`.
- A trailing slash is removed: `/pets/` is `/pets`, and a provider that writes both has declared the same resources twice.
- The methods are `get`, `post`, `put`, `patch` and `delete`, in lowercase. Any other key under an endpoint is rejected.

An endpoint copied from an OpenAPI document keeps its named parameter and is rejected:

```yaml
provides:
  rest:
    /pets/{petId}:
      get:
        responses:
          200: Pet
```

```
contract validation failed
  - petstore_api.yaml: invalid endpoint "/pets/{petId}" at provides rest, dynamic path segments must use *
```

Written with `*`, it publishes, and it matches a consumer that also writes `/pets/*`:

```yaml
provides:
  rest:
    /pets/*:
      get:
        responses:
          200: Pet
```

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

A node's `type` is one of `object`, `array`, `string`, `integer`, `float`, `number` and `boolean`. Any node may also carry `description`, free text that the broker ignores.

Two flags, `true` or `false`, say what a value may lack, and they are independent of each other:

- `optional: true` says the key may be missing. A property is required unless it says so; there is no `required` list.
- `nullable: true` says the key is there and its value may be `null` or the declared type. It is accepted on any node: a property, `items`, `values` and the root of a schema.

```yaml
User:
  type: object
  properties:
    avatar:          # always there, may be null
      type: string
      nullable: true
    nickname:        # may be missing
      type: string
      optional: true
    bio:             # may be missing, may be null
      type: string
      optional: true
      nullable: true
```

The contract describes what the code does, not the type the code declares. The side that reads the body writes the flags from how its code reads each property, and the side that produces the body from what its code can send. In a response the provider produces and the consumer reads; in a request the consumer produces and the provider reads.

| The code | Write |
|---|---|
| reads the property with no fallback (`pet.name` in JS, `as String` in Dart) | neither `optional` nor `nullable` |
| accepts `null` but needs the key (`pet.nickname === null ? … : …`) | `nullable: true` |
| accepts a missing key but not `null` | `optional: true` |
| accepts both (`??` and `?.` in JS, `as T?` in Dart) | `optional: true` and `nullable: true` |
| produces the body and may send `null` for the property | `nullable: true` |
| produces the body and may leave the key out | `optional: true` |

When `petstore_api` gives `name` a nullable type, such as `String?`, but always fills it, its contract writes `name` without `nullable`. With `nullable: true`, `can-i-deploy` fails against every consumer that reads `name` with no fallback.

What `optional` and `nullable` mean for a break depends on which side reads the body, and that rule is in [How the broker works](../concepts/how-the-broker-works.md#can-i-deploy).

Schema names are unique across every file of a publish, and `request`, `responses` and `ref` resolve against all of them.

### Primitives

`string`, `integer`, `float`, `number` and `boolean`. Any other token is rejected at publish.

`integer` and `float` are strict: a consumer that declares `float` where the provider declares `integer` is a type mismatch. `number` reads both, for a value that JSON sends as `50` or `50.5` alike. The side that reads the body decides, so `number` is accepted on the reading side only:

| Producer | Reader | Result |
|---|---|---|
| `integer`, `float` or `number` | `number` | compatible |
| `number` | `integer` or `float` | type mismatch |
| `integer` | `float`, or the reverse | type mismatch |

In a response the provider produces and the consumer reads; in a request the consumer produces and the provider reads. Two modules of the same consumer that declare `number` and `integer` for the same property are still rejected as different types ([Several files](#several-files)).

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

`type: object` may be left out when `properties` or `values` is present.

An `object` with neither `properties` nor `values` is any object. It fits an object the code does not read inside. Here `petstore_web` passes `metadata` along as it came and only counts the `vaccinations`:

```yaml
Pet:
  type: object
  properties:
    metadata:
      type: object
    vaccinations:
      type: array
      items:
        type: object
```

On the side that reads the body, `type: object` alone accepts any object, and nothing inside it is compared. On the side that produces the body, it declares no property, so each property the reader requires directly in it breaks with `doesn't provide`, or with `doesn't send` in a request.

### Arrays

`items` is the node of every element, as in `Pets` above. An array without `items` is rejected. `type: array` may be left out when `items` is present.

### Maps

An object whose keys are not known in advance, but whose values all have the same shape, declares `values` instead of `properties`. `values` is the node of every value, and the key is always a string:

```yaml
PetsByName:
  type: object
  values:
    ref: Pet
```

describes

```json
{ "bob": { "name": "Bob" }, "sky": { "name": "Sky" } }
```

- `values` and `properties` are exclusive: a node with both is rejected with `object schema has both "values" and "properties"`.
- `values` belongs to an object only: with any other `type`, it is rejected with `"values" on a non-object schema`.

The values are compared like the items of an array: type, `optional`, `nullable` and their own members. In a break line the dynamic key is written `{}`, as in `$.pets{}.name`, and a map's type is written `map<T>`, as an array's is `array<T>`.

A map reader also accepts fixed properties. A consumer that reads `pets` with `values: {ref: Pet}` accepts a provider that declares `pets` with the properties `bob` and `sky`. Each fixed property is compared against `values`: its type, `nullable` and its own members, with a break reported at its own property, such as `$.pets.sky`. A fixed property's `optional` never breaks, because a map requires none of its keys.

Two cases still break:

- A map on the producing side promises no key. A consumer that reads `$.pets.bob` from a provider that only declares `$.pets{}` breaks with `petstore_web reads "$.pets.bob" (Owner.pets.bob), but petstore_api doesn't provide it`.
- An `object` with neither `properties` nor `values` promises nothing about the values. Against a map reader, it breaks at `$.pets{}` with `doesn't provide`, or with `doesn't send` in a request.

### References

`ref` gives a node the shape of a named schema, at any depth: as a whole schema, as a member, or as the items of an array, like `Pets` does with `Pet`. Write `ref` on its own, with at most `optional`, `nullable` and `description` beside it. `nullable` beside a `ref` makes the node nullable even when the named schema is not, as `optional` does. When a node also carries `type`, `properties`, `items` or `values`, that shape wins and the `ref` is ignored, without a violation:

```yaml
Pet:
  type: object
  properties:
    owner:
      type: string
      ref: Owner
```

Here `owner` is a `string`, and `Owner` is never read. A `ref` to a name no schema declares is rejected at publish.

A schema may point to itself, directly or through other schemas. Here each reply of a `Comment` is a `Comment`:

```yaml
Comment:
  type: object
  properties:
    text:
      type: string
    replies:
      items:
        ref: Comment
```

The loop can also pass through other schemas, such as `Post.author` pointing to `User` and `User.posts` back to `Post`. There is no depth limit, and a difference inside a recursive schema is reported once per resource.

## Several files

`bidirekt publish` takes any number of files and folders, and all the files of one publish are one contract. A folder stands for every `.yaml` and `.yml` file under it, subfolders included. The order does not matter, and the shell expands globs such as `contracts/*.yaml`. Reports name a file you passed by the path you typed, and a file found in a folder by the folder and its path inside it, such as `contracts/rest/pets.yaml`.

- **One schema namespace.** A schema declared in one file can be named from any other. The same name declared twice is a duplicate. A file that names schemas declared elsewhere is valid only when published together with that file.
- **A provider declares each resource once.** Files may split the endpoints, the methods or even the statuses of one method between them, but the same resource in two files is a duplicate. A file reached twice, such as a file passed on its own and again through its folder, is read once and is not a duplicate. A request has no status, so the `request` of an endpoint and method belongs in exactly one file, even when its responses are spread over several.
- **A consumer merges by union.** Each module of a consumer may declare the resources it reads in its own file. Fragments of the same resource merge: in a response, a property is optional only if every fragment allows it, and nullable only if every fragment accepts `null`; in a request, it is required only if every fragment sends it, and nullable if any fragment may send `null`. A property that one fragment leaves out together with its parent is not made optional: only the parent is. Two fragments that give one property different types are rejected.

A provider that keeps the `201` of `POST /pets` in one file and its `400` in another writes `request` in only one of them:

```yaml
# pets.yaml
provides:
  rest:
    /pets:
      post:
        request: NewPet
        responses:
          201: Pet
```

```yaml
# pets_errors.yaml
provides:
  rest:
    /pets:
      post:
        responses:
          400: Error
```

Writing `request: NewPet` in `pets_errors.yaml` too declares the request of `POST /pets` twice:

```
contract validation failed
  - pets_errors.yaml: duplicate resource "provides POST /pets request", also declared in pets.yaml
```

Two modules of the consumer `petstore_web` read the same `GET /pets/*`, each its own subset:

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

Published together, `petstore_web` reads `petId` and `name` as required and `photoUrl` as optional, so a provider that returns only `petId` and `name` is compatible. Remove `optional: true` from `web_card.yaml` and `photoUrl` becomes required, because one reader needs it.

## What is not compared

The grammar has no place for the items below, so a change in any of them never makes `can-i-deploy` fail.

- **Headers.** A provider that starts requiring one, and a consumer that stops sending one, both pass.
- **Query parameters.** A renamed parameter, a newly required one, or a change in how pagination is requested is not a break.
- **Enum values.** A `string` is a `string`: a provider that starts returning a fourth value of `status` is compatible with a consumer that handles three.
- **Formats.** A `date-time` string, an email and free text are the same `string`.

## File format

- Every key at every level is checked against the grammar on this page. A key the grammar does not know, such as `options`, an uppercase `GET` or a top-level `version`, is a violation. The report lists every violation in every file, and nothing is stored.
- The extension must be `.yaml` or `.yml`. The CLI refuses a file passed with anything else before contacting the broker: `unsupported contract file extension: "petstore_api.txt"`. Inside a folder, files with any other extension are skipped.
- One YAML document per file. A second document after `---` is rejected with `malformed contract file: petstore_api.yaml: multiple documents are not supported`.
- YAML anchors and aliases are rejected with `malformed contract file: petstore_api.yaml: anchors and aliases are not supported`. To reuse a shape, name it under `schemas` and point to it with `ref`.
- YAML comments are allowed. They are ignored when the file is parsed.

How the file is published, and what the broker answers, is in the [CLI reference](../reference/cli.md#publish).
