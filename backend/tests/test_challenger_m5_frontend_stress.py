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

"""
Adversarial Challenger Test Suite for Milestone M5:
Frontend Quality Gates, Type Safety, Next.js 16 Compatibility,
Theme Contrast Ratios, and Complete Phase 0 Deprecation.
"""

import json
import os
import re
from pathlib import Path
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
APPS_WEB = REPO_ROOT / "apps" / "web"


# =============================================================================
# Helper: WCAG 2.1 Color Contrast Oracle
# =============================================================================

def srgb_to_linear(c_byte: int) -> float:
    norm = c_byte / 255.0
    return norm / 12.92 if norm <= 0.03928 else ((norm + 0.055) / 1.055) ** 2.4


def hex_to_rgb(hex_code: str) -> tuple[int, int, int]:
    clean = hex_code.lstrip("#")
    return int(clean[0:2], 16), int(clean[2:4], 16), int(clean[4:6], 16)


def relative_luminance(hex_code: str) -> float:
    r, g, b = hex_to_rgb(hex_code)
    return 0.2126 * srgb_to_linear(r) + 0.7152 * srgb_to_linear(g) + 0.0722 * srgb_to_linear(b)


def contrast_ratio(hex1: str, hex2: str) -> float:
    l1 = relative_luminance(hex1)
    l2 = relative_luminance(hex2)
    brightest = max(l1, l2)
    darkest = min(l1, l2)
    return (brightest + 0.05) / (darkest + 0.05)


# =============================================================================
# Test Suite 1: Phase 0 Eradication Across apps/web/
# =============================================================================

class TestPhase0Eradication:
    """Stress tests ensuring zero residual occurrences of 'Phase 0' across apps/web."""

    IGNORED_DIRS = {".next", "node_modules", ".turbo", "dist"}

    def test_zero_phase_0_in_apps_web_source_and_tests(self):
        phase_pattern = re.compile(r"phase[\s_-]*0", re.IGNORECASE)
        violations = []

        for root, dirs, files in os.walk(APPS_WEB):
            dirs[:] = [d for d in dirs if d not in self.IGNORED_DIRS]
            for file in files:
                ext = Path(file).suffix.lower()
                if ext in {".ts", ".tsx", ".js", ".mjs", ".json", ".css", ".md", ".html"}:
                    file_path = Path(root) / file
                    try:
                        content = file_path.read_text(encoding="utf-8")
                        matches = phase_pattern.findall(content)
                        if matches:
                            violations.append((str(file_path.relative_to(REPO_ROOT)), matches))
                    except Exception as exc:
                        pytest.fail(f"Failed to read {file_path}: {exc}")

        assert not violations, f"Found residual Phase 0 occurrences in apps/web: {violations}"

    def test_navbar_badge_is_open_source(self):
        navbar_path = APPS_WEB / "src" / "components" / "Navbar.tsx"
        content = navbar_path.read_text(encoding="utf-8")
        assert "Phase 0" not in content

    def test_layout_footer_text(self):
        layout_path = APPS_WEB / "src" / "app" / "layout.tsx"
        content = layout_path.read_text(encoding="utf-8")
        assert "Carefold • Healthcare AI Agent Marketplace • Apache-2.0" in content
        assert "Phase 0" not in content

    def test_agent_detail_sandbox_text(self):
        agent_detail_path = APPS_WEB / "src" / "app" / "agents" / "[id]" / "AgentDetailClient.tsx"
        content = agent_detail_path.read_text(encoding="utf-8")
        assert "Local Secure Sandbox" in content
        assert "Phase 0" not in content
        assert "Local health assistant with strict local sandbox controls." in content

    def test_tool_trace_test_strings(self):
        tool_trace_test = APPS_WEB / "tests" / "components" / "tool-trace.test.tsx"
        content = tool_trace_test.read_text(encoding="utf-8")
        assert "Tool is not in sandbox registry." in content
        assert "Phase 0" not in content

    def test_dockerfile_phase_0_clean(self):
        dockerfile_path = REPO_ROOT / "docker" / "Dockerfile"
        content = dockerfile_path.read_text(encoding="utf-8")
        assert "Carefold Multi-Stage Dockerfile" in content
        assert "Phase 0" not in content


# =============================================================================
# Test Suite 2: Theme Contrast Ratios (WCAG AA Standard)
# =============================================================================

