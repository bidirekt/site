---
title: Bidirectional contract testing
description: What bidirectional contract testing means in the industry, and what declarative and static add here.
---

The industry defines bidirectional contract testing as the ability for both sides of an integration point to publish their own view of the integration: a consumer contract capturing what the consumer needs, and a provider contract publishing what the provider can do. A broker checks the two views against each other before a deployment, so that neither side has to run against the other to find out whether they still agree.

What the broker does is best described as declarative static bidirectional contract testing: **declarative**, because each side writes down what it provides and what it consumes in a contract file, instead of recording it from running code; **static**, because the broker compares those declarations without executing a service, a mock or a test; and **bidirectional**, because both sides publish, and a deployment of either side is checked against the other.

## Where to go next

- [Participant](participant.md): what the broker stores, and the seven terms it uses.
- [CLI reference](../reference/cli.md): every command.
