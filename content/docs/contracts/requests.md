---
title: Requests
description: How request names the schema of a request body, and on which methods it is accepted.
---

```yaml
provides:
  rest:
    /pets:
      post:
        request: NewPet
```

`request` names the schema of the request body. A body exists only on `post`, `put` and `patch`, so `request` is accepted on those three methods and nowhere else. A method needs nothing more than its `request`: the resource above is complete without any `responses`.
