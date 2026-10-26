---
title: Nodes
description: The node types and their keys, the optional and nullable flags, how each side writes them, and schema names.
---

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

A node's `type` is one of `object`, `array`, `map`, `string`, `integer`, `float`, `number` and `boolean`. Every node declares `type`, except a node that is a `ref` ([References](references.md)). A node with neither is rejected at publish, even when its `items` or `properties` already show what it is:

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

Any node may also carry `description`, free text that the broker ignores.

## Optional and nullable

Two flags, `true` or `false`, say what a value may lack, and they are independent of each other:

- `optional: true` says the key may be missing. It is accepted only on a property, with or without a `ref` beside it. A property is required unless it says so; there is no `required` list.
- `nullable: true` says the key is there and its value may be `null` or the declared type. It is accepted on any node: a property, `items`, `values` and the root of a schema.

`optional` on array items ([Arrays](arrays.md)), on map values ([Maps](maps.md)) or on a named schema is rejected at publish, `optional: false` too. A named schema is not optional by itself: the property that uses it is, with `optional: true` beside its `ref`:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: "optional" is not allowed on a schema at schemas Pet, mark optional the property that uses it, beside its "ref"
```

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

## Writing the flags

The contract describes what the code does, not the type the code declares. The side that reads the body writes the flags from how its code reads each property, and the side that produces the body from what its code can send ([Which side decides](../contracts/which-side-decides.md)).

The side that reads the body asks one question for each property: if this value comes `null` or is missing, does the code keep working?

- It keeps working with `null`: `nullable: true`.
- It keeps working without the key: `optional: true`.
- It breaks: neither.

The side that produces the body writes `nullable: true` when its code may send `null` for the property, and `optional: true` when it may leave the key out.

A provider that reads a body marks a property by what it accepts without answering an error. When `petstore_api` answers `400` to a `POST /pets` without `name`, `name` is required, even if the code that parses the body lets it be missing.

When `petstore_api` gives `name` a nullable type, such as `String?`, but always fills it, its contract writes `name` without `nullable`. With `nullable: true`, `can-i-deploy` fails against every consumer that reads `name` with no fallback.

What `optional` and `nullable` mean for a break depends on which side reads the body, and that rule is in [Which side decides](../contracts/which-side-decides.md).

## Schema names

Schema names are unique across every file of a publish, and every body and `ref` resolves against all of them. A schema that no resource or `ref` names is accepted and never compared, so a file with only `schemas` publishes too.

A schema name follows the same rule as a property name ([Objects](objects.md)). The name lives only in the contract, so the fix is to rename the schema:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: invalid schema name "Pet.v2" at schemas, must not contain ".", "[", "]", "{", "}" or ";"
```
