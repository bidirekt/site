---
title: Graphs
description: How subgraphs declare a federated graph, how the broker composes it in each environment, how a consumer of the graph and a subgraph are checked, what composition checks and does not check, the graph page, and the known gaps.
---

A federated graph is the API that a router serves by composing several subgraphs, each a participant that publishes its own GraphQL schema. In Bidirekt the graph is only a name, declared by its subgraphs; nobody creates it and it is not a participant. A consumer calls the graph by that name, and the broker checks it against the graph composed from the subgraphs deployed in the environment.

## Declaring the graph

A subgraph publishes its schema with the `@link` of Apollo Federation 2, and a YAML file that names its graph:

```yaml
provides:
  graphql:
    graph: petstore_graph
```

```graphql
extend schema @link(url: "https://specs.apollo.dev/federation/v2.3", import: ["@key", "@shareable"])

type Pet @key(fields: "id") {
  id: ID!
  reviews: [String!]!
}
```

```
$ bidirekt publish graph.yaml schema.graphqls --participant petstore_reviews --version 2.0.0
petstore_reviews contract publish successful
```

- Any `v2.x` of the federation spec is read. Another version is refused with its position: `schema.graphqls:1:15: federation v3.0 is not supported; supported: v2.x`.
- A Federation 1 schema, without `@link`, publishes in a contract that declares `graph`, with `@key`, `@external`, `@requires`, `@provides`, `@extends` and `@tag` by their own names.
- A subgraph may extend a type that only another subgraph defines.
- A subgraph is still a GraphQL provider of its own: a consumer may call it directly by its participant name.
- A subgraph may change its graph between versions. The graph of the version deployed in an environment is the one that counts there.

Its errors at publish, each printed after the file's name as in [publish](../ship/publish.md):

