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

"""Health insurance benefits and explanation of benefits extraction dossier."""

from __future__ import annotations

from typing import Dict, List
from pydantic import Field
from yarvelle_core.workflows.subgraphs.extraction.dossiers import BaseDossier


class InsuranceBenefitsDossier(BaseDossier):
    """Structured extraction dossier for health insurance summary and EOB documents."""

    deductible: str = Field(
        default="",
        description="Annual deductible amount (e.g. '$1,500').",
    )
    copays: Dict[str, str] = Field(
        default_factory=dict,
        description="Copayment amounts mapped by service type (e.g. {'primary_care': '$25'}).",
    )
    coinsurance: str = Field(
        default="",
        description="Coinsurance cost-sharing percentage (e.g. '20%').",
    )
    out_of_pocket_maximum: str = Field(
        default="",
        description="Maximum annual out-of-pocket liability (e.g. '$6,000').",
    )
    in_out_network_rules: str = Field(
        default="",
        description="Rules, coverage rates, and referral requirements for in- vs out-of-network.",
    )
    prior_authorization_flags: List[str] = Field(
        default_factory=list,
        description="List of medical procedures or services requiring pre-authorization.",
    )

    @property
    def dossier_type(self) -> str:
        return "insurance_benefits"


__all__ = ["InsuranceBenefitsDossier"]
