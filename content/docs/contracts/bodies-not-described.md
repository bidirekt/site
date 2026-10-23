---
title: Bodies not described
description: How ~ declares a body the contract does not describe, and how it compares with a counterpart.
---

`~` in place of a schema name says that the contract does not describe the body: the provider promises no structure, and the consumer reads nothing from it. A status left without a value, such as `204:`, is the same `~`, since YAML reads both as null. Write `~` for a response without a body, and for every body that is a file or a multipart form, in a request or a response:

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
| `200: ~` | `200: Pet` | break: `Pet — petstore_web reads it, but petstore_api doesn't provide it`, at the body |
| `request: ~` | `request: NewFile` | compatible |
| no `request` | `request: NewFile` | break: `petstore_web sends a request body, but petstore_api declares none` |

An empty string is not `~`: `204: ""` and `request: ""` name a schema called `""`, which no schema declares, and are rejected.
