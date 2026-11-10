---
title: Enums and unions
description: How members lists the values of an enum and the schemas of a union, what each rejects, and how the two sides compare them.
---

An `enum` is a string with a fixed list of values, and a `union` is a value that has the shape of one of several named schemas. Both list what they hold under `members`, a key that no other type takes ([Types](types.md#types-and-their-keys)).

## Enums

`members` lists the values of an enum:

```yaml
Pet:
  type: object
  properties:
    status:
      type: enum
      members: [available, pending, sold]
```

describes

```json
{ "status": "sold" }
```

`members` is a list of at least one value, each a string that is not empty, none written twice. An enum holds only strings: a property that takes one of a few numbers is an `integer`. The values are data, not names: they never become part of a property such as `$.status`, so they may hold any character except NUL. `optional` and `nullable` work as on any other property ([Optional and nullable](optional-and-nullable.md)).

A list that breaks these rules is rejected at publish:

- without `members`: `"type: enum" needs "members" at schemas Pet properties status: list its values`
- with `members: []`: `"members" is empty at schemas Pet properties status: list at least one value`
- with a value written twice: `value "sold" is repeated in "members" at schemas Pet properties status`
- with a value that is not a string, such as `1`, or an empty one: `each value in "members" must be non-empty text at schemas Pet properties status`

## Unions

`members` maps the key of each member to the schema it has, with `ref`. Here a payment is a card or a pix:

```yaml
Order:
  type: object
  properties:
    payment:
      type: union
      members:
        card:
          ref: CardPayment
        pix:
          ref: PixPayment
CardPayment:
  type: object
  properties:
    number:
      type: string
PixPayment:
  type: object
  properties:
    key:
      type: string
```

describes a card payment such as

```json
{ "payment": { "method": "card", "number": "4111 1111 1111 1111" } }
```

The key of a member, `card` or `pix`, is its identity in the body: in REST, the value of the field that tells the members apart, here `method`. There is no `discriminator` key: when the code reads that field, it is a property of each member's schema like any other.

`members` is a map of at least one key, and each member holds only a `ref` to a schema declared under `schemas`. A member key follows the rule of a property name ([Names](objects.md#names)). A report writes a member as `(<key>)` right after its union: `$.payment(card).number` in a property, `Order.payment(card)` in a field, and `Payment(card)` when the union is the whole schema `Payment` ([Reading a property block](../ship/can-i-deploy.md#reading-a-property-block)).

A union that breaks these rules is rejected at publish:

- without `members`: `"type: union" needs "members" at schemas Order properties payment: map each key to a ref`
- with `members: {}`: `"members" is empty at schemas Order properties payment: list at least one member`
- with a member without `ref`: `member "card" needs a "ref" to a schema at schemas Order properties payment`
- with a reserved character in a member key: `member key "card(x)" must not contain ".", "[", "]", "{", "}", ";", "(" or ")" at schemas Order properties payment`

Any other key in a member, such as `type`, is an unknown key, and a `ref` to a name that no schema declares is rejected as any `ref` is ([References](references.md)).

## How they compare

Two rules decide ([Which side decides](../contracts/the-contract-file.md#which-side-decides)):

- **The side that reads a body decides if what it receives fits.** A `string` reader accepts an `enum`, and an `enum` reader of a `string` is a type mismatch. An enum against any other type, and a union against anything but a union, is a type mismatch too. A report prints their types as `enum` and `union`, without their values or members.
- **The provider owns how a property is provided.** Every value and member that the consumer declares must be declared by the provider, whichever side produces the body. A value or a member that only the provider declares never breaks.

When the consumer produces the body (in REST, a request):

| Consumer | Provider | Result |
|---|---|---|
| enum `pending` | `string` | compatible |
| `string` | enum `pending`, `sold` | type mismatch |
| enum `pending`, `sold` | enum `pending` | break: `sold` is missing in the provider |
| enum `pending` | enum `pending`, `sold` | compatible |

When the provider produces the body (in REST, a response):

| Consumer | Provider | Result |
|---|---|---|
| enum `pending` | `string` | type mismatch |
| `string` | enum `pending`, `adopted` | compatible |
| enum `pending`, `adopted` | enum `pending` | break: `adopted` is missing in the provider |
| enum `pending` | enum `pending`, `adopted` | compatible |

Between two unions, every member key that the consumer declares must exist in the provider, and a member that both sides declare compares as any schema: a property inside it breaks as any property, at `$.payment(card).number`. A provider that adds `pix` to `payment` breaks no consumer, and a consumer that reads `pix` from a provider without it gets `petstore_web reads "pix", but petstore_api doesn't provide it`.

Each value or member missing in the provider is a break of its own, with the fixes of each side in [Property breaks](../ship/property-breaks.md#enum-values-and-union-members).
