---
title: The problem
description: The problem two integrating services create for each other, and what a contract between them is.
---

Contract testing checks that the two sides of an integration agree on what they exchange. These pages explain the problem that contract testing solves, the two approaches you will find in the industry, and the route Bidirekt takes: both sides declare what they provide and what they consume, in the same file format, and nothing runs.

## The problem

Take a pet API and a web app that calls it. The app requests `GET /pets/123` and reads two fields from the response: the pet's name and its status. The two are built by different people, tested separately, and deployed separately.

One day the API team renames `status` to `state`. Their code compiles, their tests pass, their deployment succeeds. The app keeps reading `status`, gets nothing, and shows every pet as unavailable. The break is discovered in production, by users, and the team that caused it is the last to hear about it.

Nothing in the usual test pyramid catches this in time:

- **Unit tests never call the real API.** The app's tests run against a fake API that answers with `status`, because that is what the app believed when the fake API was written. When the real API changes, the fake does not, and the tests stay green.
- **End-to-end tests run both sides together, but not the right versions.** They run in a shared environment, such as staging, against whatever was deployed there last. That pair of versions is rarely the pair that will meet in production. The suite is slow and the environment is shared, so it runs late and not often. When it fails, it says that something is broken, not which two versions disagree on which field.

The sentence nobody gets is the useful one: _the version you are about to deploy removes a field that a deployed consumer still reads._ Producing that sentence before the deployment is what contract testing is for.

## What a contract is

A provider usually serves more than one client, and more than any one of them needs. The pet API returns more fields than the two the app reads, and serves endpoints the app never calls. The contract between the API and the app is only the part the app depends on: the endpoints it calls, with which methods, what it sends, and which fields it reads from each response.

Only a change inside that part can break the app. The API can rename or remove a field the app never reads, or drop an endpoint it never calls, and the app never notices.

Contract testing writes that part down for each pair of services, and checks every change against it before the change ships.
