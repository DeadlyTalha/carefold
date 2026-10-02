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

"""Model client data types and streaming schemas."""

from __future__ import annotations

from typing import Any, AsyncIterator, Dict, List, Literal, Optional, Protocol
from pydantic import BaseModel, Field


class ModelMessage(BaseModel):
    role: Literal["system", "user", "assistant", "tool"]
    content: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
    tool_call_id: Optional[str] = None


class ModelToolFunction(BaseModel):
    name: str = ""
    arguments: str = ""


class ModelToolCallChunk(BaseModel):
    index: int = 0
    id: Optional[str] = None
    type: str = "function"
    function: Optional[ModelToolFunction] = None


class StreamDelta(BaseModel):
    content: Optional[str] = None
    tool_calls: Optional[List[ModelToolCallChunk]] = None


class StreamChoice(BaseModel):
    index: int = 0
    delta: StreamDelta = Field(default_factory=StreamDelta)
    finish_reason: Optional[str] = None


class ModelStreamChunk(BaseModel):
    id: Optional[str] = None
    choices: List[StreamChoice] = Field(default_factory=list)


class ModelClient(Protocol):
    def get_model_name(self) -> str:
        ...

    async def check_health(self) -> Dict[str, Any]:
        ...

    def stream_chat(
        self,
        messages: List[ModelMessage],
        tools: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.2,
    ) -> AsyncIterator[ModelStreamChunk]:
        ...
