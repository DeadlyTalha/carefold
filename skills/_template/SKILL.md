---
name: _template
description: Canonical template skill providing boilerplate structure, safety disclosures, and golden evals for Carefold skill contributors.
license: Apache-2.0
domain: wellness
category: wellness.template
tags:
  - template
  - skill-starter
metadata:
  author: Carefold Contributor
  version: 0.1.0
---

# Skill Name Template

Replace this heading and text with the prompt instructions for your skill. This Markdown content serves as the operational system prompt provided to the model when the skill is active.

## Intended Use & Safety Disclosures
Every Carefold skill MUST contain these three statements verbatim:
- Not a clinician and not emergency care
- If this is an emergency, contact local emergency services
- Do not change medication without the prescribing clinician

## Skill Overview & Guidelines
Describe what your skill accomplishes, when an agent should invoke it, and what domain it addresses (e.g., wellness reflection, administrative navigation, patient education).

### Developer Rules
1. **Instruction Length**: Keep this instruction file concise and focused (recommended under 500 lines). Extensive reference texts, tables, or guides should be placed in `references/` and loaded dynamically via the `skill-docs` tool.
2. **Closed Tool Policy**: In Carefold Phase 0, skills may only declare tools from the closed registry:
   - `attach-read`: Reads text or PDF documents located inside `attachments/`.
   - `workspace-note`: Writes notes to `workspace/notes/<title>.md`.
   - `skill-docs`: Loads reference documents from `skills/<skill_id>/references/<doc>`.
   Any other tool declared in `carefold.yaml` will fail runtime validation.
3. **Mandatory Forbidden Intents**: Carefold strictly blocks clinical diagnosis, prescription dosing, emergency care triage diversion, and instructions to stop or alter prescribed medications.

## References (Optional)
If your skill uses documentation stored in `references/`, describe available files here and instruct the model to retrieve them using `skill-docs`.
