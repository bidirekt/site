---
title: Go SDK
description: How to write a service's contract from its Go code with the Go SDK: installation, an example with declarations and struct tags, the generate command and the flow to publish. The full reference is the SDK's README.
---

The Go SDK writes the [contract file](the-contract-file.md) of a service from its Go code. You declare in Go code the resources the service provides or consumes, mark the fields of each schema with the `bidirekt` struct tag, run `generate`, and get `contracts/generated.yaml`, which [`validate`](../ship/validate.md) and [`publish`](../ship/publish.md) take like any other contract file. It reads the source code and never runs your app.

This page shows how it reads. Every declaration, tag option, type and error is in the [SDK's README](https://github.com/bidirekt/go-sdk#readme).

## Install

The SDK is two Go modules: `github.com/bidirekt/go-sdk`, the `bidirekt` package your code imports, which builds with Go 1.18 or later, and `github.com/bidirekt/go-sdk/cmd/go-sdk`, the `generate` command, which needs Go 1.26 or later. In the module of your service, get the package, add the command as a tool, and tidy the module once your first declaration is written:

```
$ go get github.com/bidirekt/go-sdk
$ go get -tool github.com/bidirekt/go-sdk/cmd/go-sdk
$ go mod tidy
```

Installing the command changes your `go.mod`: the `go` line goes up to `1.26.0` when it is older, and the `golang.org/x` modules your app already uses move up to the versions the command needs. [Installation](https://github.com/bidirekt/go-sdk#installation) in the README lists every change, and how to keep the runtime defaults of the Go version you had.

## Example

`petstore_go` is a `net/http` service in the module `example.com/petstore`. It provides `GET /pets/*` and consumes `GET /ratings/*` from `petstore_reviews`. A struct with a field marked `bidirekt:"field"` is a schema, and only its marked fields are in the contract; a field without the tag, like `CreatedBy`, stays out. `Pet` uses each kind of field:

```go
// pets/pet.go
package pets

import "github.com/bidirekt/go-sdk"

type PetStatus string

const (
	PetStatusAvailable PetStatus = "available"
	PetStatusAdopted   PetStatus = "adopted"
)

var _ = bidirekt.Enum(PetStatusAvailable, PetStatusAdopted)

type Owner struct {
	Name string `json:"name" bidirekt:"field"`
}

type Shelter struct {
	City string `json:"city" bidirekt:"field"`
}

type Adopter interface{ adopter() }

func (Owner) adopter()   {}
func (Shelter) adopter() {}

type Pet struct {
	ID          int64             `json:"id" bidirekt:"field"`
	Name        string            `json:"name" bidirekt:"field"`
	Status      PetStatus         `json:"status" bidirekt:"field"`
	Owner       Owner             `json:"owner" bidirekt:"field"`
	Tags        []string          `json:"tags" bidirekt:"field"`
	Notes       map[string]string `json:"notes" bidirekt:"field"`
	Weight      float64           `json:"weight" bidirekt:"field description='In kilograms'"`
	BirthDate   *string           `json:"birthDate" bidirekt:"field"`
	AdoptedFrom Adopter           `json:"adoptedFrom" bidirekt:"field union={person: Owner, shelter: Shelter}"`
	Nickname    string            `json:"nickname,omitempty" bidirekt:"field"`
	CreatedBy   string            `json:"-"`
}
```

`bidirekt.Provides` declares a resource the service provides, next to the handler that serves it. The mux routes `/pets/{id}` to `getPet`, and the path is declared `/pets/*`: a `*` for each dynamic segment, never the router's placeholder. A body is a value of its type, or `nil` for no body:

```go
// main.go
package main

import (
	"encoding/json"
	"net/http"

	"example.com/petstore/pets"
	"github.com/bidirekt/go-sdk"
)

var store = map[string]pets.Pet{}

var _ = bidirekt.Provides(http.MethodGet, "/pets/*",
	bidirekt.Response(http.StatusOK, pets.Pet{}),
	bidirekt.Response(http.StatusNotFound, nil),
)

func getPet(w http.ResponseWriter, r *http.Request) {
	pet, found := store[r.PathValue("id")]
	if !found {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pet)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /pets/{id}", getPet)
	http.ListenAndServe(":8080", mux)
}
```

`bidirekt.Consumes` declares a resource a client consumes, and names the provider:

```go
// ratings.go
package main

import (
	"encoding/json"
	"net/http"

	"github.com/bidirekt/go-sdk"
)

type Rating struct {
	Average float64 `json:"average" bidirekt:"field"`
	Count   int     `json:"count" bidirekt:"field"`
}

var _ = bidirekt.Consumes("petstore_reviews", http.MethodGet, "/ratings/*",
	bidirekt.Response(http.StatusOK, Rating{}),
	bidirekt.Response(http.StatusNotFound, nil),
)

func fetchRating(petID string) (*Rating, error) {
	response, err := http.Get("http://petstore-reviews/ratings/" + petID)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()
	if response.StatusCode == http.StatusNotFound {
		return nil, nil
	}
	var rating Rating
	err = json.NewDecoder(response.Body).Decode(&rating)
	return &rating, err
}
```

Run `generate` in the project folder, the one with `go.mod`:

```
$ go tool go-sdk generate
```

It writes `contracts/generated.yaml`:

```yaml
# Generated by github.com/bidirekt/go-sdk. Do not edit.
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
        type: number
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

A named string type with `bidirekt.Enum` is a `ref` to an `enum` schema, a schema struct is a `ref`, a pointer is `nullable`, a slice is an `array` and a map a `map`. `weight` is a `number` because `encoding/json` writes the `float64` `50.0` as `50` ([What `encoding/json` writes](https://github.com/bidirekt/go-sdk#what-encodingjson-writes)). A field of an interface type is a union when its tag names the schema of each member in `union`. A `description` with a space goes between single quotes, since the whole tag is already a Go string in double quotes.

[Unions, embedded and anonymous structs](https://github.com/bidirekt/go-sdk#unions-embedded-and-anonymous-structs) in the README shows embedded and anonymous structs, and how `bidirekt.Named` and `bidirekt.Schema` name a schema.

## Describe what the code does

The contract describes what the code does, not the type the code declares ([Describe what the code does](the-contract-file.md#describe-what-the-code-does)). With the SDK, the Go type is where each field starts, and the tag's options apply the rule: a declared `type`, `optional` or `nullable` wins over the Go type.

In the example, `nickname` needs no option: with `omitempty`, `encoding/json` leaves an empty nickname out of the body, and the SDK follows what it writes, so the field is `optional`. A `*string` whose database column allows `null`, but which the service always fills, declares `bidirekt:"field nullable=false"`, and a `time.Time` the body carries as a string declares `bidirekt:"field type=string"`.

## From code to deploy

`contracts/generated.yaml` is the service's only contract file: a service adopts the SDK as a whole, with every resource and schema it provides or consumes declared in its code. Regenerate the file whenever a declaration or a marked type changes, and commit it with the code. Then the flow is the same as with a hand-written file:

```
$ go tool go-sdk generate
$ bidirekt validate contracts/generated.yaml
$ bidirekt validate contracts/generated.yaml --participant petstore_go --environment production
$ bidirekt publish contracts/generated.yaml --participant petstore_go --version 1.4.0
$ bidirekt can-i-deploy petstore_go --version 1.4.0 --environment production
$ bidirekt record-deployment petstore_go --version 1.4.0 --environment production
```

[`validate`](../ship/validate.md) without `--participant` and `--environment` checks only the file; with them, it also compares the file with what is deployed in that environment. Deploy between `can-i-deploy` and `record-deployment`. In CI, `go tool go-sdk generate --check` fails the build when the committed file is out of date.

The broker reads every file of one publish as one contract ([Several files](the-contract-file.md#several-files)), but the SDK cannot see a hand-written file: a tag cannot name a schema declared only there, and a schema or a provided resource declared both in the code and in a hand-written file is rejected at publish as declared twice. To adopt the SDK, declare every resource and schema the service provides or consumes, generate, check that the new file declares what the old files did, and delete the old files.

When [`can-i-deploy`](../ship/can-i-deploy.md) reports a break, fix the declaration or the tag in the code and generate again. Never edit `contracts/generated.yaml`: the next `generate` writes over it.

A type the contract cannot hold, such as `time.Time` or `any` without a declared `type`, stops `generate` with the file and the line, and nothing is written. The [`generate` command](https://github.com/bidirekt/go-sdk#the-generate-command) and the [Reference](https://github.com/bidirekt/go-sdk#reference) of the README list every declaration, tag option, type and error.
