# Epics and stories

Format: As a **persona**, I want **action**, so that **outcome**.

Acceptance criteria are the contract. If it is not in Acceptance, it is not
in the story.

Personas:

- **Operator** — person who runs Carefold on a laptop or cluster
- **End user** — person talking to a skill (may be the same as operator)
- **Contributor** — writes a skill or a runtime PR
- **Maintainer** — Spectrayan engineer owning the public repo

---

# Phase 0

## CF-E1 — App shell and chat

Capability: CF-C1  
Stack: Next.js App Router + Tailwind

### CF-S01 — Open the local app
Phase 0 · P0 · End user

As an end user, I want the app to open on the agent marketplace, so that I
can see who I can try without creating an account.

Acceptance:

- Default route is the marketplace, not a blank chat
- No sign-in, no email, no cloud identity
- Empty state explains “add an agent” when none are installed
- Skills are not the primary picker (see CF-S44, CF-S48)

### CF-S02 — Stream a reply
Phase 0 · P0 · End user

As an end user, I want the reply to stream, so that I know the skill is working.

Acceptance:

- Tokens appear as they arrive from the local model adapter
- A stop control cancels the in-flight request
- A failed model connection shows a plain error (Ollama not reachable), not a stack trace

### CF-S03 — Show tool trace
Phase 0 · P0 · End user / operator

As an operator, I want to see which tools the skill called, so that I know
what touched the workspace.

Acceptance:

- Each tool call shows name, allowed/denied, and duration
- Denied tools show the reason (`not in carefold.yaml` or `forbidden`)
- Tool arguments that look like file paths are shown; raw user text is not copied into the trace by default

### CF-S04 — Attach a local file
Phase 0 · P0 · End user

As an end user, I want to drop a PDF or text file into the chat, so that
`benefits-explainer` can read it.

Acceptance:

- File is copied into the workspace attachments folder
- Only the `attach-read` tool can open it
- Binary files that are not text/PDF are rejected with a message
- Attachment never leaves the machine

### CF-S05 — Disclaimer and intended use
Phase 0 · P0 · End user

As an end user, I want a persistent notice that this is not a clinician,
so that I do not treat the reply as care.

Acceptance:

- Notice is visible on first run and on every chat header
- Copy: wellness / navigation / admin help — not diagnosis or treatment
- Notice cannot be removed from the public build

---

## CF-E2 — Node CLI

Capability: CF-C1, CF-C5

### CF-S06 — `carefold init`
Phase 0 · P0 · Operator

As an operator, I want `carefold init` to create a workspace, so that I have
a known folder for skills, chats, and logs.

Acceptance:

- Creates `skills/`, `chats/`, `attachments/`, `logs/audit.jsonl`, `carefold.config.json`
- Default model base URL is `http://127.0.0.1:11434/v1` (Ollama)
- Refuses to overwrite an existing workspace unless `--force`
- Writes Apache-2.0 notice into the workspace README stub

### CF-S07 — `carefold skill add` (bundled)
Phase 0 · P0 · Operator

As an operator, I want to add a bundled reference skill by name, so that I
can try Carefold without writing a pack.

Acceptance:

- `carefold skill add visit-prep` copies the pack into `skills/visit-prep`
- Unknown names exit non-zero with the list of bundled skills
- Does not fetch from the network

### CF-S08 — `carefold skill list`
Phase 0 · P0 · Operator

As an operator, I want to list installed skills and their risk class.

Acceptance:

- Prints id, version, risk_class, license
- Skills missing `carefold.yaml` list as `unverified` and `wellness` default
- `clinical_assist` skills print a warning and are skipped unless `--allow-clinical`

### CF-S09 — `carefold run`
Phase 0 · P0 · Operator

As an operator, I want to send one prompt from the terminal to an agent
(or, for contributors, to a raw skill).

Acceptance:

- `carefold run --agent visit-steward "what should I ask my therapist?"`
- `--skill visit-prep` still works for contributors
- Uses the same runner as the app
- Exit 0 on success, non-zero on model/tool failure
- Writes an audit line that includes `agent_id` when an agent ran

### CF-S10 — `carefold log`
Phase 0 · P1 · Operator

As an operator, I want to print the last audit events.

Acceptance:

- Reads `logs/audit.jsonl`
- Default omits prompt and completion fields
- `--full` includes them only if `audit.store_bodies` is true in config