- `graph "petstore_graph" without a GraphQL schema at provides graphql, pass its .graphql, .graphqls or .gql in the same command`: a `graph` without a schema file in the same publish. With the [TypeScript SDK](../contracts/typescript-sdk.md#graphql), the generated contract of a subgraph is published together with the schema.
- `the GraphQL schema links Apollo Federation, but no graph is declared, declare it in provides.graphql.graph`: a schema with the federation `@link` and no `graph`.
- `invalid graph name "Petstore-Graph" at provides graphql, must be snake_case`: a graph name follows the rules of a participant name.
- `graph name "petstore_graph" is already a participant name at provides graphql, pick another graph name`.
- `graph "other_graph" conflicts with graph "petstore_graph" declared in contracts/api.yaml at provides graphql, a contract belongs to one graph: declare the same name in every file`: two YAML files of one publish that name different graphs. The same name in several files is one graph.

Graph names and participant names share one space. Once a subgraph has published a graph name, [`create-participant`](../reference/cli.md#create-participant) refuses it:

```error title="CLI error"
cannot post participant to broker: "petstore_graph" is a graph name; pick another participant name
```

## Consuming a graph

A consumer names the graph under `consumes`, as it names a provider, and writes the fields it calls as for any [GraphQL provider](resources.md#the-consumer-declares-what-it-calls):

```yaml
consumes:
  petstore_graph:
    graphql:
      query:
        pet:
          arguments: PetArgs
          returns: MaybePet
```

The graph of an environment is the composition of the subgraphs deployed there, made at each check, so it may differ from one environment to another. The consumer is compared with it, and the report names the graph with the versions of its subgraphs in place of a version:

```error title="can-i-deploy output"
petstore_web 2.3.0 cannot be deployed to production

petstore_graph (petstore_api 1.4.0 + petstore_reviews 2.0.0, deployed):
  Pet.age — petstore_web reads it as String!, but petstore_graph provides Int!
    → petstore_web: read it as Int!
    → petstore_graph: provide it as String! there
      · query pet returns at "$.age" (petstore_graph: Pet.age)
```

A field the composed graph does not resolve is `calls query pet, but petstore_graph doesn't provide it`. A graph with no subgraph deployed in the environment is `calls query pet, but petstore_graph is not deployed in production`, under `petstore_graph:`, and a graph whose deployed subgraphs do not compose is `calls query pet, but petstore_graph can't be built in production`, followed by every composition error and `deployed graph: /graphs/petstore_graph` ([Breaks](breaks.md#every-break)).

A subgraph may consume its own graph. In its check, the graph is composed with the version under check, marked `candidate`: `petstore_graph (petstore_api 1.5.0 candidate + petstore_reviews 2.0.0, deployed):`. [`validate`](../ship/validate.md) has no version, so it prints `petstore_api candidate`. The participant's own deployed version is never one of its counterparts.

## Checking a subgraph

The check of a subgraph compares, as for any provider, the consumers that call it directly. It also composes the graph with the new version, and compares each consumer of the graph deployed in the environment with it. A break that comes through the graph names the subgraph with ` (via petstore_graph)` ([In the report](breaks.md#in-the-report)).

A subgraph answers only for the breaks it causes. The broker also composes the graph as it is without the change, with the subgraph's deployed version, or without the subgraph when none of its versions is deployed there or that version is in another graph. Only the breaks that the new version has and that graph does not are reported. So:

- a break that a field of another subgraph already causes does not block this one, and shows only in the consumer's own check;
- a composition error between other subgraphs is not this subgraph's;
- `makes petstore_graph fail to compose` shows only when the graph composes without the change and does not compose with it.

When the graph does not compose without the change but composes with it, the subgraph is compared with the graph composed without it: a version that fixes the composition can be deployed, even while a consumer is already broken by another subgraph. In that case the fields the new version drops, compared with its own deployed version, are not reported. When neither composes, the consumer is not compared.

A subgraph that leaves the graph, with a version without `graph`, is checked against the graph composed without it, and a subgraph that moves to another graph is checked in both.

## Composition

The broker composes the graph with the rules of Apollo Federation 2. Only `@key`, `@shareable`, `@inaccessible`, `@external`, `@override`, `@provides` and `@interfaceObject` count; every other directive is accepted and ignored, except `@fromContext`: an argument marked with it is left out of the contract, since the router fills it and a client never sends it. The definitions that a subgraph library prints next to the `@link`, such as `_service`, `_entities`, `_Any`, `_Entity`, `_Service`, `FieldSet` and `link__*`, are not part of the contract nor of the graph.

What composes:

- A field resolved by more than one subgraph needs `@shareable` in each, except the fields of a `@key`, the fields of an interface, and every field of a Federation 1 subgraph.
- Output fields join, and are nullable when any subgraph has them nullable. Two compatible output types join as the wider one: `Holder.item: Node` in one subgraph and `Thing`, which implements `Node`, in the other compose as `Node`.
- Arguments and input fields intersect, and non-null wins.
- An enum used only as output joins, one used only as input intersects, and one used as both must be the same in every subgraph.
- An `@inaccessible` element leaves the graph, and stays when the subgraph is called directly.
- A field with `@override(from: "<subgraph>")` is resolved only by the subgraph that overrides it, without `@shareable`. The `label` of a progressive override counts as a full override. The `from` names a subgraph by its participant name: `@override(from: "petstore_api")`.
- An `@interfaceObject` composes as the interface, and every type that implements it gets its fields.
- The graph has only the roots that some subgraph declares.
- Every query the graph allows must be resolvable from its root fields, through the jumps that the `@key`s allow and the fields that a `@provides` on the path selects.

The errors name the subgraphs, their versions and the element, one text per rule:

| Rule | Error |
|---|---|
| a field in two subgraphs without `@shareable` | `petstore_api 1.4.0 and petstore_orders 1.0.0 both resolve Money.amount without @shareable` |
| output types that do not join | `petstore_api 1.4.0 resolves Pet.age as Int, but petstore_reviews 2.0.0 as String` |
| a required argument or input field that another subgraph does not declare | `petstore_api 1.4.0 requires Query.pets(limit:), which petstore_reviews 2.0.0 doesn't declare` |
| an enum used as input and output that differs | `petstore_api 1.4.0 and petstore_reviews 2.0.0 declare different values for Status, used as input and output` |
| a query that can't be resolved | `query pet.reviews can't be resolved: no resolvable @key leads from petstore_api 1.4.0 to petstore_reviews 2.0.0 on Pet` |
| an `@override` from the subgraph itself | `petstore_reviews 2.0.0 overrides Pet.rating from itself` |
| an `@override` of a field whose origin overrides it too | `petstore_reviews 2.0.0 overrides Pet.rating from petstore_api, which overrides it too` |
| a root with another name beside a type with the default name | `petstore_api 1.4.0 has a type named Query, but its query root is RootQuery (ROOT_QUERY_USED)` |
| a required argument or input field that is `@inaccessible` | `petstore_api 1.4.0 requires Query.pet(debug:), which is @inaccessible` |
| a visible element whose type is `@inaccessible` | `petstore_api 1.4.0 declares Pet.audit as Audit, which is @inaccessible` |
| an object, input or enum with nothing left in the graph | `Size has no value left in the graph of petstore_api 1.4.0 and petstore_reviews 2.0.0` |
| a field that exists only as `@external` | `petstore_reviews 2.0.0 marks Pet.weight @external, but no subgraph resolves it` |
| any other conflict, such as a type of another kind | `petstore_api 1.4.0 and petstore_reviews 2.0.0 disagree on Pet: object in petstore_api, interface in petstore_reviews` |

An `@override(from:)` that names no subgraph of the graph is ignored, as Apollo ignores it. When another subgraph also resolves the field without `@shareable`, the error says so:

```
petstore_api 1.4.0 and petstore_reviews 2.0.0 both resolve Pet.rating without @shareable: the @override(from: "petstore_legacy") of petstore_reviews 2.0.0 names no member of petstore_graph, whose members are petstore_api and petstore_reviews
```

### What composition does not check

These Apollo rules are not checked, so a graph that breaks only one of them composes in Bidirekt:

- the fields that `@requires` and `@provides` select (`REQUIRES_FIELDS_MISSING_EXTERNAL`, `REQUIRES_INVALID_FIELDS`, `PROVIDES_FIELDS_MISSING_EXTERNAL`, `PROVIDES_INVALID_FIELDS`), the `@requires` on the path of a query, and the `@shareable` that Apollo asks of the subgraph that owns a field a `@provides` selects;
- the rules of `@external`: `EXTERNAL_TYPE_MISMATCH`, `EXTERNAL_UNUSED`, `EXTERNAL_ARGUMENT_MISSING`;
- the rules of `@inaccessible`: `IMPLEMENTED_BY_INACCESSIBLE`, `QUERY_ROOT_TYPE_INACCESSIBLE`, `DEFAULT_VALUE_USES_INACCESSIBLE`, `DISALLOWED_INACCESSIBLE`;
- default values that differ between subgraphs: `FIELD_ARGUMENT_DEFAULT_MISMATCH`, `INPUT_FIELD_DEFAULT_MISMATCH`;
- the keys of interfaces: `INTERFACE_FIELD_NO_IMPLEM`, `INTERFACE_KEY_MISSING_IMPLEMENTATION_TYPE`, `INTERFACE_KEY_NOT_ON_IMPLEMENTATION`, `KEY_UNSUPPORTED_ON_INTERFACE`, `INTERFACE_OBJECT_USAGE_ERROR`;
- a `@key` on a list, an interface or a union (`KEY_FIELDS_SELECT_INVALID_TYPE`): publish checks only that its fields exist and form a valid field set;
- a graph without any query (`NO_QUERIES`), which composes empty;
- a shared field whose abstract type has different types in each subgraph (`SHAREABLE_HAS_MISMATCHED_RUNTIME_TYPES`);
- the federation linked twice (`INVALID_LINK_DIRECTIVE_USAGE`);
- an implementation that declares a field its `@interfaceObject` already brings (`INVALID_FIELD_SHARING`).

## The graph page

`/graphs/<name>` in the [Web UI](../start/run-the-broker.md#web-ui) shows, for each environment, the subgraphs deployed there with their versions, and whether they compose, with every composition error. An environment without a subgraph of the graph shows `no subgraph deployed`. A subgraph's page links to the graph of its version deployed in each environment, and a check of a consumer links the graph from its name.

## Known gaps

- The graph page composes only the deployed subgraphs. The `deployed graph: /graphs/<graph>` of a subgraph's check opens a page that can say the graph composes, while the error comes from the version under check, which only the check composes.
- A subgraph's name in the graph is its participant name. An `@override(from:)` that uses another name, such as the subgraph name of an Apollo router configuration, names no subgraph and is ignored.
- One graph that Apollo composes fails in Bidirekt: a shared field returns a union in one subgraph (`item: Result`, with `union Result = Book | Movie`) and one of its members in another (`item: Book`), and a field of the other member exists only in the second subgraph, with no `@key` to reach it (`Movie.year`). The check gives `query holder.item.year can't be resolved`.
- Composition follows Apollo Federation 2 only in part: the rules above that it does not check let a graph compose that Apollo would refuse.
