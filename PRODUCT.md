# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Engineers on teams running microservices (REST and GraphQL) who want to know, before deploying and as a CI gate, whether a change breaks a consumer or a provider, without standing up a test environment. They reach the site to evaluate Bidirekt, then return to the docs while writing contracts and wiring the CLI into CI.

## Product Purpose

Bidirekt is a declarative, static, bidirectional contract testing tool. Each service declares what it provides and what it consumes in one YAML file; the broker compares the declarations and answers whether a version can be deployed to an environment. Success means a team catches a breaking change in CI, in seconds, with the same answer every time, before it reaches production.

This site (bidirekt.com) is the product's public face: the landing page, the documentation, contact and privacy pages.

## Positioning

- Nothing is run: the broker compares declarations, it does not execute tests or call services.
- Bidirectional: the consumer can't read what the provider doesn't send, and the provider can't drop what a consumer still reads.
- Self-hosted broker: one Docker image and a Postgres database.
- The contract is Bidirekt's own YAML; it does not replace an OpenAPI document and is not generated from OpenAPI today.

## Operating Context

- Per participant: `create-participant` (once) → `validate` → `publish` (every build) → `can-i-deploy` → deploy → `record-deployment`. Any ordered example follows this order.
- Tools: the `bidirekt` CLI (profiles are accounts, e.g. `acme`/`globex`; CI uses `BIDIREKT_BROKER_URL` and `BIDIREKT_API_KEY`), SDKs (TypeScript, PHP, Go) that generate `contracts/generated.yaml` from code, an agent skill that reads https://bidirekt.com/llms.txt, and the broker UI (participants, environments, compatibility matrix, users, profile).
- Entry points: `curl -sL bidirekt.com/demo | sh` and `curl -sL bidirekt.com/try | sh`; the petstore example demonstrates a break.
- Docs sections: Start, Understand, Write contracts, REST, GraphQL, Schemas, Ship, Reference (`content/docs/nav.yaml`).

## Capabilities and Constraints

- Contracts are YAML only. Resource kinds accepted today: REST and GraphQL (subgraphs can form a `graph:`). The product is not HTTP-bound: never describe it as "for HTTP services"; the vision is named contracts.
- can-i-deploy is advisory; record-deployment never blocks. CI enforces.
- Static prerendered site on GitHub Pages; no backend at runtime. Analytics load only after consent and after launch; the site is `noindex` until launch.
- Open decisions: a hosted cloud offering exists only as internal research and must not be presented as available; pricing is undecided.

## Brand Commitments

- Name: Bidirekt; CLI command `bidirekt`; GitHub org `bidirekt`.
- Licenses: broker BSL 1.1 (converts to Apache 2.0 after 4 years, commercial license for competing uses); CLI and site Apache 2.0; SDKs MIT.
- Voice: plain, technical, real domain terms; no metaphors standing in for technical vocabulary.
- Visual stance (chosen 2026-11-27): the developer-tool category standard, dark, executed at resend.com's craft level, rather than a conceptual world.
- No logo file exists; the favicon is a 🤝 emoji SVG.

## Evidence on Hand

- Real: landing copy (`src/Pages/LandingPage`), docs (`content/docs`), `public/llms.txt`, `public/og.png`, the petstore example and the demo/try scripts.
- Absent: customers, testimonials, logos of users, benchmarks, usage numbers, pricing. Nobody uses Bidirekt yet; never fabricate any of these.

## Product Principles

1. Know before you deploy: every page leads toward the answer can-i-deploy gives.
2. Declarations, not executions: never imply Bidirekt runs tests or needs a test environment.
3. Show the real thing: real CLI output, real contract YAML, real break reports; no invented proof.
4. Docs describe the user-visible result, not internal mechanics.
