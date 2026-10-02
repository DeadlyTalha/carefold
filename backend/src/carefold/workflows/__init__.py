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

"""Carefold Workflows Package.

Houses class-based LangGraph nodes, multi-agent subgraphs, and the unified
AgentState schema following SOLID principles.
"""

from __future__ import annotations

from carefold.workflows.dispatcher import ExecutionDispatcher
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
    "ExecutionDispatcher",
    "create_initial_state",
    "extract_text_content",
    "get_last_message",
    "get_last_user_message",
    "get_last_user_prompt_text",
]
