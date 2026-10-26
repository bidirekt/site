---
title: Objects
description: How properties describes the members of an object, and which property names are valid.
---

`properties` maps each member name to its own node, nested as deep as the body is:

```yaml
Pet:
  type: object
  properties:
    owner:
      type: object
      properties:
        name:
          type: string
```

A property name or a schema name must not be empty, must not contain `.`, `[`, `]`, `{`, `}` or `;`, and must not contain control characters. The six characters are reserved for the paths the broker compares and shows: `.`, `[]` and `{}` write `$.owner.name`, `$[].photoUrl` and `$.pets{}.name`. Any other name is valid, such as `content-type`, `@type`, `$ref` or `first name`:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: invalid property name "user.name" at schemas Pet properties, must not contain ".", "[", "]", "{", "}" or ";"
```

An empty name ends with `must not be empty`, and a name with a control character with `must not contain control characters`. When the name is a typo, rename the property to the key the body really has. When the body really has a fixed key with one of these characters, leave that key out of the contract: a property no side declares is not checked ([Which side decides](../contracts/which-side-decides.md)). Keys that vary go in a `map`, whose keys are not property names ([Maps](maps.md)).

An `object` without `properties`, or with `properties: {}`, is rejected:

```error title="publish error"
contract validation failed
  - petstore_web.yaml: object schema without properties at schemas Pet properties metadata, declare the keys you read, or use "type: map" with "values" if the keys vary
```

The fix is to declare the keys that arrive in the body, except a fixed key with a reserved character in its name, which stays out. The side that reads the body marks each key its code does not read with `optional: true`, so the side that produces the body is free to drop it. The side that produces the body declares the keys its code sends. When the keys vary, both sides write a `map` with `values` instead ([Maps](maps.md)).

Here `petstore_web` only counts a pet's `vaccinations`. Each vaccination arrives with a `name` and a `date`, and the code reads neither:

```yaml
Pet:
  type: object
  properties:
    vaccinations:
      type: array
      items:
        type: object
        properties:
          name:
            type: string
            optional: true
          date:
            type: string
            optional: true
```
