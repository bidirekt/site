---
title: Resources
description: How a GraphQL provider publishes its schema, how a consumer declares the queries and mutations it calls, how GraphQL types become schemas and compare, the publish errors, and what a GraphQL contract does not compare.
---

A `graphql` block declares GraphQL resources. Each field of the query or the mutation root is two resources: its `arguments`, which the consumer sends and the provider reads, and its `returns`, which the provider produces and the consumer reads. Each one is compared on its own. What holds for every kind of resource is in [The contract file](../contracts/the-contract-file.md#resources).

The two sides write it differently. The provider publishes the GraphQL schema its application already has, and the broker reads its resources from it. The consumer writes in YAML the fields it calls, with the arguments it sends and the fields it reads.

A report names a GraphQL resource by its operation and field, as `query pet`, and a place in it by `arguments` or `returns`, as in `query pet returns at "$.name"` ([Breaks](breaks.md#in-the-report)).

## The provider publishes its schema

`petstore_api` serves pets over GraphQL. Its schema is the file its server reads or prints:

```graphql
type Query {
  pet(id: ID!): Pet
  pets(status: Status): [Pet!]!
}

type Mutation {
  adoptPet(petId: ID!): Pet!
}

scalar DateTime

enum Status {
  AVAILABLE
  SOLD
}

type Pet {
  id: ID!
  name: String!
  status: Status!
  bornAt: DateTime
  reviews(first: Int): [Review!]!
}

type Review {
  stars: Int!
}
```

It publishes the file, with no YAML:

```
$ bidirekt publish schema.graphqls --participant petstore_api --version 1.4.0
petstore_api contract publish successful
```

- A schema file ends in `.graphql`, `.graphqls` or `.gql`. Every schema file of one publish is one schema: the types may live in one file and the `Query` in another, and a type may be extended in a file other than the one that defines it. Passed alone, a file that names a type another file defines fails with `./api/query.graphqls:2:17: Undefined type Pet.`.
- Each field of `Query` and `Mutation`, or of the roots that `schema { query: … mutation: … }` names, is a resource the participant provides. `Subscription` is ignored.
- Schema files publish together with YAML files in the same command: a participant that also consumes, or that provides REST, passes its YAML next to its schema. Under `provides`, the `graphql` block takes only `graph`, for a subgraph ([Graphs](graphs.md)); `query` and `mutation` there are unknown keys, since the schema already declares them.
- The types of the schema are a namespace of their own: a YAML schema `Pet` and a GraphQL `type Pet` in the same contract never collide.
- Every type is stored, also one no field reaches. Changing it makes a new [snapshot](../concepts/how-the-broker-works.md#snapshot) and breaks no consumer.

The broker reads the schema with the rules of GraphQL. A schema that GraphQL rejects is refused with the position and the text of the error, after `cannot post contract to broker:`. The usual ones:

- A type, a field or a directive that no file defines: `./api/query.graphqls:2:17: Undefined type Pet.`.
- An `extend` of a type that no file of the publish defines, outside a subgraph: `query.graphqls:1:13: Cannot extend type "Query" because it is not defined.`.
- A file of client operations or fragments in place of the schema: `./operations.graphql: holds client operations; publish expects the GraphQL schema`. Cut off, it gives the place where it ends: `./broken.graphql:5:1: Expected Name, found <EOF> in client operations; publish expects the GraphQL schema`.

## The consumer declares what it calls

`petstore_web` calls three fields of `petstore_api`. Under `query` and `mutation`, each key is a field of the root, with `arguments`, the schema of the arguments it sends, and `returns`, the schema of what it reads:

```yaml
consumes:
  petstore_api:
    graphql:
      query:
        pet:
          arguments: PetArgs
          returns: MaybePet
        pets:
          returns: PetList
      mutation:
        adoptPet:
          arguments: AdoptArgs
          returns: Pet

schemas:
  PetArgs:
    type: object
    properties:
      id:
        type: string
  AdoptArgs:
    type: object
    properties:
      petId:
        type: string
  MaybePet:
    ref: Pet
    nullable: true
  PetList:
    type: array
    items:
      ref: Pet
  Pet:
    type: object
    properties:
      name:
        type: string
      status:
        type: enum
        members: [AVAILABLE]
      bornAt:
        type: scalar
        name: DateTime
        nullable: true
      reviews:
        type: array
        items:
          ref: Review
        arguments: ReviewsArgs
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

- The key is the field name alone, as the schema writes it. Arguments go in `arguments`, never in the key.
- `returns` is required: every call reads something.
- Without `arguments`, the call sends no argument, so a provider that starts requiring one breaks it.
- `arguments` names an object schema that is not nullable, with one property per argument the call sends.
- The nullability and the list at the top of `returns` live in the schema it names: `MaybePet` reads `pet: Pet`, which may be null, and `PetList` reads `pets: [Pet!]!`.
- The consumer declares only the fields it selects, at every level.
- The name under `consumes` is the provider's participant name, or the name of a graph ([Graphs](graphs.md#consuming-a-graph)).
- `subscription` under `graphql`, and `graph` under `consumes.<provider>.graphql`, are unknown keys.
- A root field that starts with `__`, such as `__schema` or `__type`, is introspection, served by the GraphQL library and not by the provider's contract. It publishes and is never stored, compared or broken.
- `__typename`, read on an object, an interface or a union, is always provided.

## Fields with arguments

A field the call passes arguments to, as `reviews(first: 10)`, carries `arguments` beside its type, naming the object schema of those arguments, as `reviews` above. `arguments` goes only on a property.

The arguments of a field are compared whenever either side declares them. The side that declares none sends none, so a provider that adds `reviews(first: Int!)` breaks a consumer that reads `reviews` without `arguments`.

## Scalars

A custom scalar is `type: scalar` with its `name`, as `bornAt` above. It matches only the scalar of the same name: `DateTime` and `Date` are different types. The built-in scalars are primitives, written as in the [table below](#how-graphql-types-become-schemas).

`type: scalar` and `arguments` belong to GraphQL. In a schema that a REST resource reaches, they are rejected at publish; in a schema that no resource reaches, they are accepted and never compared.

## How GraphQL types become schemas

The broker turns the provider's schema into the schemas a consumer writes:

| GraphQL | Schema |
|---|---|
| `String` | `string` |
| `ID` | `string` |
| `Int` | `integer` |
| `Float` | `float` |
| `Boolean` | `boolean` |
| `scalar DateTime` | `type: scalar`, `name: DateTime` |
| `type`, `input` | `object` |
| `enum` | `enum` |
| `union` | `union`, each member keyed by its type name |
| `interface` | `union` of the types that implement it, with the interface's own fields as `properties` |
| an output field without `!` | `nullable`, never `optional` |
| an argument or an input field without `!` | `optional` and `nullable` |
| an argument or an input field with `!` and a default, as `first: Int! = 10` | `optional`, never `nullable` |
| `[Review!]!` | an `array` that is not nullable, of items that are not nullable |

A consumer reads a `Float` as `float`, or as `number` when its code accepts any number ([Primitives](../schemas/types.md#primitives)).

## Unions and interfaces

A union is read as a `union` whose member keys are type names of the provider's schema. The consumer lists the members it reads, each with the schema it reads from that type; a member it does not list never breaks.

An interface is read in one of three ways:

- as an object, with the fields of the interface: `node { id }` is `type: object` with `id`;
- as a union of the types that implement it: `node { ... on User { name } }` is `type: union` with the member `User`;
- both at once, as Relay reads it: `node { id ... on User { name } }` is a `union` with `properties`, the fields read on the interface, and `members`, the types read with `... on`:

```yaml
Node:
  type: union
  properties:
    id:
      type: string
  members:
    User:
      ref: UserName
    Pet:
      ref: PetSpecies
```

A field that leaves the interface breaks a consumer that reads it on the interface, and a type that stops implementing it breaks a consumer that reads it as a member. A union with `properties` exists only in GraphQL: in a schema that a REST resource reaches, it is rejected at publish.

## How types compare

The rules of [Which side decides](../contracts/the-contract-file.md#which-side-decides) hold, with the rules of GraphQL on top:

- **A field read must exist.** A field the consumer reads, even one it marks `optional`, breaks when the provider no longer has it: selecting a field the type does not have invalidates the whole query.
- **Input is closed.** GraphQL rejects an argument or an input field it does not know, so one the consumer sends and the provider does not declare breaks, even when the consumer marks it optional.
- **Nullability.** An output field that becomes nullable breaks a consumer that does not accept `null`. An argument that becomes non-null breaks a consumer that may send `null`. A new required argument breaks a consumer that does not send it.
- **Custom scalars** match by name.
- **Enums and unions** compare as in [How they compare](../schemas/enums-and-unions.md#how-they-compare): every value and member the consumer declares must be declared by the provider.
- **Input coercion.** In an argument or an input field, an `integer` or a `number` sent to a `Float` passes, and so does an `integer` sent to an `ID`. A single value sent to a list passes too: a `string` sent to `[String!]`. An `integer` sent to a `String` still breaks.
- **Named input types.** A client declares each variable by the name of its type, as `$id: ID!`. So a provider whose new version changes the named type of an argument or an input field that a deployed consumer sends, such as `ID` to `String`, or a renamed input or enum, breaks that consumer, even with the same shape. The consumer does not write these names: they come from the provider's deployed version, compared with the new one, so the break appears only in the provider's check, and once the provider deploys the change, the consumer's own check no longer sees it. When the change also breaks the shape, as `ID` to `Int`, only the break of the shape is reported.
- **Output type names** are not compared: renaming an output type that keeps its shape breaks no consumer.

A provider that changes an output field from `Float` to `Int` breaks a consumer that reads it as `float`, but not one that reads it as `number`.

## In several files

The schema files of a provider are one schema, so a type defined in two of them is refused by GraphQL: `b.graphqls:1:6: Cannot redeclare type Query.`. A consumer may declare the same field in several YAML files, and they merge as in [Several files](../contracts/the-contract-file.md#several-files). Two files that give the same property different `arguments` are rejected at publish:

```error title="publish error"
contract validation failed
  - petstore_web.yaml: conflicting arguments for property "$.reviews" of consumes petstore_api query pet: ReviewsArgs here, none in other.yaml
```

## Publish errors

Each line below is printed after the file's name, as in [publish](../ship/publish.md):

- `type "scalar" is only allowed in GraphQL contracts at schemas Pet properties bornAt`: a scalar in a schema that a REST resource reaches.
- `"arguments" is only allowed in GraphQL contracts at schemas Pet properties reviews`: `arguments` in a schema that a REST resource reaches.
- `"arguments" must name an object schema at consumes petstore_api graphql query pet: PetId is string`, and `"arguments" must name a non-nullable schema at consumes petstore_api graphql query pet: MaybeArgs is nullable`: an `arguments`, of a field called or of a property, whose `ref` chain does not end in an object, or passes through a nullable one.
- `scalar schema without name at schemas Pet properties bornAt`: `type: scalar` without `name`.
- `"name" is not allowed on an object schema at schemas Pet properties bornAt, use it with "type: scalar" (GraphQL contracts only)`: `name` on a type other than `scalar`.
- `missing "returns" at consumes petstore_api graphql query pet`: a field called without `returns`.
- `invalid GraphQL field name "pets(first: 10)" at consumes petstore_api graphql query, write the field name only; arguments go in "arguments"`: a key under `query` or `mutation` that is not a GraphQL name.

The errors of a subgraph's `graph` are in [Graphs](graphs.md#declaring-the-graph).

## What is not compared

A change in any of the items below never makes `can-i-deploy` fail. The items that hold for every kind of resource are in [The contract file](../contracts/the-contract-file.md#what-is-not-compared).

- **Descriptions** in the schema.
- **Default values.** A default only makes an argument or an input field optional; its value is not stored.
- **Directives that are behavior**: custom directives, access directives such as `@authenticated`, `@requiresScopes` and `@policy`, `@deprecated` and `@specifiedBy`. They are accepted and ignored. Only the federation directives of a subgraph count ([Graphs](graphs.md#composition)).
- **Subscriptions.** A `Subscription` in the schema is ignored, and `subscription` in the YAML is rejected.
- **`@oneOf`.** An input marked `@oneOf` publishes and is read as a plain input, with every field optional and nullable: a consumer that sends two of its fields, or a `null` one, passes.
- **The client's operations.** Bidirekt compares schema against schema, never a query against the schema, so `@defer`, `@stream`, fragments and variables have no place in a contract.
- **Introspection**, `__schema` and `__type`.
