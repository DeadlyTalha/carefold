# Capabilities

A capability is an outcome the product must be able to deliver. Epics and
stories live under these IDs.

Priority is for Phase 0 unless noted.

---

## CF-C1 — Local-first runtime

An operator can run Carefold on one machine, open an installed agent, and
keep every prompt, tool call, and note on disk they control.

**Done when:** the default install has no cloud account, no telemetry, and
works after the network is unplugged (model already downloaded).

**Phase:** 0

---

## CF-C2 — Skill packs

A contributor can add a health skill as a folder (`SKILL.md` + `carefold.yaml`)
without touching the runtime. The runner loads only declared tools and
enforces `risk_class` + `forbidden`.

**Done when:** a skill PR is a folder plus an eval file, and CI can accept or
reject it without a human reading the prompt.

**Phase:** 0

---

## CF-C3 — Safe public catalog

The public kit only ships and installs `wellness`, `admin`, and `education`
skills. Clinical-sounding answers are blocked by evals and by runner rules,
not only by prompt text.

**Done when:** `carefold eval` fails a skill that diagnoses, prescribes, or
replaces emergency care.

**Phase:** 0

---

## CF-C4 — Operator visibility

The operator can see which skill ran, which tools fired, and whether a tool
was denied — without Carefold storing the conversation in a vendor log.

**Done when:** the audit viewer and `carefold log` show the same JSONL file.

**Phase:** 0

---

## CF-C5 — Contributor kit

A first-time contributor can clone the repo, run tests, copy a template
skill, and open a PR without Java, GCP, or the Spectrayan Health monorepo.

**Done when:** `CONTRIBUTING.md` path is copy template → write evals → CI green.

**Phase:** 0

---

## CF-C6 — Package and self-host

The same image that runs on a laptop can run under Docker Compose, Helm, or
Terraform-managed Kubernetes. Defaults stay local (SQLite, no ingress auth
product, no cloud model).

**Done when:** compose, helm install, and terraform apply each produce a
running Carefold with documented values overrides.

**Phase:** 0 (compose required, helm/terraform ship as starter)

---

## CF-C11 — Named agents

The unit a user picks is an agent. An agent has a persona, a risk class, a
list of skills, and its own tool list. The runner activates only those
skills and the union of agent tools + skill tools.

**Done when:** marketplace cards open chat on that agent, and a tool not in
the union is denied.

**Phase:** 0

---

## CF-C12 — Local agent marketplace

The home screen is a marketplace of installed (and bundled) agents. Each
card shows what the agent is for, its skills, its tools, and a Try control
that drops the user into chat with that agent already selected.

**Done when:** three bundled agents are tryable without a CLI command, and
switching agents starts a clean thread scoped to the new agent.

**Phase:** 0  
**Not:** hosted index, payments, accounts. That is CF-C10.

---

## CF-C7 — Pack install from git (later)

An operator can add a skill from a git URL and pin a commit. Unsigned remote
packs are allowed only with an explicit flag.

**Phase:** 1

---

## CF-C8 — Optional local memory (later)

Spector can attach over MCP for durable memory. Carefold must run without it.

**Phase:** 1  
**Not:** Promptly.

---

## CF-C9 — Clinic adapter (private)

Spectrayan Health loads the same skill folders behind tenant policy and the
existing PHI audit filter.

**Phase:** 2 · **Repo:** private

---

## CF-C10 — Carefold Cloud (later, proprietary)

Hosted index, signed packs, review queue, billing, BAA. Separate repo.

**Phase:** 3 · **Repo:** private
