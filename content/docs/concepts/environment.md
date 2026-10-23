---
title: Environment
description: A named place where participants are deployed, and what the broker knows about it.
---

An environment is a named place where participants are deployed: `production`, `staging`, or whatever your pipeline calls them. The broker knows nothing about an environment except its name and which version of each participant is currently deployed there. It exists to answer one question: what is running together? It must be created before a check is asked about it or a deployment is recorded to it.