class TestThemeContrastCompliance:
    """Validates color contrast ratios for updated components in both light and dark modes."""

    # Tailwind Palette hex definitions
    # Slate:
    SLATE_100 = "#f1f5f9"
    SLATE_200 = "#e2e8f0"
    SLATE_500 = "#64748b"
    SLATE_600 = "#475569"
    SLATE_900 = "#0f172a"
    WHITE = "#ffffff"

    # Zinc:
    ZINC_100 = "#f4f4f5"
    ZINC_400 = "#a1a1aa"
    ZINC_800 = "#27272a"
    ZINC_900 = "#18181b"
    ZINC_950 = "#09090b"

    # Emerald:
    EMERALD_50 = "#ecfdf5"
    EMERALD_200 = "#a7f3d0"
    EMERALD_400 = "#34d399"
    EMERALD_600 = "#059669"
    EMERALD_700 = "#047857"
    EMERALD_900 = "#064e3b"
    EMERALD_950 = "#022c22"

    def test_navbar_open_source_badge_contrast(self):
        """Navbar badge: bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"""
        # Light mode: text-slate-600 on bg-slate-100
        light_contrast = contrast_ratio(self.SLATE_600, self.SLATE_100)
        assert light_contrast >= 4.5, f"Light badge contrast {light_contrast:.2f} < 4.5"

        # Dark mode: text-zinc-400 on bg-zinc-800
        dark_contrast = contrast_ratio(self.ZINC_400, self.ZINC_800)
        assert dark_contrast >= 4.5, f"Dark badge contrast {dark_contrast:.2f} < 4.5"

    def test_layout_footer_text_contrast(self):
        """Footer: bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400"""
        # Light mode: text-slate-500 on bg-white
        light_contrast = contrast_ratio(self.SLATE_500, self.WHITE)
        assert light_contrast >= 4.5, f"Light footer contrast {light_contrast:.2f} < 4.5"

        # Dark mode: text-zinc-400 on bg-zinc-900
        dark_contrast = contrast_ratio(self.ZINC_400, self.ZINC_900)
        assert dark_contrast >= 4.5, f"Dark footer contrast {dark_contrast:.2f} < 4.5"

    def test_agent_detail_sandbox_badge_contrast(self):
        """Sandbox item: font-bold text-emerald-900 dark:text-emerald-200 on bg-emerald-50 dark:bg-emerald-950"""
        # Light mode: text-emerald-900 on bg-emerald-50
        light_contrast = contrast_ratio(self.EMERALD_900, self.EMERALD_50)
        assert light_contrast >= 7.0, f"Light sandbox contrast {light_contrast:.2f} < 7.0 (AAA)"

        # Dark mode: text-emerald-200 on bg-emerald-950
        dark_contrast = contrast_ratio(self.EMERALD_200, self.EMERALD_950)
        assert dark_contrast >= 7.0, f"Dark sandbox contrast {dark_contrast:.2f} < 7.0 (AAA)"


# =============================================================================
# Test Suite 3: Configuration & Build Packaging Integrity
# =============================================================================

class TestPackagingAndConfigIntegrity:
    """Validates next.config.ts, Dockerfile packaging order, and package.json scripts."""

    def test_next_config_no_eslint(self):
        next_config_path = APPS_WEB / "next.config.ts"
        content = next_config_path.read_text(encoding="utf-8")
        assert "eslint:" not in content
        assert "ignoreDuringBuilds" not in content
        assert "reactStrictMode: true" in content
        assert "ignoreBuildErrors: false" in content

    def test_dockerfile_pip_install_step_ordering(self):
        dockerfile_path = REPO_ROOT / "docker" / "Dockerfile"
        lines = dockerfile_path.read_text(encoding="utf-8").splitlines()

        # Find occurrences of COPY backend and pip install in Stage 1 and Stage 3
        copy_indices = [i for i, l in enumerate(lines) if "COPY backend/ ./backend/" in l]
        pip_indices = [i for i, l in enumerate(lines) if "RUN pip install --no-cache-dir ./backend" in l]

        assert len(copy_indices) == 2, f"Expected 2 COPY backend lines, found {len(copy_indices)}"
        assert len(pip_indices) == 2, f"Expected 2 pip install lines, found {len(pip_indices)}"

        # Verify Stage 1
        assert copy_indices[0] < pip_indices[0], (
            f"Stage 1 COPY backend (line {copy_indices[0]+1}) must precede pip install (line {pip_indices[0]+1})"
        )

        # Verify Stage 3
        assert copy_indices[1] < pip_indices[1], (
            f"Stage 3 COPY backend (line {copy_indices[1]+1}) must precede pip install (line {pip_indices[1]+1})"
        )

    def test_package_json_build_script_has_license_fix(self):
        pkg_json_path = APPS_WEB / "package.json"
        pkg = json.loads(pkg_json_path.read_text(encoding="utf-8"))
        build_script = pkg.get("scripts", {}).get("build", "")
        assert "next build" in build_script
        assert "scripts/licenses.mjs --fix" in build_script
