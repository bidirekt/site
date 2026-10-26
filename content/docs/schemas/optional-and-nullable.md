---
title: Optional and nullable
description: What the optional and nullable flags say about a value, and where each one is accepted.
---

Two flags, `true` or `false`, say what a value may lack, and they are independent of each other:

- `optional: true` says the key may be missing. It is accepted only on a property, with or without a `ref` beside it. A property is required unless it says so; there is no `required` list.
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

`optional` on a named schema, on array items or on map values is rejected at publish, `optional: false` too. A named schema is not optional by itself: the property that uses it is, with `optional: true` beside its `ref`:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: "optional" is not allowed on a schema at schemas Pet, mark optional the property that uses it, beside its "ref"
```

In the same way, when an array or a map may be missing, the property that holds it is optional, and an element or a value that may be `null` takes `nullable: true` on `items` or `values`; [Arrays](arrays-and-maps.md#arrays) and [Maps](arrays-and-maps.md#maps) show their error lines.

How each side writes the flags from what its code does is in [Describe what the code does](../contracts/the-contract-file.md#describe-what-the-code-does), and what they mean for a break is in [Which side decides](../contracts/the-contract-file.md#which-side-decides).
