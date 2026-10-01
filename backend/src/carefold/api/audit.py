"""Audit log retrieval and inspection endpoints."""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Query

from carefold.audit.logger import get_recent_audit_events
from carefold.constants.api import ROUTE_AUDIT
from carefold.constants.defaults import (
    DEFAULT_AUDIT_LIMIT,
    MAX_AUDIT_LIMIT,
    MIN_AUDIT_LIMIT,
)
from carefold.schemas.audit import AuditListResponse

router = APIRouter(tags=["Audit"])


@router.get(ROUTE_AUDIT, response_model=AuditListResponse)
async def list_audit_events(
    limit: int = Query(
        DEFAULT_AUDIT_LIMIT,
        ge=MIN_AUDIT_LIMIT,
        le=MAX_AUDIT_LIMIT,
        description="Max number of recent events to return",
    ),
    agent_id: Optional[str] = Query(None, description="Filter by agent ID"),
    event: Optional[str] = Query(None, description="Filter by event type (run, tool, refuse, error)"),
    full: bool = Query(False, description="Include message bodies if stored"),
) -> AuditListResponse:
    """Retrieves recent audit log events, newest first, with privacy redaction by default."""
    total, events = await get_recent_audit_events(
        limit=limit,
        agent_id=agent_id,
        event=event,
        full=full,
    )

    return AuditListResponse(
        total=total,
        limit=limit,
        events=events,
    )
