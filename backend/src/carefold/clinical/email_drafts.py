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

"""Backward-compatibility re-export shim for carefold.platform.email_drafts."""

from carefold.platform.email_drafts import *  # noqa: F401, F403
from carefold.platform.email_drafts import (
    NO_AUTO_SEND_NOTICE,
    build_mailto_uri,
    create_email_draft,
    delete_email_draft,
    execute_create_email_draft,
    export_draft_as_eml,
    get_email_draft,
    list_email_drafts,
    serialize_email_draft,
)