---

## CF-E3 — Skill runner

Capability: CF-C2, CF-C3

### CF-S11 — Load Agent Skills + carefold.yaml
Phase 0 · P0 · Contributor

As a contributor, I want the runner to load a standard `SKILL.md` folder, so
that the same pack works in other Agent Skills hosts.

Acceptance:

- Requires `SKILL.md` with YAML `name` and `description`
- Reads optional `carefold.yaml` for risk_class, tools, forbidden, evals
- Missing `carefold.yaml` → risk_class `wellness`, tools = none, unverified

### CF-S12 — Tool allow-list
Phase 0 · P0 · Operator

As an operator, I want a skill to call only the tools it declared.

Acceptance:

- Model tool-call for an undeclared tool is denied and logged
- Effective allow-list = union(`agent.tools`, each loaded `skill.tools`)
- Closed Phase 0 registry: `attach-read`, `workspace-note`, `skill-docs`
- No HTTP / browser / shell tool is registered in the public build
- A tool listed on the agent but not in the registry is denied at load time

### CF-S13 — Forbidden intents
Phase 0 · P0 · End user

As an end user, I want the runner to refuse diagnosis and dosing, so that a
skill cannot hide those answers in prompt wording only.

Acceptance:

- `carefold.yaml` `forbidden` list is applied to the outgoing system contract
- Output classifier (eval + lightweight runtime check) flags
  “you have [diagnosis]”, “take N mg”, “don’t go to the ER”
- On flag: reply is replaced with a refuse template and an audit event `refused`

### CF-S14 — Risk class gate
Phase 0 · P0 · Operator

As an operator, I want `clinical_assist` packs to stay inert in the public kit.

Acceptance:

- Installer and app hide `clinical_assist` by default
- `--allow-clinical` prints: operator is manufacturer of record
- Bundled catalog contains zero `clinical_assist` packs

### CF-S15 — OpenAI-compatible model adapter
Phase 0 · P0 · Operator

As an operator, I want to point Carefold at any OpenAI-compatible server.

Acceptance:

- Config: `baseUrl`, `model`, optional `apiKey`
- Default: Ollama `llama3.2` (or documented fallback) with empty apiKey
- Cloud vendors are opt-in via config, never default
- Health check endpoint reports model reachability

---

## CF-E4 — Reference skills

Capability: CF-C3

### CF-S16 — `visit-prep`
Phase 0 · P0 · End user

As an end user, I want help listing questions for an upcoming therapy or
wellness visit, so that I walk in prepared.

Acceptance:

- Produces a question list and a “tell your clinician” note
- Refuses to name a condition or recommend a treatment
- Golden evals include two refuse cases

### CF-S17 — `benefits-explainer`
Phase 0 · P0 · End user

As an end user, I want a plain-language summary of a benefits PDF I attach,
so that I know what to ask my plan — not what the plan will pay.

Acceptance:

- Uses `attach-read` only
- Labels uncertainty (“this line is unclear”)
- Does not claim coverage or eligibility
- Refuse case: “will they cover my surgery?”

### CF-S18 — `habit-checkin`
Phase 0 · P0 · End user

As an end user, I want a non-clinical daily check-in, so that I can jot
sleep / movement / mood words without a diagnosis.

Acceptance:

- Offers reflection prompts
- Writes an optional note via `workspace-note`
- Refuses scoring, labeling, or “you are depressed”

### CF-S19 — Skill template
Phase 0 · P0 · Contributor

As a contributor, I want `skills/_template` to copy, so that a first skill
PR does not invent a layout.

Acceptance:

- Contains `SKILL.md`, `carefold.yaml`, `evals/golden.jsonl` with 5 rows
- Two of the five rows are refuse cases
- README section “good first skill” points here

---

## CF-E5 — Evals and CI

Capability: CF-C3, CF-C5

### CF-S20 — Golden eval runner
Phase 0 · P0 · Contributor

As a contributor, I want `carefold eval` (Python) to run golden prompts
against a skill.

Acceptance:

- Reads `evals/golden.jsonl`
- Each row: `prompt`, `expect` = `allow` | `refuse`, optional `must_not` strings
- Exit non-zero if any refuse case is answered as allow
- Can run with a recorded stub model so CI does not need a GPU

### CF-S21 — Safety eval pack
Phase 0 · P0 · Maintainer

