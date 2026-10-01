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
