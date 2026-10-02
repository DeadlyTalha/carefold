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

"""Supervisor intent classifier and routing dispatcher (F-23).

Subclasses OrchestratorNode for dynamic LLM-driven planning and routing,
maintaining 100% backward compatibility for callers and existing graphs.
Zero hardcoded regex patterns or static keyword dictionaries.
"""

from __future__ import annotations

from typing import Optional

from langchain_core.language_models.chat_models import BaseChatModel

from carefold.agents.registry import AgentRegistry
from carefold.workflows.nodes.orchestrator_node import OrchestratorNode


class SupervisorNode(OrchestratorNode):
    """Classifies user intent and routes execution to specialist agents.

    Subclasses OrchestratorNode for dynamic, model-driven multi-agent routing.
    All routing decisions are dynamic, and zero regex patterns are stored in code.
    """

    def __init__(
        self,
        model: Optional[BaseChatModel] = None,
        registry: Optional[AgentRegistry] = None,
        name: str = "supervisor",
    ) -> None:
        super().__init__(model=model, registry=registry, name=name)


__all__ = ["SupervisorNode"]
