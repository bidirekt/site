---
title: publish
description: How to publish one or more contract files as a version of a participant.
---

```
$ bidirekt publish contracts/*.yaml --participant petstore_api --version 1.4.0
petstore_api contract publish successful
```

- `file or folder...`: one or more contract files, `.yaml` or `.yml`, or folders that hold them. All of them publish together as one contract ([Several files](../contracts/several-files.md)); the shell expands globs.
- `--participant`: the participant the contract belongs to. It must exist, or the publish fails with `participant "petstore_api" not found → create it with: bidirekt create-participant petstore_api`, before any file is checked.
- `--version`: any label, usually a commit hash or a release tag. Publish from a commit that holds the contract files: a version never changes, so files that are not committed yet should not take the hash of the commit before them. Commit first, then publish.

A folder is read with its subfolders, and only its `.yaml` and `.yml` files count; a folder without any fails with `no contract YAML files in folder: "./docs"`. Files and folders can be mixed in one command, in any order. The files are read in alphabetical order, and a file reached twice, such as a file passed on its own and again through its folder, is read once, under the name the first argument gives it. A file found in a folder is named by the folder and its path inside it, so `./contracts/` gives `contracts/rest/pets.yaml`; a file passed on its own keeps the name you typed.

One publish sends at most 8 MiB to the broker, the text of every file included; a larger one is refused before any file is checked. [`validate`](validate.md) has the same limit.

Publishing validates the files and stores them; it compares nothing. A contract that removes a resource another participant consumes publishes without an error, because a published version is not in use yet: nothing depends on it until it is deployed. The breaks appear when you run [`can-i-deploy`](can-i-deploy.md) for that version against the environment you intend to deploy it to.

Publishing the same version again with different content fails with `cannot post contract to broker: contract version already exists with different content` ([Version](../concepts/how-the-broker-works.md#version)).

A file that breaks the [contract format](../reference/file-format.md) is rejected as a whole, with one line per violation:

```
$ bidirekt publish petstore_api.yaml --participant petstore_api --version 1.4.0
contract validation failed
  - petstore_api.yaml: invalid endpoint "/pets/{petId}" at provides rest, dynamic path segments must use *
```

The files are checked in two steps. First the shape of each file: its keys, its resources and its schema nodes. Only when every file passes come the checks between names: a resource or a schema declared twice, a property given two types by two files of a consumer, and a schema name that no schema declares. While any file has a shape violation, the report lists only the shape violations; after they are fixed, the next run lists the others. If `petstore_api.yaml` above also named an undeclared schema, `200: Pett`, the second run would print:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: unresolved schema "Pett" referenced by provides GET /pets/* 200
```
