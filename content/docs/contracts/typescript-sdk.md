---
title: TypeScript SDK
description: How to write a service's contract from its TypeScript or JavaScript code with the TypeScript SDK: installation, an example with decorators and tags, the GraphQL consumer and graph, the generate command and the flow to publish. The full reference is the SDK's README.
---

The TypeScript SDK writes the [contract file](the-contract-file.md) of a service from its TypeScript or JavaScript code. You annotate the schemas and the handlers that provide or consume each REST resource, or call a GraphQL API, with decorators or with `@bidirekt` tags in `/** */` comments, run `generate`, and get `contracts/generated.yaml`, which [`validate`](../ship/validate.md) and [`publish`](../ship/publish.md) take like any other contract file. It reads the source code and never runs your app.

This page shows how it reads. Every decorator option, tag, type and error is in the [SDK's README](https://github.com/bidirekt/typescript-sdk#readme).

## Install

Both packages need Node.js 22.12 or later. `@bidirekt/typescript-sdk-cli` is the `generate` command, a dev dependency:

```
$ npm install --save-dev @bidirekt/typescript-sdk-cli
```

`@bidirekt/typescript-sdk` holds the decorators. The command depends on it, but a dev dependency is left out of a production install, and your app imports the decorators at runtime, so with decorators install it as a regular dependency too:

```
$ npm install @bidirekt/typescript-sdk
```

With tags only, the command is all you need.

## Example

`petstore_ts` provides `GET /pets`, `GET /pets/*` and `POST /pets`, and consumes `GET /ratings/*` from `petstore_reviews`. `@BidirektSchema` marks a schema and `@BidirektField` each field of the contract. A field's type comes from TypeScript, and a declared `type` says what TypeScript can't, as `integer` or `float` for a `number`. `name` gives a schema or a field another name in the contract: the class `CreatePetBody` is the schema `NewPet`, and `fullName` is written `full_name`, the key the body carries. A property without an annotation, like `internalNotes`, stays out of the contract:

```ts
// pet.ts
import { BidirektField, BidirektSchema } from '@bidirekt/typescript-sdk'

export enum PetStatus {
  Available = 'available',
  Sold = 'sold',
}

@BidirektSchema()
export class Owner {
  @BidirektField({ name: 'full_name' })
  fullName!: string
}

@BidirektSchema()
export class Shelter {
  @BidirektField()
  city!: string
}

@BidirektSchema()
export class Pet {
  @BidirektField({ type: 'integer' })
  petId!: number

  @BidirektField()
  name!: string

  @BidirektField()
  status!: PetStatus

  @BidirektField()
  size!: 'small' | 'large'

  @BidirektField({ type: 'float' })
  weight!: number

  @BidirektField({ type: 'string', description: 'ISO 8601 date' })
  birthDate!: Date

  @BidirektField()
  nickname?: string

  @BidirektField()
  owner!: Owner | null

  @BidirektField({ union: { owner: Owner, shelter: Shelter } })
  origin!: Owner | Shelter

  @BidirektField()
  tags!: string[]

  @BidirektField()
  vaccines!: Record<string, string>

  internalNotes!: string
}

@BidirektSchema({ name: 'NewPet' })
export class CreatePetBody {
  @BidirektField()
  name!: string
}

@BidirektSchema()
export class Rating {
  @BidirektField({ type: 'integer' })
  stars!: number
}
```

`@BidirektRestProvider` on a method declares a REST resource it provides. A body is a schema class, `[Pet]` for a list of it, or `null` for no body:

```ts
// pets.controller.ts
import { BidirektRestProvider } from '@bidirekt/typescript-sdk'
import { CreatePetBody, Pet } from './pet.js'

export class PetsController {
  @BidirektRestProvider({
    method: 'GET',
    path: '/pets',
    responses: { 200: [Pet] },
  })
  list(): Pet[] {
    return []
  }

  @BidirektRestProvider({
    method: 'GET',
    path: '/pets/*',
    responses: { 200: Pet, 404: null },
  })
  find(petId: number): Pet | undefined {
    return undefined
  }

  @BidirektRestProvider({
    method: 'POST',
    path: '/pets',
    request: CreatePetBody,
    responses: { 201: Pet, 400: null },
  })
  create(body: CreatePetBody): Pet {
    return Object.assign(new Pet(), body)
  }
}
```

`@BidirektRestConsumer` declares a REST resource it consumes, and names the provider:

```ts
// ratings.client.ts
import { BidirektRestConsumer } from '@bidirekt/typescript-sdk'
import { Rating } from './pet.js'

export class RatingsClient {
  @BidirektRestConsumer({
    provider: 'petstore_reviews',
    method: 'GET',
    path: '/ratings/*',
    responses: { 200: Rating, 404: null },
  })
  async find(petId: number): Promise<Rating | null> {
    const response = await fetch(`http://petstore-reviews/ratings/${petId}`)
    if (response.status === 404) return null
    return (await response.json()) as Rating
  }
}
```

Run `generate` in the project folder:

```
$ npx @bidirekt/typescript-sdk-cli generate
```

It writes `contracts/generated.yaml`. `status`, a string `enum`, becomes the `PetStatus` enum schema, `size` an inline enum, `owner` a `ref` to `Owner`, `origin` a union keyed by `union`, and the list `[Pet]` the `PetList` schema:

```yaml
# Generated by @bidirekt/typescript-sdk. Do not edit.
provides:
  rest:
    /pets:
      get:
        responses:
          200: PetList
      post:
        request: NewPet
        responses:
          201: Pet
          400: ~
    /pets/*:
      get:
        responses:
          200: Pet
          404: ~
consumes:
  petstore_reviews:
    rest:
      /ratings/*:
        get:
          responses:
            200: Rating
            404: ~
schemas:
  NewPet:
    type: object
    properties:
      name:
        type: string
  Owner:
    type: object
    properties:
      full_name:
        type: string
  Pet:
    type: object
    properties:
      petId:
        type: integer
      name:
        type: string
      status:
        ref: PetStatus
      size:
        type: enum
        members: ["small", "large"]
      weight:
        type: float
      birthDate:
        type: string
        description: ISO 8601 date
      nickname:
        type: string
        optional: true
      owner:
        ref: Owner
        nullable: true
      origin:
        type: union
        members:
          owner:
            ref: Owner
          shelter:
            ref: Shelter
      tags:
        type: array
        items:
          type: string
      vaccines:
        type: map
        values:
          type: string
  PetList:
    type: array
    items:
      ref: Pet
  PetStatus:
    type: enum
    members: ["available", "sold"]
  Rating:
    type: object
    properties:
      stars:
        type: integer
  Shelter:
    type: object
    properties:
      city:
        type: string
```

## Tags

Tags in `/** */` comments do the same as the decorators, for interfaces, function handlers and plain JavaScript. A tag names a schema by its name in the contract, and takes the options of the decorator as `key=value`: `@bidirekt schema name=NewPet`, `@bidirekt field name=full_name`. In place of the `CreatePetBody` class and the `create` method, this `pets.ts` declares the same schema and the same `POST /pets`, and `generate` writes the same file:

```ts
// pets.ts
import { Pet } from './pet.js'

