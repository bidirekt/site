---
title: Resources
description: The bodies a participant provides or consumes, declared in a rest block and named after the provider.
---

A resource is one body the two sides exchange: the request of an endpoint and method, or one response of an endpoint, method and status. A provider declares its resources under `provides`, in a `rest` block. A consumer writes the same `rest` block under `consumes`, one level deeper, under the name of the provider it calls.

That name is the provider's participant name, in snake_case: lowercase letters, digits and single underscores. It is not checked against existing participants at publish, so a misspelled name, such as `petstore_apl` for `petstore_api`, publishes fine and fails at `can-i-deploy` with `petstore_web calls GET /pets/*, but petstore_apl doesn't provide it`.

The value of `request` and of each status in `responses` is the name of a schema declared under `schemas`, never an inline schema, or `~` for a body the contract does not describe.
