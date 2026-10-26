---
title: record-deployment
description: How to record that a version is now deployed to an environment, rollbacks included.
---

```
$ bidirekt record-deployment petstore_web --version 2.3.0 --environment production
petstore_web deployment recorded to production
```

- `participant`: the participant you deployed. It must exist, or the command fails with `cannot post deployment to broker: participant not found`.
- `--version`: the version you deployed. It must be published, or the command fails with `cannot post deployment to broker: version not found`.
- `--environment`: where you deployed it. It must exist, or the command fails with `cannot post deployment to broker: environment not found`.

Run it after the deployment succeeds. It never checks compatibility and never blocks.

Recording a version that was deployed in the environment before, and is not the current one there, is a rollback, and the line says so:

```
$ bidirekt record-deployment petstore_web --version 2.2.0 --environment production
petstore_web rolled back to 2.2.0 in production
```

Any other version prints `petstore_web deployment recorded to production`, as above.
