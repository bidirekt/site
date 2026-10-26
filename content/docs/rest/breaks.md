---
title: Resource breaks
description: The breaks of a REST resource that come before any property is compared, how the report shows them, and their fixes.
---

Six breaks come before any property is compared, because there is nothing to compare yet. The first five come when the consumer is under check, the last when the provider is:

- the consumer names an endpoint or method that no published contract of the provider declares, or a provider that does not exist;
- the provider declares the endpoint and method, but not the response status the consumer reads;
- the provider declares the endpoint and method, but no response at all where the consumer reads one;
- the provider declares the endpoint and method, but no request body where the consumer sends one;
- the provider has published the resource but is not deployed in the environment;
- the provider under check no longer declares a resource that a consumer deployed in the environment still consumes.

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

A removed resource is reported once, right below `<METHOD> <endpoint>`, not under each request and response status it had ([what counts as removed](#participant-removed-method-endpoint-but-counterpart-still-calls-it)). Any other break of that endpoint stays under its body or in its block:

```error title="can-i-deploy output"
petstore_web (2.3.0, deployed):
  POST /pets
    - petstore_api removed POST /pets, but petstore_web still calls it
      → petstore_api: keep it until petstore_web stops calling it
      → petstore_web: stop calling it
```

When the provider declares the endpoint and method but not the status the participant reads, or no request body, the break says what is missing and which statuses the provider answers, instead of `doesn't provide it` ([Which statuses to declare](resources.md#which-statuses-to-declare) says which statuses oblige a consumer):

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

The participant names an endpoint or method that no published contract of the provider declares, or a provider that does not exist. A provider name misspelled under `consumes`, such as `petstore_apl` for `petstore_api`, publishes fine and fails here with `petstore_web calls GET /pets/*, but petstore_apl doesn't provide it`.

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

The participant dropped a resource that a consumer deployed in the environment still consumes. Dropping a `request` that the consumer sends, or a status that it reads, is a removal too, even when the endpoint stays declared, and so is a status that changes: a provider that answers `DELETE /pets/*` with `204:` instead of `200: Pet`, while `petstore_web` still reads response `200`, gets `petstore_api removed DELETE /pets/*, but petstore_web still calls it`.

- Fix of `<participant>`: `keep it until <counterpart> stops calling it`
- Fix of `<counterpart>`: `stop calling it`
