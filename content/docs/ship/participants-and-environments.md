---
title: Participants & environments
description: How to create the participants and the environments the broker needs before a publish or a check.
---

## create-participant

```
$ bidirekt create-participant petstore_api
petstore_api participant created
```

- `name`: the participant's name, in `snake_case` (lowercase letters, digits and single underscores). Anything else fails with `cannot post participant to broker: participant name must be snake_case`.

Running it again for an existing name prints `petstore_api participant already exists` and exits `0`, so a pipeline can run it on every build.

## create-environment

```
$ bidirekt create-environment production
production environment created
```

- `name`: the environment's name, such as `production` or `staging`.

Running it again prints `production environment already exists` and exits `0`.
