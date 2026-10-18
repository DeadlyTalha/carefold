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

"""Carefold Health Pack: clinical domain pack implementation for Yarvelle Core."""

from __future__ import annotations

import logging
from typing import List

from yarvelle_core.pack.spec import PackEvalsSpec, PackSpec, RouterContribution
from yarvelle_core.schemas.routing import RoutingHints
from yarvelle_core.workflows.subgraphs.extraction.dossiers import register_dossier_type

logger = logging.getLogger("carefold_health")

__version__ = "0.5.0b1"


def get_pack() -> PackSpec:
    """Pack factory discovered by yarvelle_core via entry point 'yarvelle.packs'.

    Returns:
        PackSpec: Populated and validated specification of the health pack.
    """
    # 1. Register domain dossiers into the yarvelle_core extraction registry
    from carefold_health.dossiers import (
        ClinicalVisitDossier,
        InsuranceBenefitsDossier,
    )
    register_dossier_type("clinical_visit", ClinicalVisitDossier)
    register_dossier_type("clinical", ClinicalVisitDossier)
    register_dossier_type("insurance_benefits", InsuranceBenefitsDossier)
    register_dossier_type("insurance", InsuranceBenefitsDossier)

    # 2. Safety policy instance
    from carefold_health.safety import CarefoldHealthSafetyPolicy
    safety_policy = CarefoldHealthSafetyPolicy()

    # 3. Health ToolSpecs (17 tools)
    from carefold_health.tools import get_health_tool_specs
    tools = get_health_tool_specs()

    # 4. Health Routers (9 routers)
    from carefold_health.routers import get_health_router_contributions
    routers: List[RouterContribution] = get_health_router_contributions()

    # 5. Scoped ORM Models (7 models)
    from carefold_health.models import (
        Appointment,
        CompanionDevice,
        HealthResource,
        ImportBatch,
        PreventiveRecord,
        SchoolForm,
        SchoolIcsFeed,
    )
    scoped_models = [
        HealthResource,
        Appointment,
        PreventiveRecord,
        ImportBatch,
        SchoolForm,
        SchoolIcsFeed,
        CompanionDevice,
    ]

    # 6. Routing hints
    routing_hints = RoutingHints(
        domain="health",
        description="Clinical visit preparation, health records management, and insurance navigation",
        default_agent="visit-steward",
        patterns_path="resources/routing_patterns.yaml",
    )

    # 7. Evals spec
    evals = PackEvalsSpec(
        golden_path="evals/golden.jsonl",
        min_pass_rate=0.95,
        eval_suites=["clinical_safety", "emergency_red_flags", "boundary_enforcement"],
    )

    spec = PackSpec(
        pack_api=1,
        id="health",
        name="Carefold Health Pack",
        version=__version__,
        domain="health",
        requires_core=">=0.1.0,<0.2.0",
        owned_scopes=["health.*", "health.clinical", "health.paperwork"],
        declared_reads=[],
        risk_tier_max="T4",
        tools=tools,
        routers=routers,
        safety_policy=safety_policy,
        migration_branch="health",
        evals=evals,
        description="Family health, visit preparation, clinical records, and insurance navigation pack",
        license="PolyForm-Noncommercial-1.0.0 + Carefold Additional Terms",
        maintainers=["spectrayan/carefold-maintainers"],
        routing_hints=routing_hints,
        scoped_models=scoped_models,
    )
    return spec


__all__ = ["get_pack", "__version__"]
