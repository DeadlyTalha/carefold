import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/skills/route';

describe('GET /api/skills', () => {
  it('returns list of installed skills with risk classes and tools', async () => {
    const res = await GET(new Request('http://localhost:3000/api/skills'));
    expect(res.status).toBe(200);

    const skills = await res.json();
    expect(Array.isArray(skills)).toBe(true);

    const visitPrep = skills.find((s: any) => s.id === 'visit-prep');
    expect(visitPrep).toBeDefined();
    expect(visitPrep.risk_class).toBe('wellness');
    expect(visitPrep.tools).toContain('skill-docs');
  });
});
