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

"""Carefold Cryptographic Keyring Vault.

Implements two-tier envelope encryption (KEK -> DEK -> Credentials),
strict AAD binding, and fail-closed key resolution.
"""

from carefold.vault.crypto import decrypt, encrypt
from carefold.vault.dek import (
    compute_aad_binding,
    compute_dek_wrapping_aad,
    compute_scope_aad,
    decrypt_credential,
    decrypt_scoped_credential,
    delete_profile_keys,
    derive_scope_dek,
    encrypt_credential,
    encrypt_scoped_credential,
    get_or_create_dek,
    get_vault_for_scope,
    rotate_dek,
    ScopedVault,
)
from carefold.vault.errors import (
    DecryptionError,
    KeyDerivationError,
    VaultError,
    VaultLockedError,
)
from carefold.vault.kek import derive_argon2id_kek, get_kek, resolve_kek

__all__ = [
    "encrypt",
    "decrypt",
    "get_kek",
    "resolve_kek",
    "derive_argon2id_kek",
    "get_or_create_dek",
    "encrypt_credential",
    "decrypt_credential",
    "encrypt_scoped_credential",
    "decrypt_scoped_credential",
    "compute_aad_binding",
    "compute_dek_wrapping_aad",
    "compute_scope_aad",
    "derive_scope_dek",
    "rotate_dek",
    "delete_profile_keys",
    "ScopedVault",
    "get_vault_for_scope",
    "VaultError",
    "VaultLockedError",
    "DecryptionError",
    "KeyDerivationError",
]

