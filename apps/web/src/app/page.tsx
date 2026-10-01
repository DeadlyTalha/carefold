import React from 'react';
import { MarketplaceClient } from './MarketplaceClient';
import type { AgentSummary } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getInstalledAgents(): Promise<AgentSummary[]> {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${backendUrl}/api/agents`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch agents from backend:', err);
  }
  return [];
}

export default async function MarketplacePage() {
  const agents = await getInstalledAgents();
  return <MarketplaceClient initialAgents={agents} />;
}
