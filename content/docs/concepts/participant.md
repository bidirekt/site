---
title: Participant
description: What the broker stores and compares, and the participant, the named service that publishes contracts.
---

The broker stores what each service declares it provides and consumes, and before a deployment it compares that declaration with what is already running in the target environment. Seven terms cover everything it knows: participant, contract, version, snapshot, environment, can-i-deploy and deployment. The commands are documented in the [CLI reference](../reference/cli.md).

A participant is a named service that publishes contracts. The name is the whole identity: it is how the broker files everything the participant publishes, and it is how other participants refer to it. A consumer names the provider it calls with this exact string, so a typo in a name is a contract with a provider that does not exist.

A participant is not "a provider" or "a consumer". The same participant provides endpoints to some services and consumes endpoints from others, and its contract file declares both sides at once.
