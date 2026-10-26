---
title: Several files
description: How the files of one publish merge into one contract, for a provider and for a consumer.
---

All the files of one publish are one contract; how to pass them, files and folders alike, is in [publish](../ship/publish.md). The rules below hold for every kind of resource.

- **One schema namespace.** A schema declared in one file can be named from any other. The same name declared twice is a duplicate. A file that names schemas declared elsewhere is valid only when published together with that file.
- **A provider declares each resource once.** Files may split a provider's resources between them, but the same resource in two files is a duplicate. A file reached twice, such as a file passed on its own and again through its folder, is read once and is not a duplicate. How a REST request is split is in [Requests](../rest/requests.md#in-several-files).
- **A consumer merges by union.** Each module of a consumer may declare the resources it reads in its own file. Fragments of the same resource merge: in a body the consumer reads, a property is optional only if every fragment allows it, and nullable only if every fragment accepts `null`; in a body the consumer produces, it is required only if every fragment sends it, and nullable if any fragment may send `null`. A property that one fragment leaves out together with its parent is not made optional: only the parent is. Two fragments that give one property different types are rejected.

Two modules of the consumer `petstore_web` read the same resource, the `200` of `GET /pets/*`, each its own subset:

```yaml
# web_list.yaml
consumes:
  petstore_api:
    rest:
      /pets/*:
        get:
          responses:
            200: PetRow

schemas:
  PetRow:
    type: object
    properties:
      petId:
        type: integer
      name:
        type: string
```

```yaml
# web_card.yaml
consumes:
  petstore_api:
    rest:
      /pets/*:
        get:
          responses:
            200: PetCard

schemas:
  PetCard:
    type: object
    properties:
      petId:
        type: integer
      photoUrl:
        type: string
        optional: true
```

Published together, `petstore_web` reads `petId` and `name` as required and `photoUrl` as optional, so a provider that returns only `petId` and `name` is compatible. Remove `optional: true` from `web_card.yaml` and `photoUrl` becomes required, because one reader needs it.
