"""Audit logging schemas."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Literal, Optional
from pydantic import BaseModel, Field

AuditEventType = Literal["run", "tool", "refuse", "error"]


class AuditEvent(BaseModel):
    ts: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    agent_id: str
    skill_id: Optional[str] = None
    skill_version: Optional[str] = None
    event: AuditEventType
    tool: Optional[str] = None
    allowed: Optional[bool] = None
    reason: Optional[str] = None
    duration_ms: Optional[float] = None
    prompt: Optional[str] = None      # Redacted unless store_bodies=True
    completion: Optional[str] = None  # Redacted unless store_bodies=True


class AuditListResponse(BaseModel):
    total: int
    limit: int
    events: List[AuditEvent]
