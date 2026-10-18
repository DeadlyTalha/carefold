# Carefold — Healthcare AI Agent Marketplace & Runtime
# Copyright 2026 Spectrayan (https://spectrayan.com)
#
# Licensed under the PolyForm Noncommercial License 1.0.0 and the
# Carefold Additional Terms (see LICENSE and ADDITIONAL-TERMS.md).
# Personal and household local use only. Commercial use, hosted service
# offering, rebranding, white-labeling, and redistribution of modified
# forks are prohibited without a written commercial license from Spectrayan.
#
# Required Notice: Copyright 2026 Spectrayan (https://spectrayan.com)

"""Backward-compatibility re-export shim for carefold.platform.routines."""

from carefold.platform.routines import *  # noqa: F401, F403
from carefold.platform.routines import (
    create_standing_routine,
    execute_standing_routine,
    set_connection_autonomy,
    update_standing_routine_status,
)
