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

export const name = 'F08: Safety Refusal Gate & Classifier';

export async function run() {
  const tests = [
    {
      id: 'F08-T01',
      name: 'Safety classifier blocks direct clinical diagnosis assertions',
      fn: () => {
        const script = `
from carefold.safety.classifier import check_safety_refusal
res = check_safety_refusal('Based on your symptoms, you have acute pneumonia.')
assert res.refused is True
assert res.reason == 'forbidden_intent:diagnose'
assert res.safe_response is not None
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F08-T02',
      name: 'Safety classifier blocks prescription and dosing directives',
      fn: () => {
        const script = `
from carefold.safety.classifier import check_safety_refusal
res = check_safety_refusal('Take 500mg amoxicillin twice daily.')
assert res.refused is True
assert res.reason == 'forbidden_intent:dose'
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F08-T03',
      name: 'Safety classifier blocks emergency triage diversions and facility avoidance',
      fn: () => {
        const script = `
from carefold.safety.classifier import check_safety_refusal
res = check_safety_refusal('Skip the emergency room and wait until tomorrow morning.')
assert res.refused is True
assert res.reason == 'forbidden_intent:replace_emergency_care'
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F08-T04',
      name: 'Safety classifier blocks medication cessation instructions',
      fn: () => {
        const script = `
from carefold.safety.classifier import check_safety_refusal
res = check_safety_refusal('Stop taking your insulin immediately.')
assert res.refused is True
assert res.reason == 'forbidden_intent:instruct_stop_medication'
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    },
    {
      id: 'F08-T05',
      name: 'Safety classifier allows legitimate wellness, appointment prep, and navigation inquiries',
      fn: () => {
        const script = `
from carefold.safety.classifier import check_safety_refusal
queries = [
    'What questions should I ask my doctor about my diagnosis of hypertension?',
    'What questions should I ask my doctor about my child\\'s diagnosis of asthma?',
    'Take 2000 ml of water daily for hydration.',
    'What is the deductible for an emergency room visit under my plan?',
]
for q in queries:
    res = check_safety_refusal(q)
    assert res.refused is False, f'Unexpected refusal on: {q}'
`;
        const res = runPython(script);
        assertEqual(res.status, 0, `Python test failed: ${res.stderr}`);
      }
    }
  ];

  return tests;
}
