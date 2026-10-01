import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface RunCliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface RunCliOptions {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
}

const BIN_PATH = path.resolve(__dirname, '../../bin/carefold.js');

/**
 * Execute CLI binary in child process
 */
export async function runCli(args: string[], options: RunCliOptions = {}): Promise<RunCliResult> {
  const nodeBinary = process.execPath;
  const entryPath = BIN_PATH;

  try {
    const { stdout, stderr } = await execFileAsync(nodeBinary, [entryPath, ...args], {
      cwd: options.cwd || process.cwd(),
      env: {
        ...process.env,
        CAREFOLD_CLI_TEST: '1',
        ...options.env
      },
      timeout: options.timeout || 15000
    });

    return {
      exitCode: 0,
      stdout: stdout.toString(),
      stderr: stderr.toString()
    };
  } catch (err: any) {
    return {
      exitCode: typeof err.code === 'number' ? err.code : 1,
      stdout: err.stdout ? err.stdout.toString() : '',
      stderr: err.stderr ? err.stderr.toString() : err.message
    };
  }
}
