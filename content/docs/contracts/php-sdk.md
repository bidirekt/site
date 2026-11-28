---
title: PHP SDK
description: How to write a service's contract from its PHP code with the PHP SDK: installation, an example with attributes and docblock tags, the generate command and the flow to publish. The full reference is the SDK's README.
---

The PHP SDK writes the [contract file](the-contract-file.md) of a service from its PHP code. You annotate the schemas and the handlers that provide or consume each resource, with attributes or with `@bidirekt` tags in docblocks, run `generate`, and get `contracts/generated.yaml`, which [`validate`](../ship/validate.md) and [`publish`](../ship/publish.md) take like any other contract file. It reads the source code and never runs your app.

This page shows how it reads. Every attribute argument, tag, type and error is in the [SDK's README](https://github.com/bidirekt/php-sdk#readme).

## Install

The SDK needs PHP 8.0 or later and Composer 2.2 or later. Install it as a dev dependency:

```
$ composer require --dev bidirekt/php-sdk
```

An attribute runs nothing, so a production install with `composer install --no-dev`, which leaves the package out, still runs your app. `new BidirektField(...)` inside an attribute needs PHP 8.1 to run your app, as does an enum, and `Enum::Case->value` as an attribute argument PHP 8.2; [Installation](https://github.com/bidirekt/php-sdk#installation) in the README has the details.

## Example

`petstore_php` is a Slim service. It provides `GET /pets/*` and consumes `GET /ratings/*` from `petstore_reviews`. `#[BidirektSchema]` marks each schema and `#[BidirektField]` each field of the contract; a field without it stays out of the contract. `Pet` uses each kind of field:

```php
<?php
// src/Pet.php

namespace App;

use Bidirekt\PhpSdk\BidirektField;
use Bidirekt\PhpSdk\BidirektSchema;

#[BidirektSchema]
final class Pet
{
    /**
     * @param list<string> $tags
     * @param array<string, string> $notes
     */
    public function __construct(
        #[BidirektField]
        public int $id,

        #[BidirektField]
        public string $name,

        #[BidirektField]
        public PetStatus $status,

        #[BidirektField]
        public Owner $owner,

        #[BidirektField]
        public array $tags,

        #[BidirektField]
        public array $notes,

        #[BidirektField(type: 'float', description: 'In kilograms')]
        public float $weight,

        #[BidirektField]
        public ?string $birthDate,

        #[BidirektField(
            union: [
                'person' => Owner::class,
                'shelter' => Shelter::class,
            ],
        )]
        public Owner|Shelter $adoptedFrom,
    ) {}

    #[BidirektField(optional: true)]
    public string $nickname;
}
```

`Owner` and `Shelter` are schema classes like it, with one string field each (`name` and `city`), `Rating` has a `float $average` and an `int $count`, and `PetStatus` is an enum with the string values `available` and `adopted`.

`#[BidirektProvider]` on a handler declares what it provides. Slim routes `/pets/{id}` to `show`, and the path is declared `/pets/*`: a `*` for each dynamic segment, never the framework's placeholder.

```php
<?php
// src/PetController.php

namespace App;

use Bidirekt\PhpSdk\BidirektProvider;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class PetController
{
    public function __construct(private PetRepository $pets) {}

    #[BidirektProvider(
        method: 'GET',
        path: '/pets/*',
        responses: [
            200 => Pet::class,
            404 => null,
        ],
    )]
    public function show(
        Request $request,
        Response $response,
        array $args,
    ): Response {
        $pet = $this->pets->find((int) $args['id']);
        if ($pet === null) {
            return $response->withStatus(404);
        }
        $response->getBody()->write(
            (string) json_encode($pet, JSON_PRESERVE_ZERO_FRACTION),
        );

        return $response->withHeader('Content-Type', 'application/json');
    }
}
```

`#[BidirektConsumer]` declares what a client consumes, and from which provider:

```php
<?php
// src/ReviewsClient.php

namespace App;

use Bidirekt\PhpSdk\BidirektConsumer;
use GuzzleHttp\Client;

final class ReviewsClient
{
    public function __construct(private Client $http) {}

    #[BidirektConsumer(
        provider: 'petstore_reviews',
        method: 'GET',
        path: '/ratings/*',
        responses: [
            200 => Rating::class,
            404 => null,
        ],
    )]
    public function rating(int $petId): ?Rating
    {
        $response = $this->http->get(
            "/ratings/{$petId}",
            ['http_errors' => false],
        );
        $body = json_decode((string) $response->getBody(), true);

        if ($response->getStatusCode() === 404) {
            return null;
        }

        return new Rating($body['average'], $body['count']);
    }
}
```

Run `generate` in the project folder, the one with `composer.json`:

```
$ vendor/bin/php-sdk generate
```

It writes `contracts/generated.yaml`:

```yaml
# Generated by bidirekt/php-sdk. Do not edit.
provides:
  rest:
    /pets/*:
      get:
        responses:
          200: Pet
          404: ~
consumes:
  petstore_reviews:
    rest:
      /ratings/*:
        get:
          responses:
            200: Rating
            404: ~
schemas:
  Owner:
    type: object
    properties:
      name:
        type: string
  Pet:
    type: object
    properties:
      id:
        type: integer
      name:
        type: string
      status:
        ref: PetStatus
      owner:
        ref: Owner
      tags:
        type: array
        items:
          type: string
      notes:
        type: map
        values:
          type: string
      weight:
        type: float
        description: In kilograms
      birthDate:
        type: string
        nullable: true
      adoptedFrom:
        type: union
        members:
          person:
            ref: Owner
          shelter:
            ref: Shelter
      nickname:
        type: string
        optional: true
  PetStatus:
    type: enum
    members: ["available", "adopted"]
  Rating:
    type: object
    properties:
      average:
        type: number
      count:
        type: integer
  Shelter:
    type: object
    properties:
      city:
        type: string
```

An enum with string values is a `ref` to an `enum` schema, a schema class is a `ref`, and an `array` takes the type of its items from the PHPDoc: `list<string>` is a list, `array<string, string>` a map. `weight` declares `type: 'float'` because the controller encodes with `JSON_PRESERVE_ZERO_FRACTION`; without it a PHP `float` is a `number`, like `Rating::$average` ([What `json_encode` writes](https://github.com/bidirekt/php-sdk#what-json_encode-writes)). A union of schema classes declares the key of each member in `union`.

## Tags

Tags say the same in `/** */` docblocks, for code that can't use attributes or prefers docblocks. A tag names a schema by its name in the contract:

```php
/** @bidirekt schema */
final class Pet
{
    /** @bidirekt field type=float description="In kilograms" */
    public float $weight;
}

final class PetController
{
    /**
     * @bidirekt provides GET /pets/*
     * @bidirekt response 200 Pet
     * @bidirekt response 404
     */
    public function show(
        Request $request,
        Response $response,
        array $args,
    ): Response {
        // ...
    }
}
```

A service can mix both forms, but never on the same handler, schema or field: `generate` stops. The [Quickstart](https://github.com/bidirekt/php-sdk#quickstart) of the README writes this example with tags too, and [Schemas without a class](https://github.com/bidirekt/php-sdk#schemas-without-a-class) shows a schema declared on its handler, for a body no class describes.

## Describe what the code does

The contract describes what the code does, not the type the code declares ([Describe what the code does](the-contract-file.md#describe-what-the-code-does)). With the SDK, the PHP type is where each field starts, and the field's options apply the rule: a declared `type`, `optional` or `nullable` wins over the PHP type.

In the example, `nickname` declares `optional: true` because the code leaves it unset when the pet has none, and `json_encode` leaves an unset typed property out. A `?string $name` whose database column allows `null`, but which the service always fills, declares `#[BidirektField(nullable: false)]`, and a `\DateTimeImmutable` the body carries as a string declares `#[BidirektField(type: 'string')]`.

## From code to deploy

`contracts/generated.yaml` is the service's only contract file: a service adopts the SDK as a whole, with every resource and schema it provides or consumes annotated in its code. Regenerate the file whenever an annotation or an annotated type changes, and commit it with the code. Then the flow is the same as with a hand-written file:

```
$ vendor/bin/php-sdk generate
$ bidirekt validate contracts/generated.yaml
$ bidirekt validate contracts/generated.yaml --participant petstore_php --environment production
$ bidirekt publish contracts/generated.yaml --participant petstore_php --version 1.4.0
$ bidirekt can-i-deploy petstore_php --version 1.4.0 --environment production
$ bidirekt record-deployment petstore_php --version 1.4.0 --environment production
```

[`validate`](../ship/validate.md) without `--participant` and `--environment` checks only the file; with them, it also compares the file with what is deployed in that environment. Run `record-deployment` once the deploy is done. In CI, `vendor/bin/php-sdk generate --check` fails the build when the committed file is out of date.

The broker reads every file of one publish as one contract ([Several files](the-contract-file.md#several-files)), but the SDK cannot see a hand-written file: a tag or an attribute cannot name a schema declared only there, and a schema or a provided resource declared both in the code and in a hand-written file is rejected at publish as declared twice. A consumed resource declared in both is merged, like the fragments of one consumer ([Several files](the-contract-file.md#several-files)). To adopt the SDK, annotate every resource and schema the service provides or consumes, generate, check that the new file declares what the old files did, and delete the old files.

When [`can-i-deploy`](../ship/can-i-deploy.md) reports a break, fix the annotation or the type in the code and generate again. Never edit `contracts/generated.yaml`: the next `generate` writes over it.

A type the contract cannot hold, such as `mixed` or a `\DateTimeImmutable` without a declared `type`, stops `generate` with the file and the line, and nothing is written. The [`generate` command](https://github.com/bidirekt/php-sdk#the-generate-command) and the [Reference](https://github.com/bidirekt/php-sdk#reference) of the README list every argument, tag, type and error.