As a maintainer, I want a shared list of prompts that every public skill
must refuse.

Acceptance:

- Shared file `evals/safety.golden.jsonl` is unioned into every skill run
- Covers diagnosis-as-fact, dosing, “skip the ER”, “stop your medication”
- CI job `eval` is required on pull requests that touch `skills/`

### CF-S22 — Offline CI
Phase 0 · P0 · Maintainer

As a maintainer, I want PR checks to run with the network disabled after
deps are installed.

Acceptance:

- Unit tests and eval-with-stub do not call the public internet
- A job fails if a new runtime dependency is a cloud SDK used on the default path

---

## CF-E6 — Audit and config

Capability: CF-C4

### CF-S23 — JSONL audit log
Phase 0 · P0 · Operator

As an operator, I want every run to append one or more audit events.

Acceptance:

- Fields: `ts`, `agent_id`, `skill_id`, `skill_version`, `event` (`run|tool|refuse|error`),
  `tool`, `allowed`, `reason`
- Default: no `prompt`, no `completion`
- File is append-only; app never truncates it from the UI

### CF-S24 — Audit viewer
Phase 0 · P1 · Operator

As an operator, I want a page in the app that tails the audit file.

Acceptance:

- Same data as `carefold log`
- Filter by skill and event type
- No delete button in Phase 0

### CF-S25 — Workspace config
Phase 0 · P0 · Operator

As an operator, I want `carefold.config.json` to be the only config file.

Acceptance:

- Keys: `model.baseUrl`, `model.model`, `model.apiKey`, `audit.store_bodies`,
  `allow_clinical`, `telemetry` (must default false and be ignored if true in public build)
- Invalid JSON prevents startup with a clear error

---

## CF-E7 — Docs and governance (OSS)

Capability: CF-C5

### CF-S26 — README intended use
Phase 0 · P0 · Maintainer

As a maintainer, I want the first paragraph to state local-first + not care.

Acceptance:

- First sentence does not contain “medical device”, “HIPAA compliant”, or “diagnose”
- Quickstart uses Docker Compose or CLI, zero API keys
- Links ACCEPTABLE_USE and SECURITY

### CF-S27 — ACCEPTABLE_USE
Phase 0 · P0 · Contributor

As a contributor, I want written rules for what a public skill may do.

Acceptance:

- Allowed: wellness, admin, education, care navigation
- Forbidden: diagnosis, dosing, triage as care, assessment scoring IP,
  scraping PHI to a vendor
- Clinical packs are documented as out of repo

### CF-S28 — SECURITY
Phase 0 · P0 · Operator

As an operator, I want a short threat model.

Acceptance:

- States: no data is sent to Carefold Inc by default
- Operator is responsible if they put PHI on the box (HIPAA stays with them)
- Documents model-vendor risk if they set a cloud `baseUrl`
- Documents that Promptly is not in this release

### CF-S29 — CONTRIBUTING
Phase 0 · P0 · Contributor

As a contributor, I want a path that does not require the health monorepo.

Acceptance:

- Skill PR checklist
- Runtime PR requires a linked issue
- License: Apache 2.0 DCO or CLA note (pick one, document it)
- Code of conduct link

### CF-S30 — License and NOTICE
Phase 0 · P0 · Maintainer

As a maintainer, I want Apache 2.0 at the repo root.

Acceptance:

- `LICENSE` is Apache 2.0
- `NOTICE` names Spectrayan
- Third-party licenses listed

---

## CF-E8 — Docker

Capability: CF-C6

### CF-S31 — Production image
Phase 0 · P0 · Operator

As an operator, I want a single image that serves the Next.js app and the
Node API/CLI.

Acceptance:

- Multi-stage Dockerfile, non-root user
- Listens on `8080`
- No secrets baked in
- `HEALTHCHECK` hits `/api/health`

### CF-S32 — docker compose
Phase 0 · P0 · Operator

As an operator, I want `docker compose up` for the laptop path.

Acceptance:

- One service: `carefold`
- Volume for `/data` workspace
- Optional profile `ollama` that adds a sibling Ollama container
- Default compose does not publish extra ports or pull a cloud model

### CF-S33 — Image SBOM / provenance note
Phase 0 · P2 · Maintainer

As a maintainer, I want a published digest and a short supply-chain note.

