---
title: Agent skill
description: How to install the bidirekt skill that lets a coding agent write and fix the contract files.
---

The `bidirekt` skill lets a coding agent write and update the service's contract files from its code, check them with the CLI's read-only commands, and fix them from a `can-i-deploy` report. It needs the CLI and a broker, and reads https://bidirekt.com/llms.txt on every run. Install it in the current project:

```
$ npx skills add bidirekt/skills
```

It writes `.agents/skills/bidirekt/SKILL.md`, `.claude/skills/bidirekt` and `skills-lock.json` in the project.

`-g` installs it for every project:

```
$ npx skills add bidirekt/skills -g
```

It writes `~/.agents/skills/bidirekt/SKILL.md`, a link in the skills folder of each agent it finds, such as `~/.claude/skills/`, and `~/.agents/.skill-lock.json`. Which agents get it depends on what the `skills` tool detects on your machine. A line `✗ bidirekt → PromptScript: PromptScript does not support global skill installation` comes from the `skills` tool and can be ignored.

The skill follows the `main` branch of https://github.com/bidirekt/skills. Update it with:

```
$ npx skills update
```
