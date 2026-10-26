---
title: What is not compared
description: Enum values, formats, descriptions, undeclared properties and unnamed schemas, which no change in makes can-i-deploy fail.
---

A change in any of the items below never makes `can-i-deploy` fail. The grammar has no place for the first two, and the broker ignores the others.

- **Enum values.** A `string` is a `string`: a provider that starts returning a fourth value of `status` is compatible with a consumer that handles three.
- **Formats.** A `date-time` string, an email and free text are the same `string`.
- **`description`.** Free text on any node, which the broker ignores ([Nodes](../schemas/nodes.md#types-and-their-keys)).
- **A property the reader does not declare.** It is not checked ([Which side decides](which-side-decides.md)).
- **A schema that no resource names.** It is accepted and never compared ([Schema names](../schemas/nodes.md#schema-names)).

A `rest` block has its own items: [REST: What is not compared](../rest/what-is-not-compared.md).
