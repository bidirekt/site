---
title: Try on your project
description: What the try command installs in your project and on your machine, and the seven steps it prints to start using Bidirekt.
---

Run it in the root of the project you want to set up:

```
$ curl -sL bidirekt.com/try | sh
```

It asks once, `Set up Bidirekt in <folder>? [Y/n]`, and `n` stops it before anything is written. Without a terminal it does not ask and goes on.

## What it installs

- `bidirekt/compose.yaml` in the project: the broker's compose file from https://github.com/bidirekt/broker, the one [Running local](running-local.md) uses. A `bidirekt/compose.yaml` that already exists is kept, with `Kept the existing bidirekt/compose.yaml.`
- `~/.local/bin/bidirekt`: the CLI, version `0.1.0`, installed with the script in [Install the CLI](install-the-cli.md). When that version is already installed, it is skipped. When `~/.local/bin` is not on your `PATH`, it prints the line to add to your shell profile.
- The [agent skill](agent-skill.md), with `npx skills add bidirekt/skills -a claude-code codex -y`: `.agents/skills/bidirekt/SKILL.md`, `.claude/skills/bidirekt` (a link to it) and `skills-lock.json`. Without Node.js, it prints `Install the agent skill with: npx skills add bidirekt/skills -a claude-code codex (needs Node.js)` and goes on.

The broker runs with Docker. Without it, the CLI and the skill are still installed, and the script prints `The broker runs with Docker: https://docs.docker.com/get-docker/`.

## The seven steps

It ends with `Bidirekt is set up. Next:` and the steps below, the same for every project. `<service>` is the participant's name, `<version>` the version you build, and `<files>` the contract files.

1. **Start the broker**, on `localhost:8080`, as in [Running local](running-local.md):

   ```
   $ docker compose -f bidirekt/compose.yaml up -d
   ```

2. **Point the CLI at it** with its own profile, `local`, and use that profile for the rest of the shell, as in [Running local](running-local.md) and [configure](../reference/cli.md#configure):

   ```
   $ bidirekt configure --profile local --broker-url http://localhost:8080
   $ export BIDIREKT_PROFILE=local
   ```

3. **Create the environment and one participant per service**, as in [Participants & environments](../ship/participants-and-environments.md):

   ```
   $ bidirekt create-environment production
   $ bidirekt create-participant <service>
   ```

4. **Ask your coding agent** to write the contract files from the code, with the [agent skill](agent-skill.md):

   ```
   Use the bidirekt skill to write the contract for this service.
   ```

5. **Publish the contract**, as in [publish](../ship/publish.md):

   ```
   $ bidirekt publish <files> --participant <service> --version <version>
   ```

6. **Check before you deploy**, as in [can-i-deploy](../ship/can-i-deploy.md):

   ```
   $ bidirekt can-i-deploy <service> --version <version> --environment production
   ```

7. **After the deploy, record it**, as in [record-deployment](../ship/record-deployment.md):

   ```
   $ bidirekt record-deployment <service> --version <version> --environment production
   ```

Every command is in the [CLI reference](../reference/cli.md). To see the whole flow on an example first, run the [Demo](demo.md).
