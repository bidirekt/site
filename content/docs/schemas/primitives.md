---
title: Primitives
description: The five primitive types, and how integer, float and number compare.
---

The primitive types are `string`, `integer`, `float`, `number` and `boolean`. Any other token is rejected at publish.

`integer` and `float` are strict: a consumer that declares `float` where the provider declares `integer` is a type mismatch. `number` is for a value that JSON sends as `50` or `50.5` alike, on either side. A reader writes it when its code accepts both. A producer writes it when its value can be a round float: PHP's `json_encode` sends the float `50.0` as `50`, so that value is `number`, not `float` or `integer`. A `number` reader accepts all three, and a `number` producer breaks a strict reader. The producer and the reader of a body are in [Which side decides](../contracts/which-side-decides.md):

| Producer | Reader | Result |
|---|---|---|
| `integer`, `float` or `number` | `number` | compatible |
| `number` | `integer` or `float` | type mismatch |
| `integer` | `float`, or the reverse | type mismatch |

Two modules of the same consumer that declare `number` and `integer` for the same property are still rejected as different types ([Several files](../contracts/several-files.md)).
