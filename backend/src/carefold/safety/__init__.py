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

"""Re-export safety package components."""

from carefold.safety.template import SAFE_REFUSAL_TEMPLATE
from carefold.safety.classifier import (
    COMMON_CONDITIONS,
    DISCLAIMER_CLAUSES,
    REFUSAL_PATTERNS,
    SafetyCheckResult,
    check_safety_refusal,
)
from carefold.safety.prompt import build_safety_preamble
from carefold.safety.emergency import EmergencyFlag, check_emergency_red_flags

__all__ = [
    "SAFE_REFUSAL_TEMPLATE",
    "COMMON_CONDITIONS",
    "DISCLAIMER_CLAUSES",
    "REFUSAL_PATTERNS",
    "SafetyCheckResult",
    "check_safety_refusal",
    "build_safety_preamble",
    "EmergencyFlag",
    "check_emergency_red_flags",
]
