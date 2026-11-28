---
title: GraphQL breaks
description: How the report shows a GraphQL break, the breaks of a field that come before any property is compared, the property breaks of GraphQL, and the fixes of each.
---

A GraphQL break is about one field of the query or the mutation root, named by its operation and field, as `query pet`. Six breaks come before any property is compared, because there is nothing to compare yet. The first three come when the consumer is under check, the last three when the provider is:

- the consumer calls a field that the provider's version deployed in the environment does not declare;
- the provider the consumer names is not deployed in the environment, or, for a graph, no subgraph of it is;
- the graph the consumer calls does not compose in the environment ([Graphs](graphs.md));
- the provider under check no longer declares a field that a consumer deployed in the environment still calls;
- the same, where the field leaves a graph because of the subgraph under check;
- the subgraph under check makes its graph fail to compose, and a deployed consumer calls the graph.

Then come the breaks of a property, in the arguments or in what a field returns ([Property breaks](#property-breaks)).

## In the report

In a counterpart's block of the [report](../ship/can-i-deploy.md#the-report), the breaks of a field come first, under the operation and the field, one break per line:

```
<operation> <field>
  - <break>
    → <participant>: <fix>
    → <counterpart>: <fix>
```

The property blocks that follow name each place where a break happens with one of three forms: in what a field returns, in the arguments of a root field, or in the arguments of a field nested in what it returns:

```
· <operation> <field> returns at "<property>" (<counterpart>: <counterpart field>)
· <operation> <field> arguments (argument "<argument>") (<counterpart>: <counterpart field>)
· <operation> <field> returns at "<property>" (argument "<argument>") (<counterpart>: <counterpart field>)
```

`<property>` is written from the root of what the field returns, as in REST, and the root itself is `"$"`. `<argument>` is the argument, or the path inside it for a field of an input, as `filter.minStars`. A field of the provider's schema is named by its GraphQL coordinate: `Pet.name`, `Query.pet(id:)` for the argument `id` of `pet`, `Pet.reviews(first:)` for the argument `first` of `reviews`, and `Query.pet` at the root of what `pet` returns. A field of the consumer's schema is named the same way at a root field, `Query.pet(owner:)` for an argument of `pet` and `Query.pet` for what `pet` returns, and by its schema below it: `Pet.name`, `ReviewsArgs.first`.

Types are written as GraphQL writes them, with the nullability: `[String!]!`, `Int`, `ID`, `DateTime!`. A type the consumer reads is written with the name of its schema when it is an object, a union, a map or an enum, as `PetRead!`, and one written in place, without a schema of its own, with its values: `enum (AVAILABLE | SOLD)!`. A primitive the consumer writes takes its GraphQL name: `string` is `String`, `integer` is `Int`, `number` is `Float`.

With `petstore_web 2.3.0` under check, calling a field that `petstore_api` doesn't provide and sending two arguments it doesn't accept, one to `pet` and one to the nested `reviews`:

```error title="can-i-deploy output"
petstore_api (1.4.0, deployed):
  query owner
    - petstore_web calls query owner, but petstore_api doesn't provide it
      → petstore_web: stop calling it
      → petstore_api: publish it
  Query.pet(owner:) — petstore_web sends it, but petstore_api doesn't accept it
    → petstore_web: stop sending it
    → petstore_api: accept it
      · query pet arguments (argument "owner")
  ReviewsArgs.first — petstore_web sends it, but petstore_api doesn't accept it
    → petstore_web: stop sending it
    → petstore_api: accept it
      · query pet returns at "$.reviews" (argument "first")
```

With `petstore_api 1.5.0` under check, which drops `pets`, makes `Pet.name` nullable and changes the type of the argument `id` from `ID!` to `String!`:

```error title="can-i-deploy output"
petstore_web (2.3.0, deployed):
  query pets
    - petstore_api removed query pets, but petstore_web still calls it
      → petstore_api: keep it until petstore_web stops calling it
      → petstore_web: stop calling it
  Pet.name — petstore_api may provide null, but petstore_web doesn't accept it
    → petstore_api: stop providing null
    → petstore_web: handle null in the code, then mark it nullable there
      · query pet returns at "$.name" (petstore_web: Pet.name)
  Query.pet(id:) — petstore_api expects it as String, but petstore_web sends ID
    → petstore_api: accept ID
    → petstore_web: send String there
      · query pet arguments (argument "id") (petstore_web: Query.pet(id:))
```

The last block is a change of a named input type ([How types compare](resources.md#how-types-compare)): `petstore_web` sends `id` as `ID`, the type the deployed `petstore_api` declares, and the new version declares it as `String`: a named input type that changes is a different type, even when it accepts the same values. This break prints the bare type names, `ID` and `String`, without `!`.

In the check of a subgraph, a break that comes through the graph names the subgraph with ` (via <graph>)`, and its fix names the subgraph alone:

```error title="can-i-deploy output"
petstore_web (2.3.0, deployed):
  Pet.reviews — petstore_reviews (via petstore_graph) provides it as String!, but petstore_web reads [String!]!
    → petstore_reviews: provide it as [String!]!
    → petstore_web: read it as String! there
      · query pet returns at "$.reviews" (petstore_web: Pet.reviews)
```

## Every break

### `<participant> calls <operation> <field>, but <counterpart> doesn't provide it`

The participant calls a field that the provider's version deployed in the environment does not declare, or, for a graph, that the graph composed in the environment does not resolve.

- Fix of `<participant>`: `stop calling it`
- Fix of `<counterpart>`: `publish it`

### `<participant> calls <operation> <field>, but <counterpart> is not deployed in <environment>`

The provider has no deployment in the target environment, whatever it published. A provider name misspelled under `consumes` publishes fine and fails here. When `<counterpart>` is a graph, no subgraph of it is deployed in the environment, and its block has no version: `petstore_graph:`.

- Fix of `<participant>`: none
- Fix of `<counterpart>`: `deploy it to <environment> first`, or `deploy a subgraph of it to <environment> first` for a graph

### `<participant> calls <operation> <field>, but <graph> can't be built in <environment>`

The subgraphs of the graph deployed in the environment do not compose. The lines under the break list every composition error, one per line, such as `petstore_api 1.4.0 and petstore_reviews 2.0.0 both resolve Pet.name without @shareable` ([Composition](graphs.md#composition)), and the last one links the graph page. One break per field the participant calls:

```error title="can-i-deploy output"
    - petstore_web calls query pet, but petstore_graph can't be built in production
      petstore_api 1.4.0 and petstore_orders 1.0.0 both resolve Money.amount without @shareable
      petstore_api 1.4.0 and petstore_orders 1.0.0 both resolve Money.currency without @shareable
      → petstore_graph subgraphs: make it compose
      deployed graph: /graphs/petstore_graph
```

- Fix: `<graph> subgraphs: make it compose`

### `<participant> removed <operation> <field>, but <counterpart> still calls it`

The participant no longer declares the field, and a consumer deployed in the environment still calls it. In the check of a subgraph, `<participant> (via <graph>) removed <operation> <field>, but <counterpart> still calls it` says that the field left the graph because of the participant, and the consumer calls it through the graph.

- Fix of `<participant>`: `keep it until <counterpart> stops calling it`
- Fix of `<counterpart>`: `stop calling it`

### `<participant> (via <graph>) makes <graph> fail to compose in <environment>, and <counterpart> calls <operation> <field>`

The subgraph under check makes the graph fail to compose in the environment, where it composes with the subgraph's deployed version, or without it. A consumer deployed there calls the graph. The lines under the break list every composition error and link the graph page, as above.

- Fix of `<participant>`: `make <graph> compose`

## Property breaks

The property breaks of GraphQL follow [Property breaks](../ship/property-breaks.md), with two differences. A field read that the provider does not have is fixed only by no longer reading it, since in GraphQL `optional` does not make a missing field safe. And because input is closed, an argument the provider does not accept is a break. A break in an argument uses the lines of the arguments, also when it is the argument of a nested field and its place says `returns`.

`<participant>` is the participant under check and `<counterpart>` the counterpart it breaks; a fix of `<counterpart>` ends with ` there` when the places name its field.

### In what a field returns

#### `<participant> reads it, but <counterpart> doesn't provide it`

- Fix of `<participant>`: `stop reading it`
- Fix of `<counterpart>`: `provide it`

#### `<participant> doesn't provide it, but <counterpart> reads it`

- Fix of `<participant>`: `provide it`
- Fix of `<counterpart>`: `stop reading it`

#### `<participant> reads it as <type>, but <counterpart> provides <counterpart type>`

- Fix of `<participant>`: `read it as <counterpart type>`
- Fix of `<counterpart>`: `provide it as <type>`

#### `<participant> provides it as <type>, but <counterpart> reads <counterpart type>`

- Fix of `<participant>`: `provide it as <counterpart type>`
- Fix of `<counterpart>`: `read it as <type>`

#### `<participant> doesn't accept null, but <counterpart> may provide null`

- Fix of `<participant>`: `handle null in the code, then mark it nullable`
- Fix of `<counterpart>`: `stop providing null`

#### `<participant> may provide null, but <counterpart> doesn't accept it`

- Fix of `<participant>`: `stop providing null`
- Fix of `<counterpart>`: `handle null in the code, then mark it nullable`

#### `<participant> reads "<member>", but <counterpart> doesn't provide it`

`<member>` is an enum value, or a union member named by its type.

- Fix of `<participant>`: `stop reading "<member>"`
- Fix of `<counterpart>`: `provide "<member>"`

#### `<participant> doesn't provide "<member>", but <counterpart> reads it`

- Fix of `<participant>`: `provide "<member>"`
- Fix of `<counterpart>`: `stop reading "<member>"`

### In the arguments

#### `<participant> sends it, but <counterpart> doesn't accept it`

The consumer sends an argument or an input field that the provider does not declare, even an optional one.

- Fix of `<participant>`: `stop sending it`
- Fix of `<counterpart>`: `accept it`

#### `<participant> doesn't accept it, but <counterpart> sends it`

- Fix of `<participant>`: `accept it`
- Fix of `<counterpart>`: `stop sending it`

#### `<participant> doesn't send it, but <counterpart> requires it`

- Fix of `<participant>`: `send it`
- Fix of `<counterpart>`: `stop requiring it, then mark it optional`

#### `<participant> requires it, but <counterpart> doesn't send it`

A new required argument, such as `pets(limit: Int!)` or `reviews(first: Int!)`, against a consumer that does not send it.

- Fix of `<participant>`: `stop requiring it, then mark it optional`
- Fix of `<counterpart>`: `send it`

#### `<participant> sends it only sometimes, but <counterpart> requires it`

- Fix of `<participant>`: `always send it`
- Fix of `<counterpart>`: `handle its absence in the code, then mark it optional`

#### `<participant> requires it, but <counterpart> sends it only sometimes`

- Fix of `<participant>`: `handle its absence in the code, then mark it optional`
- Fix of `<counterpart>`: `always send it`

#### `<participant> sends it as <type>, but <counterpart> expects <counterpart type>`

- Fix of `<participant>`: `send <counterpart type>`
- Fix of `<counterpart>`: `accept <type>`

#### `<participant> expects it as <type>, but <counterpart> sends <counterpart type>`

Also the change of a named input type, such as `ID` to `String`, in the check of the provider.

- Fix of `<participant>`: `accept <counterpart type>`
- Fix of `<counterpart>`: `send <type>`

#### `<participant> may send null, but <counterpart> doesn't accept it`

- Fix of `<participant>`: `stop sending null`
- Fix of `<counterpart>`: `handle null in the code, then mark it nullable`

#### `<participant> doesn't accept null, but <counterpart> may send it`

An argument that becomes non-null, against a consumer that may send `null`.

- Fix of `<participant>`: `handle null in the code, then mark it nullable`
- Fix of `<counterpart>`: `stop sending null`

#### `<participant> sends "<member>", but <counterpart> doesn't accept it`

- Fix of `<participant>`: `stop sending "<member>"`
- Fix of `<counterpart>`: `accept "<member>"`

#### `<participant> doesn't accept "<member>", but <counterpart> sends it`

- Fix of `<participant>`: `accept "<member>"`
- Fix of `<counterpart>`: `stop sending "<member>"`
