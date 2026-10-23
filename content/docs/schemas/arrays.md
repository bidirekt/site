---
title: Arrays
description: How items describes every element of an array.
---

`items` is the node of every element, as in `Pets` in [Primitives](primitives.md). An array without `items` is rejected.

An array of strings:

```yaml
Pet:
  type: object
  properties:
    tags:
      type: array
      items:
        type: string
```

describes

```json
{ "tags": ["friendly", "small"] }
```

An array of objects, through a named schema:

```yaml
Pets:
  type: array
  items:
    ref: Pet
```

describes

```json
[{ "name": "Bob" }, { "name": "Sky" }]
```

`items` does not accept `optional`. When the array may be missing, the property that holds it is optional; when an element may be `null`, `items` is `nullable: true`:

```yaml
Pet:
  type: object
  properties:
    tags:
      type: array
      optional: true
      items:
        type: string
        nullable: true
```

describes both

```json
{ "tags": ["friendly", null] }
```

```json
{}
```

`optional` on `items` is rejected:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: "optional" is not allowed on array items at schemas Pet properties tags items, mark the property that holds the array optional, or use "nullable: true" for an item that may be null
```
