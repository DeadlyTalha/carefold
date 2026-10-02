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
