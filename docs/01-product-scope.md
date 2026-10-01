# Carefold product scope

## One sentence

Carefold is a local-first runtime and marketplace for specialist health agents.
An agent is who the user opens. A skill is a reusable job pack. An agent
declares both skills and tools. Carefold runs that agent on a model the
operator already has and keeps chat and tool calls on that machine.

## Intended use (public)

Wellness, care navigation, and clinic-admin help.

Not diagnosis, dosing, triage, or treatment planning.

A clinic that wants clinical skills does that in the private Spectrayan Health
product and accepts manufacturer + HIPAA responsibility.

## Public vs private

| Repo | License | Role |
|---|---|---|
| `spectrayan/carefold` | Apache 2.0 | Runtime, CLI, local app, skill spec, reference skills, Docker/Helm/Terraform |
| `spectrayan/spector` | existing public | Optional memory over MCP. Not required for Phase 0 |
| `spectrayan/promptly` | existing public | **Out of scope for now.** Do not depend on it |
| `spectrayan/spectrayan-health` | proprietary | Clinic product. Consumes Carefold packs later |
| Carefold Cloud | proprietary, later | Hosted index, signing, review, billing, BAA |

Do not open-source `spectrayan-health`. Replace any MIT file in that private
repo with a proprietary notice before anyone treats it as granted.

## Phase 0 — the public kit

Happy path:

```text
docker compose up
# or
npx carefold init
npx carefold agent add visit-steward
npx carefold run --agent visit-steward
```

In the box:

- Next.js app: **marketplace home** of installed agents, one-click **Try in chat**
- Chat scoped to the selected agent; switch agent without losing the page
- Node CLI: `init`, `agent add/list/run`, `skill add/list`, `eval`, `log`
- Agent loader: `agent.yaml` (persona, risk_class, skills[], tools[])
- Skill loader: Agent Skills `SKILL.md` + Carefold `carefold.yaml`
- Tool allow-list = **union of agent.tools and each loaded skill.tools**, still a closed Phase 0 set
- Model adapter: OpenAI-compatible HTTP. Default = Ollama on localhost
- Phase 0 tools: `attach-read`, `workspace-note`, `skill-docs`
- No network tool. No EHR tool. No Promptly
- Append-only JSONL audit log (agent id + tool names; no prompt bodies by default)
- Three reference skills and three bundled agents that compose them
- Python eval pack on skills and on agents
- Docker image + compose; Helm + Terraform starters

Storage: workspace folder + SQLite. No Mongo. No Keycloak. No telemetry.

## Explicitly out of Phase 0

- Hosted / paid marketplace, payments, signed remote packs, clinician review
  (the **local** marketplace UI is in Phase 0)
- Accounts, sync, multi-tenant, org SSO
- Diagnosis, assessment scoring, treatment plans, dosing
- FHIR / EHR connectors
- Spectrayan Health screens
- Default calls to any model vendor
- Crash reports that can contain prompts
- Promptly MCP
- The claim “HIPAA compliant”

Correct line: designed so a covered entity can run it without sending data to Carefold.

## Phase map

| Phase | Outcome | Still not included |
|---|---|---|
| 0 — public kit | Local agent marketplace, Try in chat, CLI, three agents, eval CI, Docker | Hosted index, accounts, clinical tools, Promptly |
| 1 — packs | Install agent/skill from git URL. Optional Spector MCP | Signing, payments |
| 2 — clinic adapter | Private Spectrayan Health loads the same packs | Public clinical skills |
| 3 — Carefold Cloud | Hosted index, signed packs, review, BAA | Separate repo |

## Launch bar for Phase 0

- A new clone opens the marketplace, clicks **Try** on Visit steward, and gets a streamed reply against local Ollama with zero API keys
- Unplugging the network after the model is present still returns a reply
- Eval suite blocks a skill that diagnoses
- Audit log contains tool names and not the user message (default)
- README first sentence does not say “medical” or “HIPAA compliant”
- `docker compose up` brings the app up with no extra services
