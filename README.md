# Carefold plan pack

Planning pack for the public Apache-2.0 kit: capabilities, epics, stories,
agent + skill contracts, local marketplace UI, and starter Docker / Helm /
Terraform.

This is not the application source. Next.js + Tailwind + Node land in
`spectrayan/carefold` when implementation starts.

## Download

Start in [docs/00-README.md](docs/00-README.md).

| Path | Contents |
|---|---|
| `docs/` | Scope, capabilities, epics, stories, stack, skill + agent contracts, ID index |
| `docker/` | Dockerfile + compose (Ollama as an optional profile) |
| `helm/carefold/` | Chart: Deployment, Service, PVC, ConfigMap, optional Ingress |
| `terraform/` | Helm-release module + kind example |

## Locked decisions

- Name: Carefold · domains carefold.app / carefold.dev
- Stack: Next.js + Tailwind + Node 22
- Default model: local OpenAI-compatible (Ollama)
- Promptly over MCP: **not in this release**
- Spector over MCP: Phase 1, optional
- Public skills and agents: wellness / admin / education only
- Users pick **agents**. Contributors add **skills**. Agents declare skills **and** tools.
- Phase 0 UI: local marketplace + Try in chat. Hosted store is Phase 3.

## Phase 0 launch slice

Stories **CF-S01–S09, S11–S23, S25–S32, S43–S50**. See [docs/06-backlog-index.md](docs/06-backlog-index.md).
