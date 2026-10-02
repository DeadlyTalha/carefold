# Carefold — Healthcare AI Agent Marketplace & Runtime
# Copyright 2026 Spectrayan
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Carefold extraction and document processing constants (Requirement R6 & Milestone 6).

Centralizes dossier type identifiers, extraction model defaults, prompt keys,
numerical grounding thresholds, and workflow step identifiers.
"""

from __future__ import annotations

from typing import FrozenSet, Tuple

# ============================================================================
# 1. Dossier Schema Types
# ============================================================================

DOSSIER_TYPE_INSURANCE: str = "insurance"
DOSSIER_TYPE_INSURANCE_BENEFITS: str = "insurance_benefits"
DOSSIER_TYPE_CLINICAL: str = "clinical"
DOSSIER_TYPE_CLINICAL_VISIT: str = "clinical_visit"
DOSSIER_TYPE_GENERIC: str = "generic"
DOSSIER_TYPE_GENERIC_DOCUMENT: str = "generic_document"

DEFAULT_DOSSIER_TYPE: str = DOSSIER_TYPE_GENERIC

SUPPORTED_DOSSIER_TYPES: FrozenSet[str] = frozenset({
    DOSSIER_TYPE_INSURANCE,
    DOSSIER_TYPE_INSURANCE_BENEFITS,
    DOSSIER_TYPE_CLINICAL,
    DOSSIER_TYPE_CLINICAL_VISIT,
    DOSSIER_TYPE_GENERIC,
    DOSSIER_TYPE_GENERIC_DOCUMENT,
})

DOSSIER_TYPE_NORMALIZATION: Tuple[Tuple[str, str], ...] = (
    ("insurance_benefits", DOSSIER_TYPE_INSURANCE_BENEFITS),
    ("insurance", DOSSIER_TYPE_INSURANCE_BENEFITS),
    ("clinical_visit", DOSSIER_TYPE_CLINICAL_VISIT),
    ("clinical", DOSSIER_TYPE_CLINICAL_VISIT),
    ("generic_document", DOSSIER_TYPE_GENERIC_DOCUMENT),
    ("generic", DOSSIER_TYPE_GENERIC_DOCUMENT),
)


# ============================================================================
# 2. Extraction Model & Inference Defaults
# ============================================================================

DEFAULT_EXTRACTION_MODEL: str = "llama3.2"
DEFAULT_EXTRACTION_TEMPERATURE: float = 0.0
DEFAULT_EXTRACTION_MAX_TOKENS: int = 2048


# ============================================================================
# 3. Grounding Validation Thresholds & Settings
# ============================================================================

GROUNDING_NUMERICAL_TOLERANCE: float = 1e-6
GROUNDING_MODE_EXACT: str = "exact"
GROUNDING_MODE_NORMALIZED: str = "normalized"


# ============================================================================
# 4. Resource Prompt Keys (prompts.yaml -> extraction)
# ============================================================================

PROMPT_EXTRACTION_SECTION: str = "extraction"
PROMPT_EXTRACTION_INSURANCE_KEY: str = "insurance_benefits"
PROMPT_EXTRACTION_CLINICAL_KEY: str = "clinical_visit"
PROMPT_EXTRACTION_GENERIC_KEY: str = "generic_document"
PROMPT_EXTRACTION_GROUNDING_KEY: str = "grounding_validation"


# ============================================================================
# 5. Workflow Steps and Status Messages
# ============================================================================

EXTRACTION_STEP_INGESTION: str = "ingestion"
EXTRACTION_STEP_SANITIZE: str = "sanitize"
EXTRACTION_STEP_EXTRACT: str = "extract"
EXTRACTION_STEP_VALIDATE: str = "validate"
EXTRACTION_STEP_DONE: str = "done"

MSG_EXTRACTION_COMPLETED: str = (
    "Document extraction completed. Structured dossiers verified."
)
MSG_EXTRACTION_FALLBACK: str = (
    "Extracted document summary and verified numerical figures against source."
)

__all__ = [
    "DEFAULT_DOSSIER_TYPE",
    "DEFAULT_EXTRACTION_MAX_TOKENS",
    "DEFAULT_EXTRACTION_MODEL",
    "DEFAULT_EXTRACTION_TEMPERATURE",
    "DOSSIER_TYPE_CLINICAL",
    "DOSSIER_TYPE_CLINICAL_VISIT",
    "DOSSIER_TYPE_GENERIC",
    "DOSSIER_TYPE_GENERIC_DOCUMENT",
    "DOSSIER_TYPE_INSURANCE",
    "DOSSIER_TYPE_INSURANCE_BENEFITS",
    "DOSSIER_TYPE_NORMALIZATION",
    "EXTRACTION_STEP_DONE",
    "EXTRACTION_STEP_EXTRACT",
    "EXTRACTION_STEP_INGESTION",
    "EXTRACTION_STEP_SANITIZE",
    "EXTRACTION_STEP_VALIDATE",
    "GROUNDING_MODE_EXACT",
    "GROUNDING_MODE_NORMALIZED",
    "GROUNDING_NUMERICAL_TOLERANCE",
    "MSG_EXTRACTION_COMPLETED",
    "MSG_EXTRACTION_FALLBACK",
    "PROMPT_EXTRACTION_CLINICAL_KEY",
    "PROMPT_EXTRACTION_GENERIC_KEY",
    "PROMPT_EXTRACTION_GROUNDING_KEY",
    "PROMPT_EXTRACTION_INSURANCE_KEY",
    "PROMPT_EXTRACTION_SECTION",
    "SUPPORTED_DOSSIER_TYPES",
]
