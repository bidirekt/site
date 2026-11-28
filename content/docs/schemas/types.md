---
title: Types
description: The type of every schema node, the custom scalar of GraphQL included, the keys each type takes, and how integer, float and number compare.
---

A schema is a tree of nodes: the schema itself, each property of an `object`, the `items` of an `array` or the `values` of a `map`, and each member of a `union`, as in `Pet` and `Pets`:

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

A node's `type` is `object`, `array`, `map`, `enum`, `union`, `scalar` or one of the primitives `string`, `integer`, `float`, `number` and `boolean`; any other value is rejected at publish. `scalar` is a custom scalar of GraphQL, accepted only in a schema that no REST resource reaches ([GraphQL: Scalars](../graphql/resources.md#scalars)). Every node declares `type`, except a node that is a `ref` ([References](references.md)). A node with neither is rejected at publish, even when its `items` or `properties` already show what it is:

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
  - petstore_api.yaml: missing "type" at schemas Pet properties tags, expected one of: object, array, map, string, integer, float, number, boolean, enum, union, scalar
```

Each type takes only its own keys:

| `type` | Required key | Keys rejected beside it |
|---|---|---|
| `object` | `properties`, at least one | `items`, `values`, `members` |
| `array` | `items` | `properties`, `values`, `members` |
| `map` | `values` | `properties`, `items`, `members` |
| `enum` | `members`, a list of values | `properties`, `items`, `values` |
| `union` | `members`, a map of `ref`s | `properties` outside GraphQL, `items`, `values` |
| `scalar` | `name`, the scalar's GraphQL name | `properties`, `items`, `values`, `members` |
| `string`, `integer`, `float`, `number`, `boolean` | none | `properties`, `items`, `values`, `members` |
| none, with `ref` | none | `type`, `properties`, `items`, `values`, `members`, `name` |

A union with `properties` is how GraphQL reads an interface on its own fields and on its types at once ([Unions and interfaces](../graphql/resources.md#unions-and-interfaces)). In GraphQL a property may also carry `arguments` ([Fields with arguments](../graphql/resources.md#fields-with-arguments)).

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

`members` belongs to two types, so its line names both: `"members" is not allowed on a string schema at schemas Pet properties status, use it with "type: enum" or "type: union"` ([Enums and unions](enums-and-unions.md)). `name` on another type says where it belongs: `"name" is not allowed on an object schema at schemas Pet properties bornAt, use it with "type: scalar" (GraphQL contracts only)`.

Any node but a [union member](enums-and-unions.md#unions), which holds only its `ref`, may also carry `description`, which is never compared ([What is not compared](../contracts/the-contract-file.md#what-is-not-compared)). A description holds ASCII letters and digits, with a single space between words, such as `In kilograms`. Anything else (punctuation, accents, a line break, two spaces) is rejected at publish with the violation `schema.description_syntax`:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: invalid description "In kilograms." at schemas Pet properties weight, must be ASCII letters and digits, with single spaces between words
```

An empty description is rejected with `must not be empty`.

## Primitives

`integer` and `float` are strict: a consumer that declares `float` where the provider declares `integer` is a type mismatch. `number` is for a value that JSON sends as `50` or `50.5` alike, on either side. A reader writes it when its code accepts both. A producer writes it when its value can be a round float: PHP's `json_encode` sends the float `50.0` as `50`, so that value is `number`, not `float` or `integer`. A `number` reader accepts all three, and a `number` producer breaks a strict reader. The producer and the reader of a body are in [Which side decides](../contracts/the-contract-file.md#which-side-decides):

| Producer | Reader | Result |
|---|---|---|
| `integer`, `float` or `number` | `number` | compatible |
| `number` | `integer` or `float` | type mismatch |
| `integer` | `float`, or the reverse | type mismatch |

Two modules of the same consumer that declare `number` and `integer` for the same property are still rejected as different types ([Several files](../contracts/the-contract-file.md#several-files)).