/** @bidirekt schema name=NewPet */
export interface CreatePetBody {
  /** @bidirekt field */
  name: string
}

/**
 * @bidirekt rest provides POST /pets
 * @bidirekt request NewPet
 * @bidirekt response 201 Pet
 * @bidirekt response 400
 */
export function createPet(body: CreatePetBody): Pet {
  return Object.assign(new Pet(), body)
}
```

A list body is `Pet[]` in a tag, as `@bidirekt response 200 Pet[]`. One service can use both forms, never both on the same element. A handler that builds its body by hand, with no type to read, can declare its schema in its own comment ([Schemas in a handler's comment](https://github.com/bidirekt/typescript-sdk#schemas-in-a-handlers-comment)). The [Quickstart](https://github.com/bidirekt/typescript-sdk#quickstart) of the README writes the whole example with tags too, and [JavaScript](https://github.com/bidirekt/typescript-sdk#javascript) shows a schema in a `.js` file.

## GraphQL

For GraphQL, the SDK writes what a service consumes, and the graph of a subgraph. A provider publishes the GraphQL schema its application already has, which the SDK does not write ([GraphQL: Resources](../graphql/resources.md#the-provider-publishes-its-schema)).

`@BidirektGraphqlConsumer` on a method declares a field the service calls: the provider, `query` or `mutation` with the field's name, the schema of the `arguments` it sends and the shape it `returns`. `@BidirektGraphqlField` takes the place of `@BidirektField` on a field that needs an option of GraphQL: `scalar`, a custom scalar, or `arguments`, the arguments the call passes to that field. Here `petstore_web` calls the GraphQL API of `petstore_api`:

```ts
// petstore.client.ts
import {
  BidirektField,
  BidirektGraphqlConsumer,
  BidirektGraphqlField,
  BidirektSchema,
} from '@bidirekt/typescript-sdk'

