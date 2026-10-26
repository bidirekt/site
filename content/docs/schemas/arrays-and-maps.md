---
title: Arrays and maps
description: How items describes every element of an array and values every value of a map, and how a map compares with an object.
---

An `array` describes all its elements with one node, `items`, and a `map` all its values with one node, `values`. Two arrays compare their `items`, and two maps their `values`: type, `nullable` and their own members. A report writes an element as `[]` and a map value as `{}` in a path, and the types as `array<T>` and `map<T>` ([Reading a property block](../ship/can-i-deploy.md#reading-a-property-block)).

## Arrays

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

`items` can also be a `ref` to a named schema, as in `Pets` in [Types](types.md). An array without `items` is rejected.

An array that may be missing, with elements that may be `null`:

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

`optional` on `items` is rejected ([Optional and nullable](optional-and-nullable.md)):

```error title="publish error"
contract validation failed
  - petstore_api.yaml: "optional" is not allowed on array items at schemas Pet properties tags items, mark the property that holds the array optional, or use "nullable: true" for an item that may be null
```

## Maps

An object whose keys are not known in advance, but whose values all have the same shape, is a `map`, and its keys are always strings:

```yaml
PetsByName:
  type: map
  values:
    ref: Pet
```

describes

```json
{ "bob": { "name": "Bob" }, "sky": { "name": "Sky" } }
```

A `map` without `values` is rejected:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: map schema without values at schemas PetsByName
```

A `type: object` with `values` and no `properties` is rejected with two lines at the same property, one for `values` and one for the missing `properties`; the fix is `type: map` in place of `type: object`:

```error title="publish error"
contract validation failed
  - petstore_web.yaml: "values" is not allowed on an object schema at schemas Owner properties pets, use it with "type: map"
  - petstore_web.yaml: object schema without properties at schemas Owner properties pets, declare the keys you read, or use "type: map" with "values" if the keys vary
```

`optional` on `values` is rejected too ([Optional and nullable](optional-and-nullable.md)):

```error title="publish error"
contract validation failed
  - petstore_api.yaml: "optional" is not allowed on map values at schemas Pet properties scores values, mark the property that holds the map optional, or use "nullable: true" for a value that may be null
```

A map only matches a map. A map on one side and an `object` on the other is a type mismatch on the property itself, and nothing inside it is compared. Here `petstore_api` sends `pets` as an `object` with the properties `bob` and `sky`, and `petstore_web` reads it as a map:

```error title="can-i-deploy output"
petstore_api 1.5.0 cannot be deployed to production

petstore_web (1.4.0, deployed):
  Owner.pets — petstore_api provides it as object, but petstore_web reads map<object>
    → petstore_api: provide it as map<object>
    → petstore_web: read it as object there
      · GET /owners/* response 200 at "$.pets" (petstore_web: Owner.pets)
```

The fix is to describe the same shape on both sides. When the keys are fixed, both sides declare them as `properties` of an `object`, and leave out a key with a reserved character in its name ([Names](objects.md#names)). When the keys vary, both sides declare a `map`.
