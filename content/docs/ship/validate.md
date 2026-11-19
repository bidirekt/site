---
title: validate
description: How to check contract files before you commit, and optionally compare them with an environment, without publishing them.
---

```
$ bidirekt validate contracts/*.yaml
contract is valid; add --participant and --environment to compare it with what is deployed
```

- `file or folder...`: one or more contract files or folders, the same ones [`publish`](publish.md) takes.

Without `--participant` and `--environment`, it only checks the files, as `publish` checks them: it compares nothing and stores nothing. When they pass, it prints the line above on stdout and exits `0`. When a file breaks the [contract format](../contracts/the-contract-file.md#file-rules), it prints the violations on stderr, as [`publish`](publish.md) does, and exits `1`.

With `--participant` and `--environment`, it also compares the files with what is deployed in the environment:

```
$ bidirekt validate contracts/*.yaml --participant petstore_web --environment production
petstore_web local contract can be deployed to production
compared with: petstore_api, petstore_reviews
```

- `--participant`: the participant the files belong to.
- `--environment`: the environment to check against.

The two flags go together: `--participant` without `--environment` fails with `if any flags in the group [participant environment] are set they must all be set; missing [environment]`, and the reverse with `missing [participant]`. An empty value, as in `--environment ""`, fails with `--environment cannot be empty`, so a pipeline whose variable is empty fails instead of skipping the comparison. In both cases nothing is sent to the broker.

It answers, before you commit, what `can-i-deploy` would answer after a publish: the files are checked as `publish` checks them, then compared with every counterpart deployed in the environment. Nothing is stored: no version, no check.

It exits `0` when the answer is yes and `1` when it is no; the report goes to stdout either way. It is the [report of `can-i-deploy`](can-i-deploy.md#the-report), including the line that names what it compared with, with `local contract` in place of the version: `petstore_web local contract cannot be deployed to production`.

Errors that stop the check go to stderr. The participant and the environment are checked before any file: an unknown participant fails with `participant "petstore_web" not found → create it with: bidirekt create-participant petstore_web`, an environment that does not exist with `cannot validate contract on broker: environment not found`. Then a file that breaks the [contract format](../contracts/the-contract-file.md#file-rules) prints its violations as [`publish`](publish.md) does.
