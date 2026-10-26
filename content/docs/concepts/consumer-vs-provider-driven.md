---
title: Consumer- vs provider-driven
description: The two known approaches to contract testing, consumer-driven and provider-driven, and what each costs.
---

The industry has two established ways of getting hold of the contract. Both work; they put the effort in different places.

## Consumer-driven

The consumer states what it needs, and the provider is checked against the union of what its consumers need. Ian Robinson described the pattern in "Consumer-Driven Contracts: A Service Evolution Pattern" (martinfowler.com, June 2006).

The usual implementation works by execution. The consumer's tests run against a mock of the provider; the mock records each request the consumer makes and the response the consumer expects, and writes them to a contract file. Later, that file is replayed against the running provider: each recorded request is sent to the real provider, and the actual response is compared with what the consumer expected.

The strength is precision: the provider learns exactly which fields each consumer reads, and the recording proves the consumer really makes those calls. The cost is execution: the provider has to run, with the data each recorded interaction expects, for every consumer's recordings, on every change.

## Provider-driven

The provider publishes a specification of what it serves, usually an OpenAPI document, and that document is the reference. Consumers check themselves against it: they validate their own calls, stubs or recordings against the specification, or generate their test doubles from it. The provider, in turn, checks that its implementation matches its own document.

The strength is independence: one document serves any number of consumers, and nobody has to coordinate a test run. The cost is blindness: the provider never learns which parts of the document anyone depends on, so a change that stays within the specification, such as making a field optional, can still remove something a consumer relies on.

Bidirekt takes a third route, in which both sides declare and nothing runs: [Bidirectional contract testing](bidirectional-contract-testing.md).
