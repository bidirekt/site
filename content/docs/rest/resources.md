---
title: Resources
description: What identifies a REST resource, which side produces its body, and how a report names it.
---

A `rest` block declares REST resources. A REST resource is the request of an endpoint and method, or one response of an endpoint, method and status. What holds for every kind of resource is in [Resources](../contracts/resources.md).

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

The consumer produces a request and the provider reads it. The provider produces a response and the consumer reads it. The side that reads a body decides what must be in it ([Which side decides](../contracts/which-side-decides.md)).

A report names a REST resource by its method and endpoint, then `request` or `response <status>`, as in `GET /pets/* response 200`. [Resource breaks](breaks.md) shows every break of a REST resource.
