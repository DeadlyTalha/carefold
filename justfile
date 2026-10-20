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

default:
    @just --list

# Start development environments for backend and frontend
dev:
    @echo "Starting Carefold development environment..."
    cd backend && uv sync || true
    pnpm install

# Run full test suite across backend, penetration suite, and frontend
test:
    @echo "Running backend test suite..."
    PYTHONPATH=backend/src backend/.venv/bin/pytest backend/tests/
    @echo "Running security penetration test suite (47 attacks)..."
    PYTHONPATH=backend/src backend/.venv/bin/python backend/tests/penetration_suite.py
    @echo "Running frontend test suite..."
    pnpm --filter @carefold/web test --exclude "**/api/**"

# Run all linters and integrity checks
lint:
    @echo "Checking license headers..."
    pnpm run check:licenses
    @echo "Checking no git dependencies..."
    python3 scripts/check_no_git_deps.py
    @echo "Running frontend typecheck..."
    pnpm --filter @carefold/web typecheck

# Build release artifacts (backend wheels, frontend Next.js production build)
build:
    @echo "Building backend carefold wheel..."
    python3 -m build --wheel backend
    @echo "Building frontend Next.js production app..."
    pnpm --filter @carefold/web build

# Prepare release dry run
release:
    @echo "Evaluating release please and changesets dry run..."
    pnpm exec changeset status || true

# Link local dependencies for development (never commit links)
link target:
    @echo "Linking local dependency {{target}}..."
    @if [ "{{target}}" = "core" ]; then \
        backend/.venv/bin/pip install -e ../yarvelle-core/backend; \
    fi

# Unlink local dependencies and restore locked versions
unlink:
    @echo "Restoring locked versions..."
    backend/.venv/bin/pip install --force-reinstall yarvelle-core || true
    pnpm install --frozen-lockfile

# Build documentation site
docs:
    @echo "Building documentation site..."
    @if command -v mkdocs >/dev/null 2>&1; then \
        mkdocs build; \
    else \
        echo "mkdocs not installed"; \
    fi
