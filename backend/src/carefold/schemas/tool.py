"""Tool and execution context schemas."""

from __future__ import annotations

from typing import Any, Callable, Dict, Literal, Optional
from pydantic import BaseModel, Field

ClosedToolName = Literal["attach-read", "workspace-note", "skill-docs"]


class ToolResult(BaseModel):
    success: bool
    output: Any = None
    error: Optional[str] = None


class ToolCallRecord(BaseModel):
    tool: str
    input: Dict[str, Any] = Field(default_factory=dict)
    allowed: bool = True
    duration_ms: float = 0.0
    success: bool = True
    output: Any = None
    error: Optional[str] = None
