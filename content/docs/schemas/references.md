---
title: References
description: How ref gives a node the shape of a named schema, including a schema that points to itself.
---

`ref` gives a node the shape of a named schema, at any depth: as a whole schema, as a member, or as the items of an array, like `Pets` does with `Pet`. Write `ref` on its own, with at most `nullable` and `description` (ASCII letters and digits, with a single space between words) beside it, and `optional` when the node is a property; a [union member](enums-and-unions.md#unions) holds only its `ref`. `nullable` beside a `ref` makes the node nullable even when the named schema is not, and `optional` beside it makes the property optional. `type`, `properties`, `items`, `values` or `members` beside a `ref` is rejected at publish:

```yaml
Pet:
  type: object
  properties:
    owner:
      type: string
      ref: Owner
```

```error title="publish error"
contract validation failed
  - petstore_api.yaml: "type" is not allowed beside "ref" at schemas Pet properties owner
```

The fix is to keep either the `ref` alone or the shape without the `ref`, whichever describes the body.

A `ref` to a name no schema declares is rejected at publish.

## Schemas that point to themselves

A schema may point to itself, directly or through other schemas, through a property, an item or a value. Here each subcategory of a `Category` is a `Category`:

```yaml
Category:
  type: object
  properties:
    name:
      type: string
    subcategories:
      type: array
      items:
        ref: Category
```

The loop can also pass through other schemas, such as `Pet.owner` pointing to `Owner` and `Owner.pets` back to `Pet`. There is no depth limit, and a report shows a difference inside a recursive schema as one block ([The report](../ship/can-i-deploy.md#the-report)).

## Loops with no type

A schema that only refers to itself through `ref`, with no type on the way, describes no body, and is rejected at publish, once per loop, at the first of its schemas in alphabetical order:

```yaml
Species:
  ref: Breed
Breed:
  ref: Species
```

```error title="publish error"
contract validation failed
  - petstore_api.yaml: schema "Breed" only refers to itself through ref (Breed → Species → Breed): give one of them a type
```
