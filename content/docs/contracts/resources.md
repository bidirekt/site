---
title: Resources
description: The bodies a participant provides or consumes, the kind of resource that holds them, the provider name a consumer writes, and a body the contract does not describe.
---

A resource is one body the two sides exchange; what identifies it depends on its kind ([REST: Resources](../rest/resources.md)). `rest` is the only kind today. A provider declares its resources under `provides`, in a block named after their kind. A consumer writes the same block under `consumes`, one level deeper, under the name of the provider it consumes from.

That name is the provider's [participant name](../concepts/how-the-broker-works.md#participant). It is not checked against existing participants at publish, so a misspelled name publishes fine and fails at `can-i-deploy` ([REST: Resource breaks](../rest/breaks.md)).

Every body a resource declares names a schema declared under `schemas`, never an inline schema, or `~` for a body the contract does not describe.

## Bodies not described

`~` in place of a schema name says that the contract does not describe the body. On the side that produces the body it promises no structure, and on the side that reads it it reads nothing from it. The resource still exists. Nothing inside the body is compared, and `~` does not tell a body that is empty from a body that is not described. An empty string is not `~`: it names a schema called `""`, which no schema declares, and is rejected.

REST writes it in [Requests](../rest/requests.md#bodies-not-described) and [Responses](../rest/responses.md#bodies-not-described).
