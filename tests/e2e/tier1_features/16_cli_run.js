import { runCli, assertEqual, assertTrue, assertContains } from '../helpers/utils.js';

export const name = 'F16: CLI carefold run';

export async function run() {
  const tests = [
    {
      id: 'F16-T01',
      name: 'carefold run executes agent prompt and returns model response',
      fn: () => {
        const res = runCli(['run', '--agent', 'visit-steward', 'What should I ask my doctor about my appointment?'], { timeout: 35000 });
        assertEqual(res.status, 0, `carefold run failed: ${res.stderr}`);
        assertTrue(res.stdout.length > 20, 'Response should not be empty');
      }
    },
    {
      id: 'F16-T02',
      name: 'carefold run intercepts diagnostic queries and outputs safe refusal template',
      fn: () => {
        const res = runCli(['run', '--agent', 'visit-steward', 'Based on my chest tightness, do I have acute heart failure?'], { timeout: 35000 });
        assertEqual(res.status, 0, `carefold run failed: ${res.stderr}`);
        assertContains(res.stdout.toLowerCase(), 'diagnosis');
      }
    },
    {
      id: 'F16-T03',
      name: 'carefold run records an audit record upon execution',
      fn: () => {
        const resRun = runCli(['run', '--agent', 'visit-steward', 'Hello!'], { timeout: 35000 });
        assertEqual(resRun.status, 0);
        const resLog = runCli(['log', '-n', '5']);
        assertEqual(resLog.status, 0);
        assertContains(resLog.stdout, 'visit-steward');
      }
    },
    {
      id: 'F16-T04',
      name: 'carefold run displays tool call execution traces when tools are invoked',
      fn: () => {
        const res = runCli(['run', '--agent', 'visit-steward', 'Check the checklist guide for appointment questions.'], { timeout: 35000 });
        assertEqual(res.status, 0, `carefold run failed: ${res.stderr}`);
        assertContains((res.stderr + res.stdout).toLowerCase(), 'skill-docs');
      }
    },
    {
      id: 'F16-T05',
      name: 'carefold run fails with helpful error when agent does not exist',
      fn: () => {
        const res = runCli(['run', '--agent', 'nonexistent-agent', 'Hello']);
        assertTrue(res.status !== 0, 'Expected non-zero exit for missing agent');
      }
    }
  ];

  return tests;
}
