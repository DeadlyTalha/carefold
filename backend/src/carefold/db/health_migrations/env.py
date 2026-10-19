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

"""Alembic environment configuration for Health Pack branched migrations."""

from logging.config import fileConfig
from typing import Optional

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import create_engine
from sqlalchemy.engine.url import make_url

from yarvelle_core.db.base import Base
import carefold.models.health  # noqa: F401
from carefold.db.session import resolve_database_url

config = context.config

if config.config_file_name is not None and config.attributes.get("configure_logger", True):
    try:
        fileConfig(config.config_file_name, disable_existing_loggers=False)
    except Exception:
        pass

target_metadata = Base.metadata


def get_sync_url(raw_url: Optional[str] = None) -> str:
    url_str = raw_url or resolve_database_url()
    parsed = make_url(url_str)
    driver = parsed.drivername
    if "+aiosqlite" in driver:
        driver = "sqlite"
    elif "+asyncpg" in driver:
        driver = "postgresql"
    elif driver.startswith("sqlite+"):
        driver = "sqlite"
    elif driver.startswith("postgresql+"):
        driver = "postgresql"
    return str(parsed.set(drivername=driver))


def _resolve_version_table() -> str:
    return (
        config.attributes.get("version_table")
        or config.get_main_option("version_table")
        or "alembic_version_health"
    )


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url") or get_sync_url()
    output_buffer = config.attributes.get("output_buffer", None)
    context.configure(
        url=url,
        output_buffer=output_buffer,
        target_metadata=target_metadata,
        version_table=_resolve_version_table(),
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = config.attributes.get("connection", None)
    version_table = _resolve_version_table()
    if connectable is not None:
        context.configure(
            connection=connectable,
            target_metadata=target_metadata,
            version_table=version_table,
            render_as_batch=True,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()
    else:
        sync_url = get_sync_url()
        connectable = create_engine(sync_url, poolclass=pool.NullPool)
        with connectable.connect() as connection:
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                version_table=version_table,
                render_as_batch=True,
                compare_type=True,
                compare_server_default=True,
            )
            with context.begin_transaction():
                context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
