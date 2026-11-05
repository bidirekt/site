---
title: Resource breaks
description: The breaks of a REST resource that come before any property is compared, how the report shows them, and their fixes.
---

Nine breaks come before any property is compared, because there is nothing to compare yet. The first five come when the consumer is under check, the last four when the provider is:

- the consumer names an endpoint or method that the provider's version deployed in the environment does not declare (its latest published version, when it is not deployed there), or a provider that does not exist;
- the provider declares the endpoint and method, but not the response status the consumer reads;
- the provider declares the endpoint and method, but no response at all where the consumer reads one;
- the provider declares the endpoint and method, but no request body where the consumer sends one;
- the provider's latest published version declares the resource, but the provider is not deployed in the environment;
- the provider under check no longer declares an endpoint and method that a consumer deployed in the environment still calls;
- the provider under check no longer answers a status that a deployed consumer still reads, but answers others on that endpoint and method;
- the provider under check no longer answers any status on an endpoint and method it still declares, where a deployed consumer still reads one;
- the provider under check no longer accepts a request body on an endpoint and method it still declares, where a deployed consumer still sends one.

## In the report

In a counterpart's block of the [report](../ship/can-i-deploy.md#the-report), the breaks of an endpoint, a method, a status or a request body come first, under the endpoint and the request or response status they are about:

```
<METHOD> <endpoint>
  response <status>:
    - <break>
      → <participant>: <fix>
      → <counterpart>: <fix>
```

The property blocks that follow name each place where a break happens with one of two forms, for a response or for a request:

```
· <METHOD> <endpoint> response <status> at "<property>" (<counterpart>: <counterpart field>)
· <METHOD> <endpoint> request at "<property>" (<counterpart>: <counterpart field>)
```

An endpoint and method removed entirely are reported once in each consumer's block, right below `<METHOD> <endpoint>`, not under each request and response status that consumer uses ([what counts as removed](#participant-removed-method-endpoint-but-counterpart-still-calls-it)). A status or request body dropped from an endpoint and method that stay is reported under its own `response <status>:` or `request:`. Any other break of that endpoint stays under its body or in its block:

```error title="can-i-deploy output"
petstore_web (2.3.0, deployed):
  POST /pets
    - petstore_api removed POST /pets, but petstore_web still calls it
      → petstore_api: keep it until petstore_web stops calling it
      → petstore_web: stop calling it
```

When the provider declares the endpoint and method but not the status the participant reads, no response at all, or no request body, the break says what is missing, and for a missing status which statuses the provider answers, instead of `doesn't provide it` ([Which statuses to declare](resources.md#which-statuses-to-declare) says which statuses oblige a consumer):

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

## Every break

#### `<participant> calls <METHOD> <endpoint>, but <counterpart> doesn't provide it`

The participant names an endpoint or method that the provider's version deployed in the environment does not declare, or a provider that does not exist. When the provider is not deployed in the environment, its latest published version is the one that does not declare it. The counterpart's block shows the deployed version, such as `petstore_api (1.4.0, deployed):`, and no version when the provider is not deployed there. A provider name misspelled under `consumes`, such as `petstore_apl` for `petstore_api`, publishes fine and fails here with `petstore_web calls GET /pets/*, but petstore_apl doesn't provide it`.

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

The provider's latest published version declares the endpoint and method, but the provider is not deployed in the target environment; the parenthesis is left out when it is deployed nowhere.

- Fix of `<participant>`: none
- Fix of `<counterpart>`: `deploy it to <environment> first`

#### `<participant> removed <METHOD> <endpoint>, but <counterpart> still calls it`

The participant no longer declares the endpoint and method at all, and a consumer deployed in the environment still calls them. When the endpoint and method stay but a status or the request body the consumer uses is gone, the break is one of the three below instead.

- Fix of `<participant>`: `keep it until <counterpart> stops calling it`
- Fix of `<counterpart>`: `stop calling it`

#### `<participant> now answers <METHOD> <endpoint> only with <statuses>, but <counterpart> still reads response <status>`

Response: the participant still declares the endpoint and method, but no longer answers the status that a deployed consumer reads; `<statuses>` are the ones it answers now, such as `201, 204 or 404`. A provider that answers `DELETE /pets/*` with `204:` instead of `200: Pet`, while `petstore_web` still reads response `200`, gets `petstore_api now answers DELETE /pets/* only with 204, but petstore_web still reads response 200`.

- Fix of `<participant>`: `keep answering <status> until <counterpart> stops reading it`
- Fix of `<counterpart>`: `read response <statuses>`

#### `<participant> no longer answers <METHOD> <endpoint>, but <counterpart> still reads response <status>`

Response: the participant still declares the endpoint and method, with a request but no response at all, and a deployed consumer still reads one.

- Fix of `<participant>`: `keep answering <status> until <counterpart> stops reading it`
- Fix of `<counterpart>`: `stop reading it`

#### `<participant> dropped the request body of <METHOD> <endpoint>, but <counterpart> still sends it`

Request: the participant still declares the endpoint and method, but with no `request`, and a deployed consumer still sends one.

- Fix of `<participant>`: `keep accepting it until <counterpart> stops sending it`
- Fix of `<counterpart>`: `stop sending it`
