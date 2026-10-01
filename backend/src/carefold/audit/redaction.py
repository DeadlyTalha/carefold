"""Zero-Body Privacy Redaction Engine.

Enforces zero-body retention: strips prompt and completion bodies unless
store_bodies is strictly configured to True.
"""

from __future__ import annotations

from typing import Any, Dict, Union
from carefold.schemas.audit import AuditEvent


def redact_audit_event(
    event: Union[AuditEvent, Dict[str, Any]],
    store_bodies: bool = False,
) -> Dict[str, Any]:
    """Redacts prompt and completion bodies from audit event unless store_bodies is True."""
    if isinstance(event, AuditEvent):
        data = event.model_dump(exclude_none=True)
    else:
        data = dict(event)

    if not store_bodies:
        data.pop("prompt", None)
        data.pop("completion", None)

    return data
