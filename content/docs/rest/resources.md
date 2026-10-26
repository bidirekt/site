---
title: Resources
description: What identifies a REST resource, how its endpoint, request and responses are written, which statuses each side declares, and what a REST contract does not compare.
---

A `rest` block declares REST resources. A REST resource is the request of an endpoint and method, or one response of an endpoint, method and status, and each one is compared on its own. What holds for every kind of resource is in [The contract file](../contracts/the-contract-file.md#resources).

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

This declares three resources: the request of `POST /pets`, its `201` response and its `500` response. A break in the `500` does not involve the `201`.

The consumer produces a request and the provider reads it; the provider produces a response and the consumer reads it. The reader of a body decides what must be in it ([Which side decides](../contracts/the-contract-file.md#which-side-decides)).

A report names a REST resource by its method and endpoint, then `request` or `response <status>`, as in `GET /pets/* response 200` ([Resource breaks](breaks.md#in-the-report)).

## Endpoints

The endpoint is part of a resource's identity, so a consumer's endpoint matches a provider's only when both are written the same way:

- An endpoint starts with `/` and has no empty segment: `//` and `/pets//photos` are rejected at publish with `malformed path`. A `;` in a segment, as in `/pets;v=2`, is a `malformed path` too. `/` alone is the root, a valid endpoint.
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

```error title="publish error"
contract validation failed
  - petstore_api.yaml: invalid endpoint "/pets/{petId}" at provides rest, dynamic path segments must use *
```

Written as `/pets/*`, it publishes, and it matches a consumer that also writes `/pets/*`.

## Requests

`request` names the schema of the request body, as `NewPet` above. A body exists only on `post`, `put` and `patch`, so `request` is accepted on those three methods and nowhere else. A method may have a `request` and no `responses`.

## Responses

`responses` maps a status code to the schema of the response body, as `201: Pet` above. A status code is an integer from 100 to 599, quoted or not; patterns such as `2xx` are rejected.

## Which statuses to declare

Each status is its own resource, so the statuses each side lists decide what can break. A status the consumer declares must be declared by the provider, or it breaks with `petstore_web reads response 404, but petstore_api answers only 200`; a status only the provider declares obliges no consumer.

- A consumer declares a status when its code does something specific with it or reads its body. Handling that treats any error the same way does not count.
- A provider declares the statuses its code actually returns. A branch that never runs is left out.

`petstore_web` shows a "pet not found" page on a `404` without reading its body, so its `404` is `~` ([Bodies not described](#bodies-not-described)), and it shows one generic message for every other error:

```yaml
consumes:
  petstore_api:
    rest:
      /pets/*:
        get:
          responses:
            200: Pet
            404: ~
```

## Bodies not described

`~` in place of a schema name, as in `request: ~` or `200: ~`, is a body the contract does not describe ([The contract file](../contracts/the-contract-file.md#bodies-not-described) says what that means for each side). A status left without a value, such as `204:`, is the same `~`, since YAML reads both as null. Write `~` for a response without a body, and for a request or response body that is a file or a multipart form:

```yaml
provides:
  rest:
    /files:
      post:
        request: ~
        responses:
          201: File
    /files/*:
      get:
        responses:
          200: ~
    /pets/*:
      delete:
        responses:
          204:
```

The resource still exists, so a consumer that calls `DELETE /pets/*` matches it. Against a counterpart, with the consumer under check (a provider under check that drops a `request` gets the `removed` break of [Resource breaks](breaks.md#every-break)):

| Provider | Consumer | Result |
|---|---|---|
| `request: ~` | `request: NewFile` | compatible |
| no `request` | `request: NewFile` | break: `petstore_web sends a request body, but petstore_api declares none` |
| `200: ~` | `200: ~` | compatible |
| `200: Pet` | `200: ~` | compatible |
| `200: ~` | `200: Pet` | break: `Pet — petstore_web reads it, but petstore_api doesn't provide it`, at the body |

## In several files

A provider's files may split its endpoints, the methods of one endpoint and even the statuses of one method between them, as long as each resource is declared once ([Several files](../contracts/the-contract-file.md#several-files)). A request has no status, so the `request` of an endpoint and method belongs in exactly one file, even when its responses are spread over several. A provider that keeps the `201` of `POST /pets` in `pets.yaml` and its `400` in `pets_errors.yaml` writes `request: NewPet` in only one of them; writing it in both declares the request of `POST /pets` twice:

```error title="publish error"
contract validation failed
  - pets_errors.yaml: duplicate resource "provides POST /pets request", also declared in pets.yaml
```

## What is not compared

The `rest` block has no key for the items below, so a change in any of them never makes `can-i-deploy` fail, and a key written for one, such as `headers`, is rejected at publish as an unknown key. The items that hold for every kind of resource are in [The contract file](../contracts/the-contract-file.md#what-is-not-compared).

- **Headers.** A provider that starts requiring one, and a consumer that stops sending one, both pass.
- **Query parameters.** A renamed parameter, a newly required one, or a change in how pagination is requested is not a break.
