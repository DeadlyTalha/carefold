# Automated Triage Auditor Agent

The **Automated Triage Auditor** (`triage-auditor`) is an internal system infrastructure safety agent operating within Carefold (`agents/_system/triage-auditor/`).
It continuously monitors and audits multi-turn conversation states to detect latent clinical deterioration, escalating physiological instability, and acute medical emergency red flags.

## Architectural Role & Purpose

Carefold provides specialized clinical and administrative navigation agents for patient education, visit preparation, and healthcare navigation. In digital health interactions, patients may inadvertently disclose subtle or worsening symptoms that indicate acute medical crises rather than routine informational inquiries.

The Automated Triage Auditor operates as a background system sentinel (`hidden: true`, `risk_class: admin`):
1. **Multi-Turn Surveillance**: Evaluates dialogue turn state representations across active agent threads.
2. **Latent Urgency Detection**: Identifies subtle clinical deterioration across organ systems (cardiovascular, respiratory, neurological, oncological, pediatric).
3. **Emergency Red-Flag Diversion**: Triggers immediate runtime escalations and emergency 911 / 988 referral banners when life-threatening symptoms are detected.
4. **Policy Enforcement**: Ensures user-facing agents maintain strict boundaries against clinical diagnosis, prescribing, and unauthorized triage.

## 4-Step Structured Audit Lifecycle

1. **Context & State Extraction**: Ingests chronological dialogue history, system prompts, active domain agent persona, and tool traces.
2. **Clinical Urgency Screening**: Screens conversational transcripts against established red-flag taxonomy rules and acute emergency patterns.
3. **Audit Verdict Formulation**: Categorizes the turn into one of three operational states:
   - `SAFE`: Proceed with standard educational navigation.
   - `WARNING`: Reinforce clinical disclaimer and recommend clinician consultation.
   - `ESCALATE`: Mandate immediate emergency diversion to emergency services.
4. **System Directives Emission**: Emits structured directives back to the orchestrator execution graph to enforce runtime safety policies.

## Manifest & Taxonomy Specification

- **Directory**: `agents/_system/triage-auditor/`
- **Identifier**: `triage-auditor`
- **Domain**: `clinical`
- **Category**: `clinical.triage`
- **Risk Class**: `admin`
- **Care Stages**: `pre_visit`, `during_visit`, `daily_living`
- **Target Audience**: `internal_system`
- **Icon**: `ShieldAlert`
- **Hidden**: `true` (excluded from default public marketplace listings)
- **Tools**: `[]` (pure evaluation agent; executes zero external tools)
- **Skills**: `[]` (internal meta-agent; operates without companion skills)

## Non-Clinical Safety Boundaries

The Automated Triage Auditor is strictly an internal software audit and classification agent, NOT a telemedicine physician, triage nurse, or emergency dispatcher:
- **Never Diagnoses**: Forbidden from emitting clinical diagnostic assertions.
- **Never Prescribes or Doses**: Forbidden from suggesting medication initiations or dose calculations.
- **Never Replaces Emergency Care**: Immediately diverts life-threatening emergencies to 911 / 988.
- **Never Modifies Treatment**: Forbidden from instructing patients to alter or discontinue prescribed regimens.
