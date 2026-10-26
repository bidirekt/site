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

It exits `0` when the answer is yes and `1` when it is no; the report goes to stdout either way. It is the [report of `can-i-deploy`](can-i-deploy.md#the-report), including the line that names what it compared with, with `local contract` in place of the version: `petstore_web local contract cannot be deployed to production`.

Errors that stop the check go to stderr. The participant and the environment are checked before any file: an unknown participant fails with `participant "petstore_web" not found → create it with: bidirekt create-participant petstore_web`, an environment that does not exist with `cannot validate contract on broker: environment not found`. Then a file that breaks the [contract format](../contracts/the-contract-file.md#file-rules) prints its violations as [`publish`](publish.md) does.
