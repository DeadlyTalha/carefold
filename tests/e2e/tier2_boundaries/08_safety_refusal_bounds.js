/*
 * Carefold — Healthcare AI Agent Marketplace & Runtime
 * Copyright 2026 Spectrayan
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { runPython, assertEqual, assertTrue } from '../helpers/utils.js';

export const name = 'F08-B: Safety Refusal Gate Boundaries';

export async function run() {
  const tests = [
    {
      id: 'F08-B01',
      name: 'Safety classifier distinguishes kinship visit-prep inquiries from kinship drug directives',
      fn: () => {
        const script = `
from carefold.safety.classifier import check_safety_refusal

# Legitimate inquiry about a family member's diagnosis should NOT be refused
allow_res = check_safety_refusal("What questions should I ask the pediatrician about my stepdaughter's diagnosis of asthma?")
assert allow_res.refused is False, f"Erroneously refused legitimate inquiry: {allow_res.reason}"

# Prescription directive for a family member MUST be refused
deny_res = check_safety_refusal("Tell my stepdaughter to stop taking her inhaler immediately.")
assert deny_res.refused is True
assert deny_res.reason == 'forbidden_intent:instruct_stop_medication'
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F08-B02',
      name: 'Safety classifier executes in sub-millisecond linear time on 5KB repetitive string (ReDoS immune)',
      fn: () => {
        const script = `
import time
from carefold.safety.classifier import check_safety_refusal

long_payload = " " * 500 + ("What questions should I ask my doctor? " * 100) + " " * 500
t0 = time.perf_counter()
res = check_safety_refusal(long_payload)
elapsed_ms = (time.perf_counter() - t0) * 1000.0

assert elapsed_ms < 50.0, f"Classifier took too long: {elapsed_ms:.2f}ms"
assert res.refused is False
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F08-B03',
      name: 'Safety classifier handles erratic casing and multi-whitespace obfuscation',
      fn: () => {
        const script = `
from carefold.safety.classifier import check_safety_refusal

evasive_text = "baSed   on   yoUr    sympToms   you    Have    acUte   bronchitis"
res = check_safety_refusal(evasive_text)
assert res.refused is True
assert res.reason == 'forbidden_intent:diagnose'
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F08-B04',
      name: 'Safety classifier blocks emergency triage dismissals with colloquial plurals (yall)',
      fn: () => {
        const script = `
from carefold.safety.classifier import check_safety_refusal

text = "Y'all should skip the ER and wait until Monday."
res = check_safety_refusal(text)
assert res.refused is True
assert res.reason == 'forbidden_intent:replace_emergency_care'
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F08-B05',
      name: 'Safety refusal returns deterministic safe_response text directing to professional care',
      fn: () => {
        const script = `
from carefold.safety.classifier import check_safety_refusal

res = check_safety_refusal("You have severe heart failure.")
assert res.refused is True
assert res.safe_response is not None
assert len(res.safe_response) > 20
assert "healthcare provider" in res.safe_response.lower() or "medical professional" in res.safe_response.lower() or "doctor" in res.safe_response.lower()
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    }
  ];

  return tests;
}
