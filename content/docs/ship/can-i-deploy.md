---
title: can-i-deploy
description: How to ask whether a version can be deployed to an environment, how to read the report, and how to read a property block.
---

`can-i-deploy` is the broker's answer to one question: can this version of this participant be deployed to this environment without breaking anything deployed there? To answer it, the broker takes the [snapshot](../concepts/how-the-broker-works.md#snapshot) behind the version and compares it with every [counterpart](../concepts/how-the-broker-works.md#counterpart) in the environment.

The answer is yes only if every counterpart is compatible; nothing to check means yes, so a participant that only provides, with no consumer of it deployed in the environment, passes. A yes names the counterparts it compared with, or says that nothing was deployed to compare with. When the answer is no, it names every failing counterpart, with the version of it deployed in the environment, and each break, under the resource it is about, with the reason. A property break is named once per field, with every resource where it happens. A pipeline gates its deployment on this answer.

## The command

```
$ bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production
petstore_web 2.3.0 can be deployed to production
compared with: petstore_api, petstore_reviews
```

- `participant`: the participant you are about to deploy.
- `--version`: the published version you are about to deploy.
- `--environment`: where you are about to deploy it.

It exits `0` when the answer is yes and `1` when it is no; the report goes to stdout either way. A yes names, below it, the counterparts deployed in the environment that it compared with, in alphabetical order, or says there were none: `nothing deployed in production to compare with`. Errors that stop the check go to stderr, checked in this order: an unknown participant fails with `cannot query can-i-deploy from broker: participant not found`, a version that was never published with `cannot query can-i-deploy from broker: contract not found`, and an environment that does not exist with `cannot query can-i-deploy from broker: environment not found`.

## The report

```
$ bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production
petstore_web 2.3.0 cannot be deployed to production

petstore_api (1.4.0, deployed):
  POST /pets/*/adopt
    response 200:
      - petstore_web reads response 200, but petstore_api answers only 204
        → petstore_web: read response 204
        → petstore_api: answer 200
  Pet.status — petstore_web reads it, but petstore_api doesn't provide it (2 places)
    → petstore_web: stop reading it, or handle its absence in the code and mark it optional
    → petstore_api: provide it
      · GET /pets response 200 at "$[].status"
      · GET /pets/* response 200 at "$.status"
  Pet.weight — petstore_web reads it as string, but petstore_api provides float (2 places)
    → petstore_web: read it as float
    → petstore_api: provide it as string there
      · GET /pets response 200 at "$[].weight" (petstore_api: Pet.weight)
      · GET /pets/* response 200 at "$.weight" (petstore_api: Pet.weight)

petstore_reviews:
  GET /reviews/summary
    response 200:
      - petstore_web calls GET /reviews/summary, but petstore_reviews doesn't provide it
        → petstore_web: stop calling it
        → petstore_reviews: publish it
```

One block per counterpart that is not compatible, with the version of it deployed in the environment; the version is left out when it is not deployed there. Each break is one line, written from the side of `<participant>`, the participant under check, against `<counterpart>`, the counterpart it breaks. Below it come the fixes, one line per side, the fix of `<participant>` first. The breaks of a resource come first, under the resource they are about ([REST: Resource breaks](../rest/breaks.md)).

Then the breaks of a property, one block per field, break and fix, in alphabetical order of the field. A block holds one break: the break and its fixes once, then every place where it happens, one line per resource and property. ` (<N> places)` is left out when there is one place:

```
<field> — <break> (<N> places)
  → <participant>: <fix>
  → <counterpart>: <fix> there
    · <resource> at "<property>" (<counterpart>: <counterpart field>)
```

A fix is a change in the code first, then in the contract, so that the contract keeps describing what the code does. `<counterpart field>` is the field of `<counterpart>` at that property, the place to edit in its contract, and ` there` points the fix of `<counterpart>` at it; both are left out when `<counterpart>` has no field there. `<resource>` is the resource as its kind writes it ([REST: Resource breaks](../rest/breaks.md#in-the-report)). Every property break and its fixes are in [Property breaks](property-breaks.md).

## Reading a property block

`<property>` is written from the root of the body: `$.owner.name` for a member, `$[].photoUrl` for a member of each array item, `$.pets{}.name` for a member of each map value; the root itself prints as `the body`, without quotes. An array type prints its item type, such as `array<object>`, and a map type its value type, such as `map<object>`.

`<field>` is the field of `<participant>` at that path: the schema name and the path inside that schema, the place to edit in the participant's own contract. `Pet.vaccinations[].name` is a member of each array item, `PetsByName{}.name` a member of each map value, and at the root it is only the schema name:

```error title="can-i-deploy output"
Owner.address.city — petstore_web reads it, but petstore_api doesn't provide it
  → petstore_web: stop reading it, or handle its absence in the code and mark it optional
  → petstore_api: provide it
    · GET /pets/* response 200 at "$.owner.address.city"
Pet — petstore_web reads it as object, but petstore_api provides array<object>
  → petstore_web: read it as array<object>
  → petstore_api: provide it as object there
    · GET /owners/*/pet response 200 at the body (petstore_api: Pets)
```

When `<participant>` has no field at that path, as in the `doesn't provide` and `doesn't send` blocks, the block is named by the field of `<counterpart>`. A difference inside a schema used in several places is one block with its places, one per resource that reaches it; `<property>` is one of the properties that reach it there. A block holds only bodies the provider produces or only bodies the consumer produces: the same difference in one of each is two blocks, each with its own break and fixes. Which side's required properties count is in [Which side decides](../contracts/which-side-decides.md).
