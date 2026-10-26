---
title: Property breaks
description: Every break of a property that a can-i-deploy report can print, with the fix of each side.
---

This page lists every break of a property that the [report](can-i-deploy.md#the-report) can print, with the fix of each side. Each one is about a body the provider produces or a body the consumer produces (REST: a response or a request, see [Resources](../rest/resources.md)), and counts only where the property's parent is present ([Which side decides](../contracts/the-contract-file.md#which-side-decides)). `<participant>` is the participant under check and `<counterpart>` the counterpart it breaks.

## Absent properties

#### `<participant> reads it, but <counterpart> doesn't provide it`

Body the provider produces: the participant requires a property the provider does not declare, inside a parent the provider declares.

- Fix of `<participant>`: `stop reading it, or handle its absence in the code and mark it optional`
- Fix of `<counterpart>`: `provide it`

#### `<participant> doesn't provide it, but <counterpart> reads it`

Body the provider produces: the consumer requires a property the participant does not declare, inside a parent the participant declares.

- Fix of `<participant>`: `provide it`
- Fix of `<counterpart>`: `stop reading it, or handle its absence in the code and mark it optional there`

#### `<participant> requires it, but <counterpart> only sometimes provides it`

Body the provider produces: the participant requires a property the provider marks optional.

- Fix of `<participant>`: `handle its absence in the code, then mark it optional`
- Fix of `<counterpart>`: `always provide it there`

#### `<participant> provides it only sometimes, but <counterpart> requires it`

Body the provider produces: the consumer requires a property the participant marks optional.

- Fix of `<participant>`: `always provide it`
- Fix of `<counterpart>`: `handle its absence in the code, then mark it optional there`

#### `<participant> doesn't send it, but <counterpart> requires it`

Body the consumer produces: the provider requires a property the participant does not send, inside a parent the participant sends.

- Fix of `<participant>`: `send it`
- Fix of `<counterpart>`: `stop requiring it, then mark it optional there`

#### `<participant> requires it, but <counterpart> doesn't send it`

Body the consumer produces: the participant requires a property the consumer does not send, inside a parent the consumer sends.

- Fix of `<participant>`: `stop requiring it, then mark it optional`
- Fix of `<counterpart>`: `send it`

#### `<participant> sends it only sometimes, but <counterpart> requires it`

Body the consumer produces: the provider requires a property the participant marks optional.

- Fix of `<participant>`: `always send it`
- Fix of `<counterpart>`: `handle its absence in the code, then mark it optional there`

#### `<participant> requires it, but <counterpart> sends it only sometimes`

Body the consumer produces: the participant requires a property the consumer marks optional.

- Fix of `<participant>`: `handle its absence in the code, then mark it optional`
- Fix of `<counterpart>`: `always send it there`

## Types

#### `<participant> reads it as <type>, but <counterpart> provides <counterpart type>`

Body the provider produces: the participant reads the property as a type that does not accept the type the provider declares.

- Fix of `<participant>`: `read it as <counterpart type>`
- Fix of `<counterpart>`: `provide it as <type> there`

#### `<participant> provides it as <type>, but <counterpart> reads <counterpart type>`

Body the provider produces: the consumer reads the property as a type that does not accept the type the participant declares.

- Fix of `<participant>`: `provide it as <counterpart type>`
- Fix of `<counterpart>`: `read it as <type> there`

#### `<participant> sends it as <type>, but <counterpart> expects <counterpart type>`

Body the consumer produces: the provider expects the property as a type that does not accept the type the participant sends.

- Fix of `<participant>`: `send <counterpart type>`
- Fix of `<counterpart>`: `accept <type> there`

#### `<participant> expects it as <type>, but <counterpart> sends <counterpart type>`

Body the consumer produces: the participant expects the property as a type that does not accept the type the consumer sends.

- Fix of `<participant>`: `accept <counterpart type>`
- Fix of `<counterpart>`: `send <type> there`

## Null

#### `<participant> doesn't accept null, but <counterpart> may provide null`

Body the provider produces: the provider marks the property nullable and the participant does not.

- Fix of `<participant>`: `handle null in the code, then mark it nullable`
- Fix of `<counterpart>`: `stop providing null there`

#### `<participant> may provide null, but <counterpart> doesn't accept it`

Body the provider produces: the participant marks the property nullable and the consumer does not.

- Fix of `<participant>`: `stop providing null`
- Fix of `<counterpart>`: `handle null in the code, then mark it nullable there`

#### `<participant> may send null, but <counterpart> doesn't accept it`

Body the consumer produces: the participant marks the property nullable and the provider does not.

- Fix of `<participant>`: `stop sending null`
- Fix of `<counterpart>`: `handle null in the code, then mark it nullable there`

#### `<participant> doesn't accept null, but <counterpart> may send it`

Body the consumer produces: the consumer marks the property nullable and the participant does not.

- Fix of `<participant>`: `handle null in the code, then mark it nullable`
- Fix of `<counterpart>`: `stop sending null there`
