import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { getWorkspacePaths } from '../utils/workspace.js';
import { resolveBundledAssets, copyPackDirectory } from '../utils/assets.js';
import { CliError, ExitCodes } from '../utils/errors.js';

export interface InitOptions {
  force?: boolean;
  bundled?: boolean;
  provider?: string;
  modelUrl?: string;
  modelName?: string;
}

export async function initCommand(dirArg?: string, options: InitOptions = {}): Promise<void> {
  const targetDir = path.resolve(process.cwd(), dirArg || '.');
  const paths = getWorkspacePaths(targetDir);

  // 1. Guard against accidental overwrite
  if (fsSync.existsSync(paths.config) && !options.force) {
    throw new CliError(
      `Workspace already initialized at "${targetDir}". Use --force to reinitialize.`,
      ExitCodes.USER_ERROR
    );
  }

  // 2. Create core directories
  await fs.mkdir(paths.agents, { recursive: true });
  await fs.mkdir(paths.skills, { recursive: true });
  await fs.mkdir(paths.chats, { recursive: true });
  await fs.mkdir(paths.attachments, { recursive: true });
  await fs.mkdir(paths.logs, { recursive: true });

  // 3. Create logs/audit.jsonl (append-only audit log)
  if (!fsSync.existsSync(paths.auditLog) || options.force) {
    await fs.writeFile(paths.auditLog, '', { flag: 'a', encoding: 'utf8' });
  }

  // 4. Create carefold.config.json
  const config = {
    version: '0.1.0',
    model: {
      provider: options.provider || 'ollama',
      baseUrl: options.modelUrl || 'http://127.0.0.1:11434/v1',
      model: options.modelName || 'llama3.2',
      apiKey: ''
    },
    audit: {
      enabled: true,
      store_bodies: false,
      log_path: 'logs/audit.jsonl'
    },
    allow_clinical: false,
    telemetry: false
  };
  await fs.writeFile(paths.config, JSON.stringify(config, null, 2) + '\n', 'utf8');

  // 5. Create README.md stub with Apache-2.0 notice & intended use
  const readmeContent = `# Carefold Workspace

Local-first specialist health agent runtime workspace.

## Intended Use
Carefold is a wellness, care navigation, and administrative assistant runtime. It does not provide medical diagnosis, clinical treatment, drug dosing, or emergency triage.
Not for clinical emergencies. If experiencing an emergency, contact local emergency services immediately.

## License
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
`;
  if (!fsSync.existsSync(paths.readme) || options.force) {
    await fs.writeFile(paths.readme, readmeContent, 'utf8');
  }

  // 6. Copy bundled reference agents and skills unless --no-bundled
  if (options.bundled !== false) {
    try {
      const assets = resolveBundledAssets();
      const defaultAgents = ['visit-steward', 'benefits-guide', 'habit-companion'];
      const defaultSkills = ['visit-prep', 'benefits-explainer', 'habit-checkin'];

      for (const skillName of defaultSkills) {
        const src = path.join(assets.skillsDir, skillName);
        const dest = path.join(paths.skills, skillName);
        if (fsSync.existsSync(src)) {
          await copyPackDirectory(src, dest, Boolean(options.force));
        }
      }

      for (const agentName of defaultAgents) {
        const src = path.join(assets.agentsDir, agentName);
        const dest = path.join(paths.agents, agentName);
        if (fsSync.existsSync(src)) {
          await copyPackDirectory(src, dest, Boolean(options.force));
        }
      }
    } catch (err: any) {
      // If bundled assets cannot be found in test isolation, proceed with bare workspace
      if (!options.bundled) {
        throw err;
      }
    }
  }

  console.log(`✓ Initialized Carefold workspace in ${targetDir}`);
  console.log(`  • Config: carefold.config.json (Provider: ${config.model.provider}, Model: ${config.model.model} @ ${config.model.baseUrl})`);
  console.log(`  • Directories: agents/, skills/, chats/, attachments/, logs/`);
  console.log(`\nNext steps:`);
  console.log(`  carefold agent list`);
  console.log(`  carefold run --agent visit-steward "What questions should I ask my doctor?"`);
}
