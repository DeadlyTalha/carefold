# Skill Specification & Inventory

This specification formalizes the `SkillManifest` model defined in `backend/src/carefold/schemas/manifest.py`, detailing the schema, negative constraints, and active inventory of Carefold skill packs.

---

## Skill Manifest Schema

A skill's metadata and constraints are represented by the `SkillManifest` Pydantic model:

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `str` | Yes | Unique kebab-case slug identifier (e.g., `cardiology-prep`). |
| `name` | `str` | Yes | Human-readable name (e.g., `Cardiology Preparation Skill`). |
| `version` | `str` | Yes | Semantic version string (e.g., `0.1.0`). |
| `domain` | `str` | Yes | Taxonomy domain: `clinical`, `navigation`, `wellness`, `therapy`, `education`. |
| `category` | `str` | Yes | Dot-notated hierarchical category path (e.g., `clinical.cardiology`). |
| `description` | `str` | Yes | Detailed description of the skill's purpose and functionality. |
| `tags` | `List[str]` | No | Array of keywords for search and index aggregation. |
| `references` | `List[str]` | No | Array of filenames located under the skill's `references/` directory. |
| `forbidden` | `List[str]` | No | Array of strictly prohibited clinical intent tokens. |
| `intended_use` | `str` | Yes | Mandatory 3-line statement specifying user, task, and boundaries. |
| `instructions` | `str` | Yes | Markdown instructions loaded from `SKILL.md`. |

---

## Negative Safety Constraints

Carefold enforces five standardized forbidden intent tokens across all skills:

1. **`diagnose`**: Prohibits affirming or naming specific medical diagnoses for patient symptoms.
2. **`prescribe`**: Prohibits suggesting, recommending, or initiating prescription pharmacotherapy.
3. **`dose`**: Prohibits calculating drug dosages, titrating medication amounts, or advising timing changes.
4. **`replace_emergency_care`**: Prohibits attempting triage diversion when life-threatening symptoms are present.
5. **`instruct_stop_medication`**: Prohibits instructing a patient to discontinue, adjust, or pause doctor-prescribed medications.

---

## Active Skill Inventory (22 Skills)

Carefold ships with 22 production-grade skills across clinical and administrative domains:

| Skill ID | Name | Category | Primary Reference Documents |
|---|---|---|---|
| `benefits-explainer` | Benefits Explainer | `navigation.insurance` | `EOB_explanation.md`, `checklist.md`, `coinsurance.md`, `glossary.md` |
| `cardiology-prep` | Cardiology Visit Prep | `clinical.cardiology` | `cardiology_visit_agenda.md`, `hypertension_log_template.md`, `red_flag_warning_protocol.md` |
| `claims-appeals-prep` | Claims & Appeals Prep | `navigation.claims` | `appeal_letter_structure_and_evidence_checklist.md`, `claim_denial_code_interpreter.md`, `erisa_and_external_appeal_timeline_guide.md` |
| `clinical-safety-boundaries`| Safety Boundaries | `clinical.safety` | `non_clinical_boundaries.md`, `prescribing_and_dosage_safeguards.md` |
| `derma-prep` | Dermatology Visit Prep | `clinical.dermatology` | `dermatology_body_map_worksheet.md`, `lesion_abcde_tracking_guide.md`, `rash_and_flareup_documentation_protocol.md` |
| `emergency-red-flags` | Emergency Triage Check | `clinical.emergency` | `acute_red_flags_directory.md`, `emergency_escalation_protocol.md` |
| `endocrinology-prep` | Endocrinology Prep | `clinical.endocrinology`| `cgm_and_glucose_log_summary.md`, `endocrinology_visit_checklist.md`, `thyroid_and_metabolic_question_bank.md` |
| `ent-prep` | ENT Consultation Prep | `clinical.ent` | `sinusitis_and_nasal_symptom_tracker.md`, `tinnitus_and_hearing_test_prep_guide.md`, `vertigo_and_dizziness_episode_log.md` |
| `formulary-navigation` | Formulary Navigation | `navigation.formulary` | `copay_assistance_and_foundation_directory.md`, `formulary_tier_and_cost_breakdown_guide.md`, `generic_and_therapeutic_alternative_discussion_agenda.md` |
| `gastro-prep` | Gastroenterology Prep | `clinical.gastroenterology`| `colonoscopy_endoscopy_prep_checklist.md`, `gi_consultation_questions.md`, `ibs_ibd_food_symptom_journal.md` |
| `habit-checkin` | Daily Habit Check-in | `wellness.habits` | *(None)* |
| `nephrology-prep` | Nephrology Visit Prep | `clinical.nephrology` | `fluid_and_sodium_tracking_worksheet.md`, `nephrology_appointment_agenda.md`, `renal_lab_interpretation_guide.md` |
| `neurology-prep` | Neurology Visit Prep | `clinical.neurology` | `cognitive_symptom_timeline.md`, `migraine_headache_diary_template.md`, `neurological_exam_prep_checklist.md` |
| `oncology-prep` | Oncology Navigation Prep | `clinical.oncology` | `chemotherapy_side_effect_tracker.md`, `clinical_trial_discussion_checklist.md`, `multidisciplinary_tumor_board_agenda.md` |
| `ortho-prep` | Orthopedics Visit Prep | `clinical.orthopedics` | `joint_mobility_and_pain_tracker.md`, `orthopedic_surgery_consultation_guide.md`, `physical_therapy_progress_log.md` |
| `prior-auth-prep` | Prior Authorization Prep | `navigation.prior_auth`| `peer_to_peer_preparation_sheet.md`, `prior_authorization_checklist.md`, `step_therapy_appeal_workflow.md` |
| `pulmonology-prep` | Pulmonology Visit Prep | `clinical.pulmonology` | `asthma_copd_action_plan_guide.md`, `dyspnea_symptom_tracker.md`, `inhaler_technique_and_adherence_checklist.md` |
| `records-management` | Medical Records Prep | `navigation.records` | `hipaa_records_request_template.md`, `longitudinal_lab_trend_worksheet.md`, `multiprovider_clinical_dossier_structure.md` |
| `rheuma-prep` | Rheumatology Visit Prep| `clinical.rheumatology` | `autoimmune_flare_log_template.md`, `biologic_therapy_monitoring_guide.md`, `morning_stiffness_and_fatigue_timer.md` |
| `urology-prep` | Urology Visit Prep | `clinical.urology` | `prostate_health_and_psa_discussion_guide.md`, `urology_appointment_checklist.md`, `voiding_diary_and_volume_chart.md` |
| `vision-prep` | Vision & Eye Prep | `clinical.ophthalmology`| `amsler_grid_and_vision_change_log.md`, `cataract_and_eye_surgery_prep_guide.md`, `glaucoma_pressure_and_drop_tracker.md` |
| `visit-prep` | General Clinic Visit Prep| `navigation.appointments`| `appointment_questions.md`, `asthma_checklist.md`, `checklist.md`, `coinsurance_vs_copay.md`, `hydration_checklist.md`, `hypertension_appointment_questions.md`, `questions_guide.md`, `symptom_log_template.md` |

---

## Dynamic Skill Provisioning

When an agent needs a skill or reference document that is not present on disk, `OrchestratorNode` utilizes `SkillGeneratorNode.synthesize_reference_doc` to construct the document structure dynamically in memory. This ensures uninterrupted specialist execution while preserving auditability.
