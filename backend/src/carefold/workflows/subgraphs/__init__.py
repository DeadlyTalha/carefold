"""Carefold workflows subgraphs package.

Houses encapsulated LangGraph subgraphs for:
- Specialist Multi-Agent Supervisor Subgraph (F-33)
- Document Extraction & Attachment Ingestion Subgraph (M4 / R2)
"""

from __future__ import annotations

from carefold.workflows.subgraphs.supervisor import (
    DEFAULT_SPECIALISTS,
    SPECIALIST_BENEFITS_GUIDE,
    SPECIALIST_DOCUMENT_EXTRACTOR,
    SPECIALIST_GENERALIST,
    SPECIALIST_HABIT_COMPANION,
    SPECIALIST_VISIT_STEWARD,
    build_supervisor_subgraph,
    create_supervisor_router_node,
    create_supervisor_subgraph,
    route_specialist_return,
    route_supervisor,
)

__all__ = [
    "DEFAULT_SPECIALISTS",
    "SPECIALIST_BENEFITS_GUIDE",
    "SPECIALIST_DOCUMENT_EXTRACTOR",
    "SPECIALIST_GENERALIST",
    "SPECIALIST_HABIT_COMPANION",
    "SPECIALIST_VISIT_STEWARD",
    "build_supervisor_subgraph",
    "create_supervisor_router_node",
    "create_supervisor_subgraph",
    "route_specialist_return",
    "route_supervisor",
]