Acceptance:

- Release publishes image digest
- Docs say how to pin by digest in compose and Helm

---

## CF-E9 — Helm

Capability: CF-C6

### CF-S34 — Helm chart
Phase 0 · P1 · Operator

As an operator, I want `helm install carefold ./helm/carefold` on a cluster
I already run.

Acceptance:

- Templates: Deployment, Service, PVC, ConfigMap, optional Ingress
- Values: image, replicaCount=1, persistence enabled, model.baseUrl
- No default cloud API key
- Ingress is off by default

### CF-S35 — Chart values documentation
Phase 0 · P1 · Operator

As an operator, I want every value documented in `values.yaml` comments
and `README.md` in the chart.

Acceptance:

- Examples for in-cluster Ollama vs external model URL
- Warning that Ingress + public internet + PHI is the operator’s problem

---

## CF-E10 — Terraform

Capability: CF-C6

### CF-S36 — Terraform module (Helm release)
Phase 0 · P1 · Operator

As an operator, I want a Terraform module that installs the chart onto an
existing Kubernetes cluster.

Acceptance:

- Inputs: kube context / kubeconfig path, namespace, image, model URL, PVC size
- Uses the Helm provider
- Creates namespace
- No AWS/GCP account resources required for the default module
- `terraform apply` is idempotent

### CF-S37 — Terraform examples
Phase 0 · P2 · Operator

As an operator, I want an `examples/local-kind` folder, so that I can try
the module without a cloud bill.

Acceptance:

- README for kind / k3d
- Example tfvars with Ollama on the host network documented

---

## CF-E15 — Agents compose skills and tools

Capability: CF-C11

### CF-S43 — Load `agent.yaml`
Phase 0 · P0 · Contributor

As a contributor, I want an agent to be a folder with `agent.yaml`, so that
persona, skills, and tools are versioned together.

Acceptance:

- Required fields: `id`, `title`, `version`, `risk_class`, `skills`, `tools`, `persona`
- `skills` is a list of skill ids that must exist in the workspace
- `tools` is a list from the closed registry (may be empty)
- Missing skill id fails load with the missing id named
- `clinical_assist` agents stay inert unless `--allow-clinical`

### CF-S44 — Chat is scoped to an agent
Phase 0 · P0 · End user

As an end user, I want every message in a thread to run as the selected
agent, so that skills and tools do not leak across agents.

Acceptance:

- Thread stores `agent_id`
- Runner loads only that agent's skills
- Effective tools = union of agent.tools and those skills' tools
- Switching agent creates a new thread; old thread stays readable

### CF-S45 — Bundled agents
Phase 0 · P0 · End user

As an end user, I want three agents ready after init, so that I can try
Carefold without writing YAML.

Acceptance:

| Agent id | Title | Skills | Tools |
|---|---|---|---|
| `visit-steward` | Visit steward | `visit-prep`, `habit-checkin` | `workspace-note`, `skill-docs` |
| `benefits-guide` | Benefits guide | `benefits-explainer` | `attach-read`, `skill-docs` |
| `habit-companion` | Habit companion | `habit-checkin` | `workspace-note` |

- Each has `risk_class: wellness` and a refuse persona line
- Each has at least two agent-level golden evals (one allow, one refuse)

### CF-S46 — Agent cannot activate undeclared skills
Phase 0 · P0 · Operator

As an operator, I want the runner to ignore a model request to use a skill
that is not on the agent.

Acceptance:

- Only `skills[]` in `agent.yaml` are eligible for activation
- Attempt to pull another installed skill is denied and audited
- CLI `carefold agent inspect visit-steward` prints skills + tools

### CF-S47 — Agent CLI
Phase 0 · P0 · Operator

As an operator, I want agent commands that match skill commands.

Acceptance:

- `carefold agent list` — id, title, risk_class, skill count, tool count
- `carefold agent add visit-steward` — copies a bundled agent
- `carefold run --agent visit-steward "..."` — see CF-S09
- `carefold eval --agent visit-steward` — runs skill evals plus agent evals

---

## CF-E16 — Local marketplace and Try in chat

Capability: CF-C12

### CF-S48 — Marketplace home
Phase 0 · P0 · End user

As an end user, I want a grid of agent cards as the home screen, so that I
can browse who is available.

Acceptance:

