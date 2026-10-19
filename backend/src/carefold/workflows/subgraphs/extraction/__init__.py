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

"""Backward-compatibility re-export shim for yarvelle_core.workflows.subgraphs.extraction."""

from __future__ import annotations

import sys
from typing import Any

from yarvelle_core.workflows.subgraphs.extraction import *  # noqa: F401, F403
import yarvelle_core.workflows.subgraphs.extraction as _target_module

try:
    from carefold_health.dossiers import (
        ClinicalVisitDossier,
        InsuranceBenefitsDossier,
    )
    setattr(_target_module, "ClinicalVisitDossier", ClinicalVisitDossier)
    setattr(_target_module, "InsuranceBenefitsDossier", InsuranceBenefitsDossier)
except ImportError:
    pass


def __getattr__(name: str) -> Any:
    if name == "ClinicalVisitDossier":
        try:
            from carefold_health.dossiers import ClinicalVisitDossier
            return ClinicalVisitDossier
        except ImportError:
            pass
    if name == "InsuranceBenefitsDossier":
        try:
            from carefold_health.dossiers import InsuranceBenefitsDossier
            return InsuranceBenefitsDossier
        except ImportError:
            pass
    return getattr(_target_module, name)


def __dir__() -> list[str]:
    return sorted(set(globals().keys()) | set(dir(_target_module)))

