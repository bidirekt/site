---
title: validate
description: How to check contract files against an environment before you commit, without publishing them.
---

```
$ bidirekt validate contracts/*.yaml --participant petstore_web --environment production
petstore_web local contract can be deployed to production
compared with: petstore_api, petstore_reviews
```

- `file or folder...`: one or more contract files or folders, the same ones [`publish`](publish.md) takes.
- `--participant`: the participant the files belong to.
- `--environment`: the environment to check against.

It answers, before you commit, what `can-i-deploy` would answer after a publish: the files are checked as `publish` checks them, then compared with every counterpart deployed in the environment. Nothing is stored: no version, no check.

It exits `0` when the answer is yes and `1` when it is no; the report goes to stdout either way, with the same lines as [`can-i-deploy`](can-i-deploy.md), including the line that names what it compared with:

```
$ bidirekt validate contracts/*.yaml --participant petstore_web --environment production
petstore_web local contract cannot be deployed to production

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

Errors that stop the check go to stderr. The participant and the environment are checked before any file: an unknown participant fails with `participant "petstore_web" not found → create it with: bidirekt create-participant petstore_web`, an environment that does not exist with `cannot validate contract on broker: environment not found`. Then a file that breaks the [contract format](../reference/file-format.md) prints its violations as [`publish`](publish.md) does.
