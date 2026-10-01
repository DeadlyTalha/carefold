# Carefold — Phase 0 plan pack

Local-first runtime and marketplace for health agents (skills + tools).
Domains: [carefold.app](https://carefold.app) · [carefold.dev](https://carefold.dev)
License target: Apache 2.0

This folder is the planning pack for the public open-source kit. It is not the product
source tree. Product code lives in a future `spectrayan/carefold` repo.

## Read in this order

| File | What it is |
|---|---|
| [01-product-scope.md](./01-product-scope.md) | What ships, what does not, repo split |
| [02-capabilities.md](./02-capabilities.md) | Product capabilities (outcomes) |
| [03-epics-and-stories.md](./03-epics-and-stories.md) | Epics and user stories with acceptance criteria |
| [04-tech-stack.md](./04-tech-stack.md) | Next.js + Tailwind + Node, Docker, Helm, Terraform |
| [05-skill-contract.md](./05-skill-contract.md) | `SKILL.md` + `carefold.yaml` schema |
| [05b-agent-contract.md](./05b-agent-contract.md) | `agent.yaml`: persona, skills, tools |
| [06-backlog-index.md](./06-backlog-index.md) | Flat ID index for import into Linear / Jira / GitHub |

## Decisions locked in this pack

- Product name: **Carefold**
- First public cut: **Phase 0** (local kit, no hosted marketplace)
- Stack: **Next.js + Tailwind + Node**
- Package: **Docker image**, **Helm chart**, **Terraform** for self-host
- Memory: Spector over MCP is **optional, later**
- Guardrails: **Promptly over MCP is out of scope for now**
- Public skills and agents: `wellness`, `admin`, `education` only
- Product unit users pick: **agent**. Contributor unit: **skill**. An agent owns skills **and** tools.

## How to use the stories

Each story has:

- `ID` — stable, importable (`CF-S12`)
- `Phase` — 0 / 1 / 2 / 3
- `Priority` — P0 must ship in that phase, P1 should, P2 can slip
- `Persona` — operator, contributor, end user, clinic engineer
- `Acceptance` — testable, not vibes
