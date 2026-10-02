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
