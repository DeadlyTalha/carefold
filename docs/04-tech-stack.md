# Tech stack

Locked for the public kit. Promptly over MCP is not in this stack.

## Application

| Layer | Choice | Why |
|---|---|---|
| App + API | **Next.js** (App Router) on **Node 22** | One process for UI and `/api`. Large contributor pool |
| UI | **Tailwind CSS** | Marketplace grid + chat |
| Agent format | `agents/<id>/agent.yaml` | Persona + skills[] + tools[] |
| CLI | **Node** (`packages/cli`) | Same language as the runner. Ship as `carefold` bin |
| Runner | TypeScript library used by both Next route handlers and CLI | No second runtime |
| Evals | **Python 3.12** (`evals/`) | Health-eval people live here; CI uses a stub model |
| Skill format | [Agent Skills](https://agentskills.io) `SKILL.md` + `carefold.yaml` | Portable packs |
| Model | OpenAI-compatible HTTP. Default **Ollama** | Local-first, zero keys |
| Store | Workspace directory + **SQLite** | No Mongo, no hosted DB |
| Memory | Optional Spector MCP in Phase 1 | Not required to boot |
| Guardrails | Runner allow-list + evals + refuse template | **No Promptly** for now |

Do not introduce Java, Spring, Angular, LangGraph4j, Vertex, Keycloak, or
Mongo on the default path. Those stay in private Spectrayan Health.

## Repo layout (target)

```text
carefold/
  apps/web/                 # Next.js + Tailwind
  packages/cli/             # carefold bin
  packages/runner/          # agent load, skill load, tools, model, audit
  agents/
    visit-steward/
    benefits-guide/
    habit-companion/
    _template/
  skills/
    _template/
    visit-prep/
    benefits-explainer/
    habit-checkin/
  evals/                    # Python
  docker/
    Dockerfile
    docker-compose.yml
  helm/carefold/
  terraform/
    modules/carefold/
    examples/local-kind/
  docs/
  LICENSE                   # Apache-2.0
```

## Runtime shape

```text
Browser  →  Next.js (App Router)
               ├─ /               marketplace of agents
               ├─ /agents/[id]    detail + Try in chat
               ├─ /chat?agent=    thread scoped to agent
               └─ /api/chat /api/agents /api/skills /api/health /api/audit
                    └─ packages/runner
                         ├─ agent.yaml → skills[] + tools[]
                         ├─ effective tools = union(agent.tools, skill.tools)
                         ├─ model: OpenAI-compatible
                         └─ logs/audit.jsonl  (includes agent_id)
CLI  ─────→  packages/runner   (same library)
```

## Packaging

### Docker

- Multi-stage image from `node:22-alpine` (or distroless node)
- Build Next standalone output
- Run as uid 1000
- Workspace mounted at `/data`
- Port `8080`
- Optional compose profile starts Ollama beside Carefold

### Helm

- Chart name `carefold`
- Resources: Deployment, Service, PersistentVolumeClaim, ConfigMap, optional Ingress
- Ingress **off** by default
- Image pull by digest recommended in values comments

### Terraform

- Module wraps the Helm release
- Assumes an existing kubeconfig
- Does **not** provision a cloud account, RDS, or a public model
- Example under `terraform/examples/local-kind`

Cloud-specific modules (EKS, GKE, ACM certs) are Phase 3 / enterprise, not
the public kit.

## What we will not add in Phase 0

- Promptly MCP client
- Default OpenAI / Anthropic / Vertex keys
- Auth product (NextAuth, Clerk, Keycloak)
- Hosted vector DB
- Browser or shell tools
- Telemetry sidecars
