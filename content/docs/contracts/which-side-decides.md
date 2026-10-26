---
title: Which side decides
description: The rule behind every comparison, for every kind of resource: the side that reads a body decides what must be in it.
---

Every comparison follows one rule: the side that reads a body decides what must be in it. Each body has a producer and a reader; which side is which depends on the resource (REST: a response is produced by the provider, a request by the consumer; see [Resources](../rest/resources.md)).

A property the reader requires must be declared by the producer, required too and with a type the reader accepts: the same type, or `integer`, `float` or `number` when the reader declares `number`. A property the reader marks optional may be absent, but if both sides declare it the reader must accept its type. A property the producer marks nullable must be nullable for the reader too. A property the reader does not declare is not checked.

A property is required only where its parent is present. When the producer does not declare a parent, only the parent can break, and only if it is required; nothing inside it is checked, and its members, array items and map values are never reported on their own. The body itself has no parent, so it is always compared.
