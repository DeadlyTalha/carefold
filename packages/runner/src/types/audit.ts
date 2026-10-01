export type AuditEventType = 'run' | 'tool' | 'refuse' | 'error';

export interface AuditEvent {
  ts?: string;                 // ISO 8601 UTC timestamp (auto-generated if omitted)
  agent_id: string;
  skill_id?: string;
  skill_version?: string;
  event: AuditEventType;
  tool?: string;
  allowed?: boolean;
  reason?: string;
  duration_ms?: number;
  prompt?: string;            // Redacted unless audit.store_bodies: true
  completion?: string;        // Redacted unless audit.store_bodies: true
}
