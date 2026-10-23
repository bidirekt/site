---
title: Endpoints
description: How an endpoint is written so that a consumer's endpoint matches a provider's.
---

The endpoint is part of a resource's identity, so a consumer's endpoint matches a provider's only when both are written the same way:

- An endpoint starts with `/` and has no empty segment: `//` and `/pets//photos` are rejected at publish with `malformed path`. `/` alone is the root, a valid endpoint.
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

Written with `*`, it publishes, and it matches a consumer that also writes `/pets/*`:

```yaml
provides:
  rest:
    /pets/*:
      get:
        responses:
          200: Pet
```
