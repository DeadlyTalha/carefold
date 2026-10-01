import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveSandboxedPath, SandboxSecurityError } from '../utils/sandbox.js';
import type { ExecutionContext } from '../types/context.js';
import type { ToolResult } from '../types/tool.js';

export async function executeWorkspaceNote(
  params: { title: string; content: string },
  context: ExecutionContext | { workspaceDir?: string; workspaceRoot?: string; agent?: any }
): Promise<ToolResult> {
  try {
    if (!params.title || typeof params.title !== 'string') {
      return { success: false, output: null, error: 'Parameter "title" must be a non-empty string.' };
    }
    if (typeof params.content !== 'string') {
      return { success: false, output: null, error: 'Parameter "content" must be a string.' };
    }

    const wsRoot = (context as any).workspaceRoot || (context as any).workspaceDir || process.cwd();

    // Sanitize title to safe filename slug
    const safeTitle = params.title
      .trim()
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 80) || 'note';

    const filename = `${safeTitle}.md`;

    // Determine target notes directory (supporting both ws/notes and ws/workspace/notes)
    let notesDir = path.resolve(wsRoot, 'notes');
    try {
      const wsSubNotes = path.resolve(wsRoot, 'workspace', 'notes');
      const wsSubStat = await fs.stat(wsSubNotes).catch(() => null);
      if (wsSubStat?.isDirectory()) {
        notesDir = wsSubNotes;
      } else {
        const rootNotesStat = await fs.stat(notesDir).catch(() => null);
        if (!rootNotesStat?.isDirectory()) {
          const wsFolderStat = await fs.stat(path.resolve(wsRoot, 'workspace')).catch(() => null);
          if (wsFolderStat?.isDirectory()) {
            notesDir = wsSubNotes;
          }
        }
      }
    } catch {}

    const targetPath = await resolveSandboxedPath(notesDir, filename, { mustExist: false });

    // Format content with frontmatter
    const agentId = (context as any).agent?.id || 'carefold-agent';
    const frontmatter = [
      '---',
      `title: ${JSON.stringify(safeTitle)}`,
      `created_at: ${JSON.stringify(new Date().toISOString())}`,
      `agent_id: ${JSON.stringify(agentId)}`,
      '---',
      '',
      params.content.trim(),
      ''
    ].join('\n');

    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    // Defense-in-depth: verify target is not a symlink prior to writing
    const existingStat = await fs.lstat(targetPath).catch(() => null);
    if (existingStat && existingStat.isSymbolicLink()) {
      return {
        success: false,
        output: null,
        error: `Path traversal forbidden: Target note "${filename}" is a symlink.`
      };
    }

    await fs.writeFile(targetPath, frontmatter, { encoding: 'utf8', flag: 'w' });

    const relPath = path.relative(wsRoot, targetPath);

    return {
      success: true,
      output: {
        title: safeTitle,
        path: relPath,
        bytes_written: Buffer.byteLength(frontmatter, 'utf8')
      }
    };
  } catch (err: any) {
    return {
      success: false,
      output: null,
      error: err instanceof SandboxSecurityError ? err.message : `Failed to save note: ${err.message}`
    };
  }
}
