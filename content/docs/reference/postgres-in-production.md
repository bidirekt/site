---
title: Postgres in production
description: The choices worth making for the broker's Postgres database in production.
---

Nothing here is required. These are the choices worth making:

- Postgres 17 or newer: the local compose runs 17, and the broker's tests run on 18.
- `sslmode=require` in the URL whenever the database is on another machine.
- A dedicated user with a strong password, owning only the broker's database.
- Port `5432` never exposed to the internet.
- Regular backups: the database holds every contract and deployment.
- A managed database (RDS, Cloud SQL, Neon…) is a valid choice: give the broker its URL.
- Always pin the image tag, so the broker only changes when you choose.