@BidirektSchema()
export class PetArgs {
  @BidirektField()
  id!: string
}

@BidirektSchema()
export class AdoptArgs {
  @BidirektField()
  petId!: string
}

@BidirektSchema()
export class ReviewsArgs {
  @BidirektField({ type: 'integer' })
  first!: number
}

@BidirektSchema()
export class Review {
  @BidirektField({ type: 'integer' })
  stars!: number
}

@BidirektSchema()
export class Pet {
  @BidirektField()
  name!: string

  @BidirektField()
  status!: 'AVAILABLE' | 'SOLD'

  @BidirektGraphqlField({ scalar: 'DateTime', optional: true })
  bornAt!: string

  @BidirektGraphqlField({ arguments: ReviewsArgs })
  reviews!: Review[]
}

export class PetstoreClient {
  @BidirektGraphqlConsumer({
    provider: 'petstore_api',
    mutation: 'adoptPet',
    arguments: AdoptArgs,
    returns: Pet,
  })
  adopt(input: AdoptArgs) {
    return input
  }

  @BidirektGraphqlConsumer({
    provider: 'petstore_api',
    query: 'pets',
    returns: [Pet],
  })
  @BidirektGraphqlConsumer({
    provider: 'petstore_api',
    query: 'petCount',
    returns: 'integer',
  })
  pets() {}

  @BidirektGraphqlConsumer({
    provider: 'petstore_api',
    query: 'pet',
    arguments: PetArgs,
    returns: { nullable: Pet, name: 'MaybePet' },
  })
  pet(id: string) {
    return id
  }
}
```

`generate` writes the calls under `consumes.petstore_api.graphql`. A `returns` that is not a schema returned as it is becomes a schema of its own: `[Pet]` is `PetList`, `'integer'` is `Integer`, and `{ nullable: Pet, name: 'MaybePet' }` is `MaybePet`:

```yaml
# Generated by @bidirekt/typescript-sdk. Do not edit.
consumes:
  petstore_api:
    graphql:
      query:
        pet:
          arguments: PetArgs
          returns: MaybePet
        petCount:
          returns: Integer
        pets:
          returns: PetList
      mutation:
        adoptPet:
          arguments: AdoptArgs
          returns: Pet
schemas:
  AdoptArgs:
    type: object
    properties:
      petId:
        type: string
  Integer:
    type: integer
  MaybePet:
    ref: Pet
    nullable: true
  Pet:
    type: object
    properties:
      name:
        type: string
      status:
        type: enum
        members: ["AVAILABLE", "SOLD"]
      bornAt:
        type: scalar
        name: DateTime
        optional: true
      reviews:
        type: array
        items:
          ref: Review
        arguments: ReviewsArgs
  PetArgs:
    type: object
    properties:
      id:
        type: string
  PetList:
    type: array
    items:
      ref: Pet
  Review:
    type: object
    properties:
      stars:
        type: integer
  ReviewsArgs:
    type: object
    properties:
      first:
        type: integer
```

A primitive returned as a bare string, `'integer'`, is always written as `Integer`. To name it, write `{ type: 'integer', name: 'PetCount' }` in the decorator or `integer as PetCount` in the tag, and both write `PetCount: {type: integer}`.

With tags, `@bidirekt graphql consumes <provider> query|mutation <name>` goes above the handler, followed by `@bidirekt arguments <schema>` and `@bidirekt returns <type>`, and `@bidirekt graphql field` takes the place of `@bidirekt field`:

```ts
/** @bidirekt schema */
export interface PetArgs {
  /** @bidirekt field */
  id: string
}

