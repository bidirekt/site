---
title: Demo
description: What the petstore demo does, step by step, from a change that breaks a deployed consumer to the fix that can be deployed.
---

The demo runs the petstore example on your machine. A provider, `petstore_api`, changes its contract in a way that breaks `petstore_web`, the consumer deployed in production. `can-i-deploy` catches the break, the contract is fixed, and the next version can be deployed. It needs Docker with Docker Compose, nothing else:

```
$ curl -sL bidirekt.com/demo | sh
```

The script checks for `docker` and `docker compose`, asks where to put the example (`./petstore-example` by default; without a terminal it takes the default), downloads the current version of https://github.com/bidirekt/petstore-example there and runs its `demo.sh`. A folder that already holds the example is replaced by the current version. Any other folder that exists stops it with `<folder> exists and is not the petstore example; pick another folder.`, and nothing in it changes.

## The six steps

Each step starts with a title, `Step N of 6 — <what happens>`, and each command is typed before it runs. The example's `./bidirekt` runs the CLI in a container next to the broker, so every command it runs first prints `Broker: http://broker:8080 (from BIDIREKT_BROKER_URL)`.

1. **Start the broker**: removes what an earlier run left, starts Postgres and the broker with `docker compose up -d --wait`, and pulls the CLI image.
2. **Set up what is in production**: creates the `production` environment and the participants `petstore_api` and `petstore_web`, publishes version `1.0.0` of each from `deployed/`, and records both as deployed to `production`.
3. **Publish the proposed change**: publishes `contracts/petstore_api.yaml` as `petstore_api` `2.0.0`. Its `Pet` schema no longer has `status`.
4. **Check it**: `can-i-deploy` says `2.0.0` cannot be deployed, because `petstore_web` reads `Pet.status`.
5. **Fix the contract**: adds `status` back to `Pet`, publishes `3.0.0` and checks it again, and this time it can be deployed.
6. **Clean up**: `docker compose down -v` removes the containers and the data, and `contracts/petstore_api.yaml` goes back to the proposed change, so the demo can run again.

## The break

Step 4 checks `2.0.0` against what is deployed in production:

```
$ ./bidirekt can-i-deploy petstore_api --version 2.0.0 --environment production
Broker: http://broker:8080 (from BIDIREKT_BROKER_URL)
petstore_api 2.0.0 cannot be deployed to production

petstore_web (1.0.0, deployed):
  Pet.status — petstore_api doesn't provide it, but petstore_web reads it
    → petstore_api: provide it
    → petstore_web: stop reading it, or handle its absence in the code and mark it optional there
      · GET /pets/* response 200 at "$.status" (petstore_web: Pet.status)


The proposed change breaks petstore_web, which is deployed in production.
```

The report names the counterpart it breaks, `petstore_web` with the version deployed in production, the property, the fix on each side, and where `petstore_web` reads it. [can-i-deploy](../ship/can-i-deploy.md) explains every line of it.

## The fix

Step 5 draws a vim session on the screen, without running vim, and types the two lines of `status` under `Pet`:

```
$ vim contracts/petstore_api.yaml
 13 schemas:
 14   Pet:
 15     type: object
 16     properties:
 17       petId:
 18         type: integer
 19       name:
 20         type: string
 21       status:
 22         type: string
 23       weight:
 24         type: float
:wq
```

Then it publishes the fixed contract as `3.0.0` and checks it:

```
$ ./bidirekt publish contracts/petstore_api.yaml --participant petstore_api --version 3.0.0
Broker: http://broker:8080 (from BIDIREKT_BROKER_URL)
petstore_api contract publish successful

$ ./bidirekt can-i-deploy petstore_api --version 3.0.0 --environment production
Broker: http://broker:8080 (from BIDIREKT_BROKER_URL)
petstore_api 3.0.0 can be deployed to production
compared with: petstore_web
```

The demo ends with `docker compose down -v`.

## From a clone

The same demo runs from a clone of the example:

```
$ git clone https://github.com/bidirekt/petstore-example
$ cd petstore-example && ./demo.sh
```

## Next

To set up Bidirekt in your own project, run [Try on your project](try.md):

```
$ curl -sL bidirekt.com/try | sh
```
