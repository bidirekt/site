---
title: Contract, version & snapshot
description: What a participant declares, the label it publishes it under, and the stored content the broker compares.
---

## Contract

A contract is what a participant declares about its integrations: the endpoints it provides and the endpoints it consumes, each with the schemas of its bodies. The [specification](../contracts/your-first-contract.md) documents the format. The broker compares properties and their types, never files.

Publishing validates the file and stores it; it compares nothing. A contract that removes an endpoint another participant consumes publishes without an error, because a published version is not in use yet: nothing depends on it until it is deployed. The breaks appear when you run `can-i-deploy` for that version against the environment you intend to deploy it to.

## Version

A version is the label you attach to a contract when you publish it. It is any string; a commit hash or a release tag are the usual choices. Versions are unique within a participant and immutable once published:

- publishing the same version again with the same declarations succeeds and changes nothing;
- publishing the same version with different declarations is refused with `contract version already exists with different content`.

The broker never orders versions. It does not know that `2.0.0` comes after `1.0.0`, and it never needs to: every question it answers names a version explicitly. A version is what you ask about, what you deploy, and what you record.

## Snapshot

A snapshot is the stored content of a contract, and it is what a version points at. The broker identifies a snapshot by a checksum of its declarations, not by the text of the file. Formatting, comments, key order, schema names and the way the contract is split across files do not change the checksum.

Publishing a new version with the same declarations as one already published makes the new version an alias: it points at the same snapshot. The broker compares snapshots, never versions, so the two versions are the same contract for every check. You never name a snapshot yourself; you always name a version, and the broker resolves it.
