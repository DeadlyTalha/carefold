"""Carefold Workflows Package.

Houses class-based LangGraph nodes, multi-agent subgraphs, and the unified
AgentState schema following SOLID principles.
"""

from __future__ import annotations

from carefold.workflows.nodes.base import BaseNode
from carefold.workflows.state import (
    AgentState,
    create_initial_state,
    extract_text_content,
    get_last_message,
    get_last_user_message,
    get_last_user_prompt_text,
)

__all__ = [
    "AgentState",
    "BaseNode",
    "create_initial_state",
    "extract_text_content",
    "get_last_message",
    "get_last_user_message",
    "get_last_user_prompt_text",
]
