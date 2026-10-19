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

"""Backward-compatibility re-export shim for yarvelle_core.workflows.subgraphs.extraction.dossiers."""

from __future__ import annotations

import sys
from typing import Any

from yarvelle_core.workflows.subgraphs.extraction.dossiers import *  # noqa: F401, F403
import yarvelle_core.workflows.subgraphs.extraction.dossiers as _target_module

# Eagerly register health dossiers into extraction registry and attach to target module
try:
    from carefold_health.dossiers import (
        ClinicalVisitDossier,
        InsuranceBenefitsDossier,
    )
    from yarvelle_core.workflows.subgraphs.extraction.dossiers import register_dossier_type

    register_dossier_type("clinical_visit", ClinicalVisitDossier)
    register_dossier_type("clinical", ClinicalVisitDossier)
    register_dossier_type("insurance_benefits", InsuranceBenefitsDossier)
    register_dossier_type("insurance", InsuranceBenefitsDossier)

    setattr(_target_module, "ClinicalVisitDossier", ClinicalVisitDossier)
    setattr(_target_module, "InsuranceBenefitsDossier", InsuranceBenefitsDossier)
except ImportError:
    pass

sys.modules[__name__] = _target_module


def __getattr__(name: str) -> Any:
    return getattr(_target_module, name)


def __dir__() -> list[str]:
    return sorted(set(globals().keys()) | set(dir(_target_module)))
