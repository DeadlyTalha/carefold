#!/usr/bin/env bash
set -euo pipefail

# Carefold Phase 0 Launch Slice: E2E All-Tier Test Suite Runner
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "Running Carefold E2E Test Suite (Tiers 1-4)..."
node tests/e2e/runner.js
