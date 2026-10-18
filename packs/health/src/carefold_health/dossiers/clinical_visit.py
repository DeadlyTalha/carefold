# Carefold — Healthcare AI Agent Marketplace & Runtime
# Copyright 2026 Spectrayan (https://spectrayan.com)
#
# Licensed under the PolyForm Noncommercial License 1.0.0 and the
# Carefold Additional Terms (see LICENSE and ADDITIONAL-TERMS.md).
# Personal and household local use only. Commercial use, hosted service
# offering, rebranding, white-labeling, and redistribution of modified
# forks are prohibited without a written commercial license from Spectrayan.
#
# Required Notice: Copyright 2026 Spectrayan (https://spectrayan.com)

"""Clinical encounter visit extraction dossier."""

from __future__ import annotations

from typing import List
from pydantic import Field
from yarvelle_core.workflows.subgraphs.extraction.dossiers import BaseDossier


class ClinicalVisitDossier(BaseDossier):
    """Structured extraction dossier for physician encounter notes and visit summaries."""

    reason_for_visit: str = Field(
        default="",
        description="Primary clinical chief complaint or reason for encounter.",
    )
    physician_instructions: List[str] = Field(
        default_factory=list,
        description="Care instructions, lifestyle advice, or physician directives.",
    )
    follow_up_timeline: str = Field(
        default="",
        description="Scheduled follow-up timing or interval (e.g. '4 weeks').",
    )
    questions_to_ask: List[str] = Field(
        default_factory=list,
        description="Suggested or patient-prepared questions for future appointments.",
    )

    @property
    def dossier_type(self) -> str:
        return "clinical_visit"


__all__ = ["ClinicalVisitDossier"]
