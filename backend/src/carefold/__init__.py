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

"""Carefold local-first AI and agentic runtime."""

__version__ = "0.4.0b1"

# Ensure domain extensions are registered on yarvelle_core at root package import
try:
    from yarvelle_core.schemas.manifest import AgentDomain

    if hasattr(AgentDomain, "register") and not hasattr(AgentDomain, "CLINICAL"):
        AgentDomain.CLINICAL = AgentDomain.register("clinical")
except Exception:
    pass

