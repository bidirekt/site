Bidirekt landing page and docs site: TanStack Start, prerendered to static HTML.

`npm install && npm run dev` serves the site on http://localhost:3000.

The docs are the Markdown files in `content/docs/`; `content/docs/nav.yaml` sets the sidebar tree and the page order.

## Landing terminal

The terminal on the landing page plays `public/casts/landing.cast`, a session recorded with the real CLI against a real broker. To record it again you need Docker, asciinema 3 (`brew install asciinema`), expect, git, vim and a `bidirekt` binary:

```sh
BIDIREKT_BIN=/path/to/bidirekt npm run casts
```

The script starts its own broker on port 18090, publishes the petstore contracts in `scripts/casts/`, records what `scripts/casts/session.exp` types, and stops the broker.