- Card shows title, one-line description, risk class, skill names, tool names
- Search and filter by risk class (`wellness` / `admin` / `education`)
- Bundled agents appear after `init` with a “Bundled” badge
- Unverified agents (no `agent.yaml` tools/skills valid) show a warning badge
- Layout works at 390px and desktop

### CF-S49 — Agent detail
Phase 0 · P0 · End user

As an end user, I want a detail view before I talk, so that I know what
the agent is allowed to do.

Acceptance:

- Full persona summary (not the raw system prompt dump)
- Lists skills with one-line descriptions from `SKILL.md`
- Lists tools the agent can actually fire (the union)
- Intended-use disclaimer on the page
- Primary action: **Try in chat**
- Secondary: copy `carefold run --agent <id>` 

### CF-S50 — Try in chat
Phase 0 · P0 · End user

As an end user, I want one control on the card and on the detail page that
opens chat with that agent already selected.

Acceptance:

- **Try in chat** routes to `/chat?agent=<id>` (or equivalent) with a new thread
- Chat header shows agent title and a “Change agent” control back to marketplace
- Suggested starter prompts from the agent folder render as tappable chips
- First send uses the selected agent; no extra “pick a skill” step
- If the model is down, the chat still opens and the error is in-thread

### CF-S51 — Switch agent from chat
Phase 0 · P1 · End user

As an end user, I want to switch agents without going through settings.

Acceptance:

- Header control lists installed agents
- Choosing another agent starts a new thread
- Previous thread remains in a history list labeled by agent title

### CF-S52 — Marketplace empty / add
Phase 0 · P1 · Operator

As an operator, I want the marketplace to explain how to add an agent when
the list is empty.

Acceptance:

- Points at `carefold agent add visit-steward`
- Does not send the browser to a hosted store in Phase 0

---

# Phase 1

## CF-E11 — Remote pack install

Capability: CF-C7

### CF-S38 — Install from git URL
Phase 1 · P0 · Operator

As an operator, I want `carefold skill add https://git.../skill.git#<sha>`.

Acceptance:

- Pins to a commit
- Requires `--allow-remote`
- Records source URL + sha in `carefold.yaml` install metadata
- Runs evals before enabling the skill if evals exist

### CF-S39 — Remote catalog entries
Phase 1 · P1 · End user

As an end user, I want marketplace cards for agents I installed from git
(CF-S38), so that remote packs look like bundled ones.

Acceptance:

- Card shows source URL + pinned sha
- Unverified badge when `agent.yaml` or `carefold.yaml` is missing
- Try in chat uses the same CF-S50 path
- This is not a hosted store; no payments

---

## CF-E12 — Optional Spector MCP

Capability: CF-C8

### CF-S40 — Attach Spector if present
Phase 1 · P2 · Operator

As an operator, I want Carefold to use Spector over MCP when I set a
socket/URL, so that a skill can remember prior notes.

Acceptance:

- Carefold starts if Spector is absent
- No Promptly client is added in this epic
- Memory writes are workspace-local and appear in the audit log as `tool=spector.*`

---

# Phase 2 (private repo)

## CF-E13 — Spectrayan Health adapter

Capability: CF-C9

### CF-S41 — Load Carefold packs in the clinic app
Phase 2 · P0 · Clinic engineer

As a clinic engineer, I want Spectrayan Health to load the same skill
folder, so that we do not fork packs.

Acceptance:

- Adapter implements `attach-read` / `workspace-note` against tenant storage
- Existing PHI audit filter still fires
- Public Carefold repo does not import this adapter

---

# Phase 3 (proprietary)

## CF-E14 — Carefold Cloud

Capability: CF-C10

### CF-S42 — Signed pack index
Phase 3 · P0 · Operator

As an operator, I want a hosted index of signed packs.

Acceptance:

- Separate repo
- BAA path exists before any PHI is accepted
- Public Apache kit still runs with the index disabled

---

# Story count

| Phase | Stories |
|---|---|
| 0 | CF-S01 … CF-S37, CF-S43 … CF-S52 |
| 1 | CF-S38 … CF-S40 |
| 2 | CF-S41 |
| 3 | CF-S42 |

P0 in Phase 0 is the launch bar. Helm and Terraform are P1: they ship in the
repo but do not block the first public tag if compose works. Marketplace +
Try in chat (S48–S50) **are** P0 — that is the product surface.
