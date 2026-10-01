export interface SafetyCheckResult {
  refused: boolean;
  reason?: string;
  safeResponse?: string;
}
