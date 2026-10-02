## Description

<!-- Provide a concise explanation of what this PR introduces, modifies, or fixes. -->

## Motivation and Context

<!-- Why is this change needed? What problem does it solve? If it fixes an open issue, link it here: e.g. Fixes #123 -->

## Type of Change

<!-- Mark the appropriate box with an [x] -->
- [ ] `feat`: New feature or specialist agent
- [ ] `fix`: Bug fix or clinical guardrail patch
- [ ] `docs`: Documentation updates or new ADR
- [ ] `refactor`: Code refactoring without behavioral change
- [ ] `perf`: Performance or memory retrieval improvement
- [ ] `test`: New tests or test suite improvements
- [ ] `chore`: Maintenance, dependency, or tooling update

## Pre-Merge Verification Checklist

<!-- Please confirm all of the following checks pass locally prior to requesting review: -->

- [ ] **Developer Certificate of Origin (DCO)**: All commits are signed off (`git commit -s`).
- [ ] **Conventional Commits**: Commit messages follow the specification (e.g. `feat(agents): ...`).
- [ ] **License Headers**: All modified or new `.py`, `.ts`, `.tsx`, `.js`, `.mjs`, `.css` files contain the official Spectrayan Apache-2.0 copyright header.
  - Verified with: `pnpm run check:licenses`
- [ ] **Backend Tests**: All pytest tests pass without regression:
  - Verified with: `backend/.venv/bin/pytest backend/tests/`
- [ ] **Security Penetration Suite**: All 47 security attacks are blocked:
  - Verified with: `PYTHONPATH=backend/src backend/.venv/bin/python backend/tests/penetration_suite.py`
- [ ] **Frontend Quality & Build**:
  - TypeScript check: `pnpm --filter web typecheck`
  - Unit tests: `pnpm --filter web test --exclude "**/chat.test.ts"`
  - Production build: `pnpm --filter web build`
- [ ] **Clinical Safety & Grounding** (if touching `agents/`, `skills/`, or extraction):
  - Non-clinical boundaries and emergency red-flag triggers preserved.
  - PII sanitization and numerical grounding verified.
- [ ] **Documentation**: Updated corresponding markdown files in `docs/` or added an ADR in `docs/adr/` if architectural.
  - Verified with: `mkdocs build --strict`
