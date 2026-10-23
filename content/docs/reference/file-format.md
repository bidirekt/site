---
title: File format
description: How a contract file is checked and parsed: its keys, extension, documents, anchors and comments.
---

- Every key at every level is checked against the grammar of [Write contracts](../contracts/your-first-contract.md) and [Schemas](../schemas/primitives.md). A key the grammar does not know, such as `options`, an uppercase `GET` or a top-level `version`, is a violation. The report lists every violation in every file, and nothing is stored.
- The extension must be `.yaml` or `.yml`. The CLI refuses a file passed with anything else before contacting the broker: `unsupported contract file extension: "petstore_api.txt"`. Inside a folder, files with any other extension are skipped.
- One YAML document per file. A second document after `---` is rejected with `malformed contract file: petstore_api.yaml: multiple documents are not supported`.
- YAML anchors and aliases are rejected with `malformed contract file: petstore_api.yaml: anchors and aliases are not supported`. To reuse a shape, name it under `schemas` and point to it with `ref`.
- YAML comments are allowed. They are ignored when the file is parsed.

How the file is published, and what the broker answers, is in [`publish`](../ship/publish.md).
