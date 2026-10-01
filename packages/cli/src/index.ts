import { createProgram } from './program.js';
import { CliError, ExitCodes } from './utils/errors.js';

// Export Programmatic API
export { createProgram } from './program.js';
export { initCommand, type InitOptions } from './commands/init.js';
export {
  agentListCommand,
  agentAddCommand,
  agentInspectCommand,
  type AgentListOptions,
  type AgentAddOptions,
  type AgentInspectOptions
} from './commands/agent.js';
export {
  skillListCommand,
  skillAddCommand,
  type SkillListOptions,
  type SkillAddOptions
} from './commands/skill.js';
export { runCommand, type RunCommandOptions } from './commands/run.js';
export { logCommand, type LogCommandOptions } from './commands/log.js';
export { evalCommand, type EvalOptions } from './commands/eval.js';
export { CliError, ExitCodes } from './utils/errors.js';
export { findWorkspaceRoot, getWorkspacePaths, loadWorkspaceConfig } from './utils/workspace.js';

// Execute binary if run from CLI
const isCliEntry =
  Boolean(
    process.argv[1] &&
      (process.argv[1].endsWith('carefold.js') ||
        process.argv[1].endsWith('carefold') ||
        process.argv[1].endsWith('dist/index.js'))
  ) || !process.env.VITEST;

if (isCliEntry) {
  const program = createProgram();
  program.parseAsync(process.argv).catch((err: any) => {
    if (err instanceof CliError) {
      process.stderr.write(`Error: ${err.message}\n`);
      process.exit(err.exitCode);
    }
    process.stderr.write(`Error: ${err.message || String(err)}\n`);
    process.exit(ExitCodes.USER_ERROR);
  });
}
