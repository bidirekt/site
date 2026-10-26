---
title: References
description: How ref gives a node the shape of a named schema, including a schema that points to itself.
---

`ref` gives a node the shape of a named schema, at any depth: as a whole schema, as a member, or as the items of an array, like `Pets` does with `Pet`. Write `ref` on its own, with at most `nullable` and `description` beside it, and `optional` when the node is a property. `nullable` beside a `ref` makes the node nullable even when the named schema is not, and `optional` beside it makes the property optional. `type`, `properties`, `items` or `values` beside a `ref` is rejected at publish:

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

A schema may point to itself, directly or through other schemas. Here each reply of a `Comment` is a `Comment`:

```yaml
Comment:
  type: object
  properties:
    text:
      type: string
    replies:
      type: array
      items:
        ref: Comment
```

The loop can also pass through other schemas, such as `Post.author` pointing to `User` and `User.posts` back to `Post`. There is no depth limit, and a report shows a difference inside a recursive schema as one block ([The report](../ship/can-i-deploy.md#the-report)).
