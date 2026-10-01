import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns HTTP 200 with service health and version metadata', async () => {
    const res = await GET(new Request('http://localhost:3000/api/health'));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.version).toBe('0.1.0');
    expect(typeof data.modelReachable).toBe('boolean');
    expect(data.workspace).toBeDefined();
  });
});
