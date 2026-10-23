---
title: Responses
description: How responses maps a status code to a schema, and which statuses each side declares.
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

## Which statuses to declare

Each status is its own resource, so the statuses each side lists decide what can break. A status the consumer declares must be declared by the provider, or it breaks with `petstore_web reads response 404, but petstore_api answers only 200`; a status only the provider declares obliges no consumer.

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
