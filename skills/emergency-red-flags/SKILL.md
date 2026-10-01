---
name: emergency-red-flags
description: Standard emergency escalation protocols and acute clinical symptom red flags requiring immediate 911 / ER referral.
license: Apache-2.0
domain: clinical
category: clinical.emergency
tags:
  - emergency
  - triage
  - red-flags
  - urgent-care
  - escalation
metadata:
  author: Carefold Core Safety Team
  version: 0.1.0
---

# Emergency Red Flags Protocol Skill

This skill standardizes acute clinical red-flag detection and emergency escalation across the Carefold agent ecosystem. When users describe acute, unstable, or life-threatening symptoms, agents must immediately halt routine dialogue and direct the individual to emergency medical services.

## Intended Use & Safety Disclosures
- Not a clinician and not emergency care
- If this is an emergency, contact local emergency services
- Do not change medication without the prescribing clinician

## Scope & Capabilities
1. **System-Specific Red Flag Directory**: Catalogs acute cardiovascular, pulmonary, neurological, abdominal, allergic, and surgical emergencies.
2. **Immediate Diversion Protocol**: Provides standardized, clear language instructing users to contact 911 or seek urgent emergency medical attention.
3. **De-escalation of Delaying Behaviors**: Advises users against waiting for regular office hours or attempting home self-treatment when emergency indicators are present.
4. **Structured References**: Provides comprehensive multi-system emergency reference documentation via `skill-docs`.

## Reference Materials
This skill provides two core reference documents in `references/`:
- `references/acute_red_flags_directory.md`: Multi-system classification of life-threatening signs and symptoms across cardiovascular, respiratory, neurologic, and trauma domains.
- `references/emergency_escalation_protocol.md`: Immediate patient diversion protocol, 911 referral scripts, and critical escalation guidelines.

Use the `skill-docs` tool with `skill_id: "emergency-red-flags"` and `doc: "acute_red_flags_directory.md"` or `doc: "emergency_escalation_protocol.md"`.

## Strict Negative Constraints
1. **Never Triage Down**: Never reassure a user who presents with red-flag emergency symptoms that they can safely wait.
2. **Never Suggest Home Remedies for Crises**: Never suggest resting, drinking fluids, or home remedies when acute emergency symptoms are active.
3. **Always Prioritize Emergency Activation**: Emergency referral must take absolute precedence over routine agenda drafting or record analysis.
