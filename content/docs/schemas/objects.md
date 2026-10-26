---
title: Objects
description: How properties describes the members of an object, and which property and schema names are valid.
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

An `object` without `properties`, or with `properties: {}`, is rejected:

```error title="publish error"
contract validation failed
  - petstore_web.yaml: object schema without properties at schemas Pet properties metadata, declare the keys you read, or use "type: map" with "values" if the keys vary
```

The fix is to declare the keys that arrive in the body, except a fixed key with a reserved character in its name ([Names](#names)), which stays out. The side that reads the body marks each key its code does not read with `optional: true`, and the side that produces the body declares the keys its code sends ([Which side decides](../contracts/the-contract-file.md#which-side-decides)). When the keys vary, both sides write a `map` with `values` instead ([Maps](arrays-and-maps.md#maps)).

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

## Names

A property name or a schema name must not be empty, must not contain `.`, `[`, `]`, `{`, `}` or `;`, and must not contain control characters. The six characters are reserved for the paths the broker compares and shows ([Reading a property block](../ship/can-i-deploy.md#reading-a-property-block)). Any other name is valid, such as `content-type`, `@type`, `$ref` or `first name`. A name with a reserved character is rejected at publish:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: invalid property name "user.name" at schemas Pet properties, must not contain ".", "[", "]", "{", "}" or ";"
```

An empty name ends with `must not be empty`, and a name with a control character with `must not contain control characters`. When the name is a typo, rename the property to the key the body really has. When the body really has a fixed key with one of these characters, leave that key out of the contract: a property no side declares is not checked ([Which side decides](../contracts/the-contract-file.md#which-side-decides)). Keys that vary go in a `map`, whose keys are not property names ([Maps](arrays-and-maps.md#maps)).

A schema name lives only in the contract, so the fix is to rename the schema:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: invalid schema name "Pet.v2" at schemas, must not contain ".", "[", "]", "{", "}" or ";"
```

Schema names are unique across the files of a publish ([Several files](../contracts/the-contract-file.md#several-files)), and a schema that no resource or `ref` names is accepted but never compared ([What is not compared](../contracts/the-contract-file.md#what-is-not-compared)).
