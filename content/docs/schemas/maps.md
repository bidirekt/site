---
title: Maps
description: How a map describes an object whose keys are not known in advance, and how it compares with an object.
---

An object whose keys are not known in advance, but whose values all have the same shape, is a `map`. `values` is the node of every value, and the key is always a string:

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

A contract written before `map` existed declares a map as `type: object` with `values`. It is rejected with two lines at the same property, one for `values` and one for the missing `properties`, and the fix is to write `type: map` in place of `type: object`:

```error title="publish error"
contract validation failed
  - petstore_web.yaml: "values" is not allowed on an object schema at schemas Owner properties pets, use it with "type: map"
  - petstore_web.yaml: object schema without properties at schemas Owner properties pets, declare the keys you read, or use "type: map" with "values" if the keys vary
```

`values` does not accept `optional`. When the map may be missing, the property that holds it is optional; when a value may be `null`, `values` is `nullable: true`:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: "optional" is not allowed on map values at schemas Pet properties scores values, mark the property that holds the map optional, or use "nullable: true" for a value that may be null
```

A map only matches a map. Two maps compare their values like the items of an array: type, `nullable` and their own members. In a break line the dynamic key is written `{}`, as in `$.pets{}.name`, and a map's type is written `map<T>`, as an array's is `array<T>`.

A map on one side and an `object` on the other is a type mismatch on the property itself, and nothing inside it is compared. Here `petstore_api` sends `pets` as an `object` with the properties `bob` and `sky`, and `petstore_web` reads it as a map:

```error title="can-i-deploy output"
petstore_api 1.5.0 cannot be deployed to production

petstore_web (1.4.0, deployed):
  Owner.pets — petstore_api provides it as object, but petstore_web reads map<object>
    → petstore_api: provide it as map<object>
    → petstore_web: read it as object there
      · GET /owners/* response 200 at "$.pets" (petstore_web: Owner.pets)
```

The fix is to describe the same shape on both sides. When the keys are fixed, both sides declare them as `properties` of an `object`, and leave out a key with a reserved character in its name. When the keys vary, both sides declare a `map`.