/** @bidirekt schema */
export interface Pet {
  /** @bidirekt field */
  name: string

  /** @bidirekt graphql field scalar=DateTime */
  bornAt?: string
}

/**
 * @bidirekt graphql consumes petstore_api query pet
 * @bidirekt arguments PetArgs
 * @bidirekt returns Pet? as MaybePet
 */
export function pet(id: string) {
  return id
}
```

`provider` may name a federated graph, and the calls are then checked against the graph its subgraphs compose ([Graphs](../graphql/graphs.md#consuming-a-graph)). A subgraph declares its graph with `@BidirektGraph('petstore_graph')` on a class, or `@bidirekt graph petstore_graph` above any element, and `generate` writes it as `provides.graphql.graph`. Every form `returns` takes, lists, nullables, scalars, enums and unions, is in [GraphQL returns](https://github.com/bidirekt/typescript-sdk#graphql-returns) of the README, with the schema that takes a `union` itself, `@BidirektSchema({ union })` or `@bidirekt schema union={...}`, for a call that reads an interface both on its own fields and on the types that implement it.

## Describe what the code does

The contract describes what the code does, not the type the code declares ([Describe what the code does](the-contract-file.md#describe-what-the-code-does)). With the SDK, the TypeScript type is where each field starts, and a declared `type`, `optional` or `nullable` wins over it. In the example, `birthDate` is a `Date` in the code and a string in the body, so it declares `type: 'string'`. A `name: string | null` that the code always fills declares `nullable: false`.

## From code to deploy

`contracts/generated.yaml` is the service's contract file: a service adopts the SDK as a whole, with every resource and schema it provides or consumes annotated in its code. A subgraph's contract is that file together with its GraphQL schema ([GraphQL](#graphql)). Never edit the file: the next `generate` writes over it. Regenerate it whenever an annotation or an annotated type changes, commit it with the code, and ship it like any contract file:

```
$ npx @bidirekt/typescript-sdk-cli generate
$ bidirekt validate contracts/generated.yaml
$ bidirekt validate contracts/generated.yaml --participant petstore_ts --environment production
$ bidirekt publish contracts/generated.yaml --participant petstore_ts --version 1.4.0
$ bidirekt can-i-deploy petstore_ts --version 1.4.0 --environment production
$ bidirekt record-deployment petstore_ts --version 1.4.0 --environment production
```

A subgraph passes its schema file in the same commands, as `bidirekt validate contracts/generated.yaml src/schema.graphql` and `bidirekt publish contracts/generated.yaml src/schema.graphql --participant petstore_reviews --version 2.0.0`: `contracts/generated.yaml` alone fails with `graph "petstore_graph" without a GraphQL schema`.

[`validate`](../ship/validate.md) without `--participant` and `--environment` checks only the file; with them, it also compares the file with what is deployed in that environment. Deploy between `can-i-deploy` and `record-deployment`. In CI, `generate --check` fails the build when the committed file is out of date. `generate --project <tsconfig>` reads another project and writes to its folder, and `--out <file>` writes to another file.

The broker reads every file of one publish as one contract ([Several files](the-contract-file.md#several-files)), but the SDK cannot see a hand-written file: a tag cannot name a schema declared only there, and a schema or a provided resource declared both in the code and in a hand-written file is rejected at publish as declared twice. A consumed resource declared in both is merged, like the fragments of one consumer ([Several files](the-contract-file.md#several-files)). To adopt the SDK, annotate every resource and schema the service provides or consumes, generate, check that the new file declares what the old files did, and delete the old files.

When [`can-i-deploy`](../ship/can-i-deploy.md) reports a break, fix the annotation or the type in the code and generate again.

A type the contract cannot hold, such as `Date` without a declared `type`, stops `generate` with the file and the line, and nothing is written. The [`generate` command](https://github.com/bidirekt/typescript-sdk#the-generate-command) and the [Reference](https://github.com/bidirekt/typescript-sdk#reference) of the README list every option, type and error.
