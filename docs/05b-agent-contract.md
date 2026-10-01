# Agent contract

The unit a user picks in the marketplace is an **agent**.
A skill remains the unit a contributor adds.
An agent owns **skills and tools**.

## Folder

```text
agents/visit-steward/
  agent.yaml                 # required
  README.md                  # short marketplace description
  starters.json              # suggested prompts for Try in chat
  evals/golden.jsonl         # agent-level allow / refuse
```

Skills stay under `skills/`. The agent only references their ids.

## agent.yaml

```yaml
id: visit-steward
title: Visit steward
version: 0.1.0
license: Apache-2.0
risk_class: wellness          # wellness | admin | education | clinical_assist
model: llama3.2               # optional override; else workspace default
skills:
  - visit-prep
  - habit-checkin
tools:
  - workspace-note
  - skill-docs
forbidden:
  - diagnose
  - prescribe
  - dose
  - replace_emergency_care
  - instruct_stop_medication
persona: |
  You help someone prepare for a wellness or therapy visit.
  You do not diagnose, dose, or change a care plan.
  If they describe an emergency, tell them to use local emergency services.
```

## How tools resolve

```text
effective_tools = unique( agent.tools ∪ skill.tools for skill in agent.skills )
```

Then intersect with the Phase 0 registry:

- `attach-read`
- `workspace-note`
- `skill-docs`

A name not in the registry fails agent load (do not start the chat).
A tool the model calls that is not in `effective_tools` is denied and audited.

Skills can declare tools they need. The agent can add tools the persona
needs even if no skill listed them (example: Benefits guide adds
`attach-read` next to `benefits-explainer`). The agent can also omit a
skill tool by not listing that skill.

Phase 0 does **not** let an agent declare HTTP, shell, browser, or EHR tools.

## How skills resolve

Only ids in `agent.skills` may activate. An installed skill that is not on
the agent is invisible to that session.

## Marketplace fields

`README.md` first paragraph is the card subtitle.
`starters.json`:

```json
["What should I ask at therapy on Thursday?", "Help me list what has been getting harder this month."]
```

These render as chips on **Try in chat**.

## Risk

If any listed skill is `clinical_assist`, the agent is `clinical_assist`
regardless of what `agent.yaml` says. Public marketplace shows only
`wellness`, `admin`, and `education`.
