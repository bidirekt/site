---
title: Requests
description: How request names the schema of a request body, on which methods it is accepted, and how it is split across files.
---

```yaml
provides:
  rest:
    /pets:
      post:
        request: NewPet
```

`request` names the schema of the request body. A body exists only on `post`, `put` and `patch`, so `request` is accepted on those three methods and nowhere else. A method needs nothing more than its `request`: the resource above is complete without any `responses`.

## Bodies not described

`request: ~` is a request whose body the contract does not describe ([Bodies not described](../contracts/resources.md#bodies-not-described)). Write it for a body that is a file or a multipart form:

```yaml
provides:
  rest:
    /files:
      post:
        request: ~
        responses:
          201: File
```

Against a counterpart:

| Provider | Consumer | Result |
|---|---|---|
| `request: ~` | `request: NewFile` | compatible |
| no `request` | `request: NewFile` | break: `petstore_web sends a request body, but petstore_api declares none` |

## In several files

A provider declares each resource once ([Several files](../contracts/several-files.md)). A request has no status, so the `request` of an endpoint and method belongs in exactly one file, even when its responses are spread over several. A provider that keeps the `201` of `POST /pets` in one file and its `400` in another writes `request` in only one of them:

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

```error title="publish error"
contract validation failed
  - pets_errors.yaml: duplicate resource "provides POST /pets request", also declared in pets.yaml
```
