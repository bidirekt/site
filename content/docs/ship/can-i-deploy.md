---
title: can-i-deploy
description: How to ask whether a version can be deployed to an environment, how to read the report, and the rule behind the answer.
---

`can-i-deploy` is the broker's answer to one question: can this version of this participant be deployed to this environment without breaking anything deployed there? To answer it, the broker takes the snapshot behind the version and compares it with every counterpart in the environment: the providers this participant consumes from and the consumers of what it provides, each read as the version currently deployed there.

The answer is yes only if every counterpart is compatible; nothing to check means yes, so a participant that only provides, with no consumer of it deployed in the environment, passes. A yes names the counterparts it compared with, or says that nothing was deployed to compare with. When the answer is no, it names every failing counterpart, with the version of it deployed in the environment, and each break: the endpoint, the method, the request or response status, and the reason. A removed endpoint is the exception: it is named once, with its method, and no request or response status. A property break is named once per field, with every endpoint, method and request or response status where it happens. A pipeline gates its deployment on this answer. The report and every line a break can carry are in [The command](#the-command).

## The command

```
$ bidirekt can-i-deploy petstore_web --version 2.3.0 --environment production
petstore_web 2.3.0 can be deployed to production
compared with: petstore_api, petstore_reviews
```

- `participant`: the participant you are about to deploy.
- `--version`: the published version you are about to deploy.
- `--environment`: where you are about to deploy it.

It exits `0` when the answer is yes and `1` when it is no; the report goes to stdout either way. A yes names, below it, the counterparts deployed in the environment that it compared with, in alphabetical order, or says there were none: `nothing deployed in production to compare with`. Errors that stop the check go to stderr: a version that was never published fails with `contract not found`, an environment that does not exist with `environment not found`, and an unknown participant with `participant not found`.

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
  Pet.weight — petstore_web reads it as string, but petstore_api provides integer (2 places)
    → petstore_web: read it as integer
    → petstore_api: provide it as string there
      · GET /pets response 200 at "$[].weight" (petstore_api: PetRecord.weight)
      · GET /pets/* response 200 at "$.weight" (petstore_api: PetRecord.weight)

petstore_reviews:
  GET /reviews/summary
    response 200:
      - petstore_web calls GET /reviews/summary, but petstore_reviews doesn't provide it
        → petstore_web: stop calling it
        → petstore_reviews: publish it
```

One block per counterpart that is not compatible, with the version of it deployed in the environment; the version is left out when it is not deployed there. Each break is one line, written from the side of `<participant>`, the participant under check, against `<counterpart>`, the counterpart it breaks. Below it come the fixes, one line per side, the fix of `<participant>` first. The breaks of an endpoint, a method, a status or a request body come first, under the endpoint and the request or response status they are about:

```
<METHOD> <endpoint>
  response <status>:
    - <break>
      → <participant>: <fix>
      → <counterpart>: <fix>
```

Then the breaks of a property, one block per field, break and fix, in alphabetical order of the field. A block holds one break: the break and its fixes once, then every place where it happens, one line per request or response status and property. ` (<N> places)` is left out when there is one place. A place line takes one of two forms, for a response or for a request:

```
<field> — <break> (<N> places)
  → <participant>: <fix>
  → <counterpart>: <fix> there
    · <METHOD> <endpoint> response <status> at "<property>" (<counterpart>: <counterpart field>)
    · <METHOD> <endpoint> request at "<property>" (<counterpart>: <counterpart field>)
```

A fix is a change in the code first, then in the contract, so that the contract keeps describing what the code does. `<counterpart field>` is the field of `<counterpart>` at that property, the place to edit in its contract, and ` there` points the fix of `<counterpart>` at it; both are left out when `<counterpart>` has no field there. Every break and its fixes:

#### `<participant> reads it, but <counterpart> doesn't provide it`

Response: the participant requires a property the provider does not declare, inside a parent the provider declares.

- Fix of `<participant>`: `stop reading it, or handle its absence in the code and mark it optional`
- Fix of `<counterpart>`: `provide it`

#### `<participant> doesn't provide it, but <counterpart> reads it`

Response: the consumer requires a property the participant does not declare, inside a parent the participant declares.

- Fix of `<participant>`: `provide it`
- Fix of `<counterpart>`: `stop reading it, or handle its absence in the code and mark it optional there`

#### `<participant> requires it, but <counterpart> only sometimes provides it`

Response: the participant requires a property the provider marks optional.

- Fix of `<participant>`: `handle its absence in the code, then mark it optional`
- Fix of `<counterpart>`: `always provide it there`

#### `<participant> provides it only sometimes, but <counterpart> requires it`

Response: the consumer requires a property the participant marks optional.

- Fix of `<participant>`: `always provide it`
- Fix of `<counterpart>`: `handle its absence in the code, then mark it optional there`

#### `<participant> doesn't send it, but <counterpart> requires it`

Request: the provider requires a property the participant does not send, inside a parent the participant sends.

- Fix of `<participant>`: `send it`
- Fix of `<counterpart>`: `stop requiring it, then mark it optional there`

#### `<participant> requires it, but <counterpart> doesn't send it`

Request: the participant requires a property the consumer does not send, inside a parent the consumer sends.

- Fix of `<participant>`: `stop requiring it, then mark it optional`
- Fix of `<counterpart>`: `send it`

#### `<participant> sends it only sometimes, but <counterpart> requires it`

Request: the provider requires a property the participant marks optional.

- Fix of `<participant>`: `always send it`
- Fix of `<counterpart>`: `handle its absence in the code, then mark it optional there`

#### `<participant> requires it, but <counterpart> sends it only sometimes`

Request: the participant requires a property the consumer marks optional.

- Fix of `<participant>`: `handle its absence in the code, then mark it optional`
- Fix of `<counterpart>`: `always send it there`

#### `<participant> reads it as <type>, but <counterpart> provides <counterpart type>`

Response: the participant reads the property as a type that does not accept the type the provider declares.

- Fix of `<participant>`: `read it as <counterpart type>`
- Fix of `<counterpart>`: `provide it as <type> there`

#### `<participant> provides it as <type>, but <counterpart> reads <counterpart type>`

Response: the consumer reads the property as a type that does not accept the type the participant declares.

- Fix of `<participant>`: `provide it as <counterpart type>`
- Fix of `<counterpart>`: `read it as <type> there`

#### `<participant> sends it as <type>, but <counterpart> expects <counterpart type>`

Request: the provider expects the property as a type that does not accept the type the participant sends.

- Fix of `<participant>`: `send <counterpart type>`
- Fix of `<counterpart>`: `accept <type> there`

#### `<participant> expects it as <type>, but <counterpart> sends <counterpart type>`

Request: the participant expects the property as a type that does not accept the type the consumer sends.

- Fix of `<participant>`: `accept <counterpart type>`
- Fix of `<counterpart>`: `send <type> there`

#### `<participant> doesn't accept null, but <counterpart> may provide null`

Response: the provider marks the property nullable and the participant does not.

- Fix of `<participant>`: `handle null in the code, then mark it nullable`
- Fix of `<counterpart>`: `stop providing null there`

#### `<participant> may provide null, but <counterpart> doesn't accept it`

Response: the participant marks the property nullable and the consumer does not.

- Fix of `<participant>`: `stop providing null`
- Fix of `<counterpart>`: `handle null in the code, then mark it nullable there`

#### `<participant> may send null, but <counterpart> doesn't accept it`

Request: the participant marks the property nullable and the provider does not.

- Fix of `<participant>`: `stop sending null`
- Fix of `<counterpart>`: `handle null in the code, then mark it nullable there`

#### `<participant> doesn't accept null, but <counterpart> may send it`

Request: the consumer marks the property nullable and the participant does not.

- Fix of `<participant>`: `handle null in the code, then mark it nullable`
- Fix of `<counterpart>`: `stop sending null there`

#### `<participant> calls <METHOD> <endpoint>, but <counterpart> doesn't provide it`

The participant names an endpoint or method that no published contract of the provider declares, or a provider that does not exist.

- Fix of `<participant>`: `stop calling it`
- Fix of `<counterpart>`: `publish it`

#### `<participant> reads response <status>, but <counterpart> answers only <statuses>`

Response: the provider declares the endpoint and method, but not that status; `<statuses>` are the ones it declares, such as `201, 204 or 404`.

- Fix of `<participant>`: `read response <statuses>`
- Fix of `<counterpart>`: `answer <status>`

#### `<participant> reads response <status>, but <counterpart> declares no response`

Response: the provider declares the endpoint and method with no response at all.

- Fix of `<participant>`: `stop reading it`
- Fix of `<counterpart>`: `answer <status>`

#### `<participant> sends a request body, but <counterpart> declares none`

Request: the provider declares the endpoint and method with no `request`.

- Fix of `<participant>`: `stop sending it`
- Fix of `<counterpart>`: `accept a request body`

#### `<participant> calls <METHOD> <endpoint>, but <counterpart> is not deployed in <environment> (deployed in: <environments>)`

The provider is not deployed in the target environment; the parenthesis is left out when it is deployed nowhere.

- Fix of `<participant>`: none
- Fix of `<counterpart>`: `deploy it to <environment> first`

#### `<participant> removed <METHOD> <endpoint>, but <counterpart> still calls it`

The participant dropped a resource that a consumer deployed in the environment still consumes; printed once, right below `<METHOD> <endpoint>`.

- Fix of `<participant>`: `keep it until <counterpart> stops calling it`
- Fix of `<counterpart>`: `stop calling it`

A removed endpoint is reported once, right below `<METHOD> <endpoint>`, not under each request and response status it had. Any other break of that endpoint stays under its body or in its block:

```error title="can-i-deploy output"
petstore_web (2.3.0, deployed):
  POST /pets
    - petstore_api removed POST /pets, but petstore_web still calls it
      → petstore_api: keep it until petstore_web stops calling it
      → petstore_web: stop calling it
```

When the provider declares the endpoint and method but not the status the participant reads, or no request body, the break says what is missing and which statuses the provider answers, instead of `doesn't provide it`. A status only the provider declares obliges no consumer:

```error title="can-i-deploy output"
petstore_api (1.4.0, deployed):
  POST /files
    request:
      - petstore_web sends a request body, but petstore_api declares none
        → petstore_web: stop sending it
        → petstore_api: accept a request body
  POST /pets/*/adopt
    response 200:
      - petstore_web reads response 200, but petstore_api answers only 204
        → petstore_web: read response 204
        → petstore_api: answer 200
```

A property is only required where its parent is present. When the producing side does not declare a parent, only the parent can break, and only if it is required; its members, array items and map values are never reported on their own. The body itself has no parent, so it is always compared.

`<property>` is written from the root of the body: `$.owner.name` for a member, `$[].photoUrl` for a member of each array item, `$.pets{}.name` for a member of each map value; the root itself prints as `the body`, without quotes. An array type prints its item type, such as `array<object>`, and a map type its value type, such as `map<object>`.

`<field>` is the field of `<participant>` at that path: the schema name and the path inside that schema, the place to edit in the participant's own contract. `Pet.vaccinations[].name` is a member of each array item, `Pets{}.name` a member of each map value, and at the root it is only the schema name:

```error title="can-i-deploy output"
Address.city — petstore_web reads it, but petstore_api doesn't provide it
  → petstore_web: stop reading it, or handle its absence in the code and mark it optional
  → petstore_api: provide it
    · GET /pets/* response 200 at "$.owner.address.city"
Pet — petstore_web reads it as object, but petstore_api provides array<object>
  → petstore_web: read it as array<object>
  → petstore_api: provide it as object there
    · GET /owners/*/pet response 200 at the body (petstore_api: PetRecords)
```

When `<participant>` has no field at that path, as in the `doesn't provide` and `doesn't send` blocks, the block is named by the field of `<counterpart>`. A difference inside a schema used in several places is one block with its places, one for each request or each response status that reaches it; `<property>` is one of the properties that reach it there. A block holds only requests or only responses: the same difference in a request and in a response is two blocks, each with its own break and fixes. Which side's required properties count is in [Which side decides](#which-side-decides).

## Which side decides

Every comparison follows one rule: the side that reads a body decides what must be in it. In a response the provider produces the body and the consumer reads it; in a request the consumer produces it and the provider reads it. A property the reader requires must be declared by the producer, required too and with a type the reader accepts: the same type, or `integer`, `float` or `number` when the reader declares `number`. A property is required only where its parent is present: when the producer does not declare a parent, only the parent can break, and nothing inside it is checked, array items and map values included. A property the reader marks optional may be absent, but if both sides declare it the reader must accept its type. A property the producer marks nullable must be nullable for the reader too. A property the reader does not declare is not checked.

Four breaks come before any property is compared, because there is nothing to compare yet:

- the consumer names an endpoint or method that no published contract of the provider declares, or a provider that does not exist;
- the provider declares the endpoint and method, but not the response status the consumer reads, or no request body where the consumer sends one;
- the provider has published the resource but is not deployed in the environment;
- the provider under check no longer declares a resource that a consumer deployed in the environment still consumes.
