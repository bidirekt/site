---
title: publish
description: How to publish one or more contract files as a version of a participant.
---

```
$ bidirekt publish contracts/*.yaml --participant petstore_api --version 1.4.0
petstore_api contract publish successful
```

## Arguments

- `file or folder...`: one or more contract files, YAML (`.yaml` or `.yml`) or GraphQL schemas (`.graphql`, `.graphqls` or `.gql`), or folders that hold them. All of them publish together as one contract ([Several files](../contracts/the-contract-file.md#several-files)); the shell expands globs.
- `--participant`: the participant the contract belongs to. It must exist, or the publish fails with `participant "petstore_api" not found → create it with: bidirekt create-participant petstore_api`, before any file is checked.
- `--version`: any label, usually a commit hash or a release tag. Publish from a commit that holds the contract files: a version never changes, so files that are not committed yet should not take the hash of the commit before them. Commit first, then publish.

## Folders

A folder is read with its subfolders, and only its `.yaml`, `.yml`, `.graphql`, `.graphqls` and `.gql` files count; a folder without any fails with `no contract files (.yaml, .yml, .graphql, .graphqls, .gql) in folder: "./docs"`. Files and folders can be mixed in one command, in any order. The files are read in alphabetical order, and a file reached twice, such as a file passed on its own and again through its folder, is read once, under the name the first argument gives it. A file found in a folder is named by the folder and its path inside it, so `./contracts/` gives `contracts/rest/pets.yaml`; a file passed on its own keeps the name you typed.

Every GraphQL file a folder holds is published as part of the participant's schema. A file of client queries or fragments in the folder is refused with `<file>: holds client operations; publish expects the GraphQL schema`, and the schema of an API the service calls, kept in the folder, would be published as the participant's own API: keep such files out of the contract folder, or pass the contract files one by one ([GraphQL: Resources](../graphql/resources.md#the-provider-publishes-its-schema)).

## Limits

One publish sends at most 8 MiB to the broker, the text of every file included; a larger one is refused before any file is checked. [`validate`](validate.md) has the same limit.

## What publishing stores

Publishing validates the files and stores them; it compares nothing. A contract that removes a resource another participant consumes publishes without an error, because a published version is not in use yet: nothing depends on it until it is deployed. The breaks appear when you run [`can-i-deploy`](can-i-deploy.md) for that version against the environment you intend to deploy it to.

Publishing the same version again with different content fails with `cannot post contract to broker: contract version already exists with different content` ([Version](../concepts/how-the-broker-works.md#version)).

## Validation errors

A file that breaks the [contract format](../contracts/the-contract-file.md#file-rules) is rejected as a whole, with one line per violation:

```
$ bidirekt publish petstore_api.yaml --participant petstore_api --version 1.4.0
contract validation failed
  - petstore_api.yaml: invalid endpoint "/pets/{petId}" in provides, write "/pets/*" (dynamic path segments must use *)
```

The files are checked in two steps. First the shape of each file: its keys, its resources and its schema nodes. Only when every file passes come the checks between names: a resource or a schema declared twice, a property given two types or two lists of enum values by two files of a consumer, and a schema name that no schema declares. While any file has a shape violation, the report lists only the shape violations; after they are fixed, the next run lists the others. A GraphQL schema is read with the rules of GraphQL after the YAML passes its shape check, and its first error is the whole answer, with its file, line and column, such as `cannot post contract to broker: ./api/query.graphqls:2:17: Undefined type Pet.`. If `petstore_api.yaml` above also named an undeclared schema, `200: Pett`, the second run would print:

```error title="publish error"
contract validation failed
  - petstore_api.yaml: unresolved schema "Pett" referenced by provides GET /pets/* 200
```
