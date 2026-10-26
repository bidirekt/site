---
title: Responses
description: How responses maps a status code to a schema, a response without a described body, and which statuses each side declares.
---

```yaml
provides:
  rest:
    /pets/*:
      get:
        responses:
          200: Pet
```

`responses` maps a status code to the schema of the response body. A status code is an integer from 100 to 599, quoted or not; patterns such as `2xx` are rejected.

## Bodies not described

`~` in place of a schema name is a response whose body the contract does not describe ([Bodies not described](../contracts/resources.md#bodies-not-described)). A status left without a value, such as `204:`, is the same `~`, since YAML reads both as null. Write `~` for a response without a body, and for a body that is a file or a multipart form:

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
```

The resource still exists, so a consumer that calls `DELETE /pets/*` matches it. Against a counterpart:

| Provider | Consumer | Result |
|---|---|---|
| `200: ~` | `200: ~` | compatible |
| `200: Pet` | `200: ~` | compatible |
| `200: ~` | `200: Pet` | break: `Pet — petstore_web reads it, but petstore_api doesn't provide it`, at the body |

`204: ""` is not `~`: it names a schema called `""`, which no schema declares, and is rejected.

## Which statuses to declare

Each status is its own [resource](resources.md), so the statuses each side lists decide what can break. A status the consumer declares must be declared by the provider, or it breaks with `petstore_web reads response 404, but petstore_api answers only 200`; a status only the provider declares obliges no consumer.

- A consumer declares a status when its code does something specific with it or reads its body. Handling that treats any error the same way does not count.
- A provider declares the statuses its code actually returns. A branch that never runs is left out.

`petstore_web` shows a "pet not found" page on a `404` without reading its body, and shows one generic message for every other error:

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
