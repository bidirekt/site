---
title: What is Bidirekt
description: A declarative, static, bidirectional contract testing tool, and the question its broker answers before a deployment.
---

Bidirekt is a declarative, static, bidirectional contract testing tool. Each side of an integration declares, in a small contract file, what it provides and what it consumes.

A provider declares the endpoints it serves, with their request and response schemas. A consumer declares the endpoints it calls, also with request and response schemas. The broker stores every published contract, records which version is deployed to which environment, and answers one question before a deployment: can this version go to this environment without breaking anything that is already there?

No server, local or remote, needs to be running to answer `can-i-deploy`. Both sides, consumer and provider, write the same declarative contract file, by hand or generated, and the broker compares the declarations statically.
