"""Health status schemas."""

from __future__ import annotations

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class OllamaHealthStatus(BaseModel):
    status: Literal["connected", "unreachable", "error"]
    endpoint: str
    reachable: bool
    activeModel: Optional[str] = None
    availableModels: List[str] = Field(default_factory=list)
    error: Optional[str] = None


class WorkspaceInfo(BaseModel):
    root: str
    agentsCount: int
    skillsCount: int


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded", "error"]
    version: str = "0.1.0"
    uptime: float
    timestamp: str
    modelReachable: bool
    workspace: WorkspaceInfo
    ollama: OllamaHealthStatus
