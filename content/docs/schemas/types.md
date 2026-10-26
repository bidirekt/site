---
title: Types
description: The type of every schema node, the keys each type takes, and how integer, float and number compare.
---

A schema is a tree of nodes: the schema itself, each property of an `object`, and the `items` of an `array` or the `values` of a `map`, as in `Pet` and `Pets`:

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

## Types and their keys

A node's `type` is `object`, `array`, `map` or one of the primitives `string`, `integer`, `float`, `number` and `boolean`; any other value is rejected at publish. Every node declares `type`, except a node that is a `ref` ([References](references.md)). A node with neither is rejected at publish, even when its `items` or `properties` already show what it is:

```yaml
Pet:
  type: object
  properties:
    tags:
      items:
        type: string
```

```error title="publish error"
contract validation failed
  - petstore_api.yaml: missing "type" at schemas Pet properties tags, expected one of: object, array, map, string, integer, float, number, boolean
```

Each type takes only its own keys:

| `type` | Required key | Keys rejected beside it |
|---|---|---|
| `object` | `properties`, at least one | `items`, `values` |
| `array` | `items` | `properties`, `values` |
| `map` | `values` | `properties`, `items` |
| `string`, `integer`, `float`, `number`, `boolean` | none | `properties`, `items`, `values` |
| none, with `ref` | none | `type`, `properties`, `items`, `values` |

A key on the wrong type is rejected at publish, and the line names the type it belongs to:

```yaml
Pet:
  type: object
  properties:
    tags:
      type: string
      items:
        type: string
```

```error title="publish error"
contract validation failed
  - petstore_api.yaml: "items" is not allowed on a string schema at schemas Pet properties tags, use it with "type: array"
```

Any node may also carry `description`, free text that the broker ignores ([What is not compared](../contracts/the-contract-file.md#what-is-not-compared)).

## Primitives

`integer` and `float` are strict: a consumer that declares `float` where the provider declares `integer` is a type mismatch. `number` is for a value that JSON sends as `50` or `50.5` alike, on either side. A reader writes it when its code accepts both. A producer writes it when its value can be a round float: PHP's `json_encode` sends the float `50.0` as `50`, so that value is `number`, not `float` or `integer`. A `number` reader accepts all three, and a `number` producer breaks a strict reader. The producer and the reader of a body are in [Which side decides](../contracts/the-contract-file.md#which-side-decides):

| Producer | Reader | Result |
|---|---|---|
| `integer`, `float` or `number` | `number` | compatible |
| `number` | `integer` or `float` | type mismatch |
| `integer` | `float`, or the reverse | type mismatch |

Two modules of the same consumer that declare `number` and `integer` for the same property are still rejected as different types ([Several files](../contracts/the-contract-file.md#several-files)).
