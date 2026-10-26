---
title: What is not compared
description: Headers and query parameters, which a REST contract has no place for, so no change in them makes can-i-deploy fail.
---

The `rest` block has no place for the items below, so a change in any of them never makes `can-i-deploy` fail. The items that hold for every kind of resource are in [What is not compared](../contracts/what-is-not-compared.md).

- **Headers.** A provider that starts requiring one, and a consumer that stops sending one, both pass.
- **Query parameters.** A renamed parameter, a newly required one, or a change in how pagination is requested is not a break.
