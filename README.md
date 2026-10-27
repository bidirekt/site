# Bidirekt website

[![CI](https://img.shields.io/github/actions/workflow/status/bidirekt/site/ci.yml?branch=main&label=CI)](https://github.com/bidirekt/site/actions/workflows/ci.yml) [![License](https://img.shields.io/github/license/bidirekt/site)](LICENSE)

This repository is the source of https://bidirekt.com and its docs at https://bidirekt.com/docs/. Bidirekt is a declarative, static, bidirectional contract testing tool: each side of an integration declares, in a small contract file, the resources it provides and the resources it consumes. The site is built with TanStack Start and prerendered to static HTML.

## Run it locally

With Node.js 24, the version CI uses, this serves the site on http://localhost:3000:

```sh
npm install && npm run dev
```

The docs are the Markdown files in `content/docs/`; `content/docs/nav.yaml` sets the sidebar tree and the page order.

## How it ships

The Deploy workflow (`.github/workflows/deploy.yml`) runs on every push to `main` and can also be started by hand. It builds the site with `npm run build` and deploys `dist/client` to GitHub Pages, which serves https://bidirekt.com.

## Development

Read [CONTRIBUTING.md](CONTRIBUTING.md). CI runs these checks on every pull request; run them before you open one:

```sh
npm run check
npm run lint
npm run build
```

## License

Apache License 2.0, see [LICENSE](LICENSE).
