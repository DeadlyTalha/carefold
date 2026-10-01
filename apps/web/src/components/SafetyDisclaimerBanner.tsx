import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export function SafetyDisclaimerBanner() {
  return (
    <aside
      data-testid="safety-disclaimer-header"
      aria-label="Safety Disclaimer"
      className="bg-amber-500 text-slate-950 px-4 py-2 text-xs md:text-sm font-semibold sticky top-0 z-50 shadow-sm border-b border-amber-600 flex items-center justify-between"
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-center gap-2 text-center">
        <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" aria-hidden="true" />
        <span>
          <strong>Wellness / navigation / admin help — not diagnosis or treatment.</strong>{' '}
          <span className="hidden sm:inline font-normal text-slate-900">
            Carefold agents run locally and cannot prescribe medications or replace emergency care.
          </span>
        </span>
      </div>
      <div className="hidden md:flex items-center gap-1 text-[11px] font-medium bg-amber-400/80 px-2 py-0.5 rounded text-slate-900 border border-amber-600/30">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
        <span>Local-First Sandbox</span>
      </div>
    </aside>
  );
}

export const DisclaimerHeader = SafetyDisclaimerBanner;
