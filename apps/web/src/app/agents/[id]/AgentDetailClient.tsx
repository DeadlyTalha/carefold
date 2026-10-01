'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MessageSquare,
  Shield,
  CheckCircle,
  Copy,
  Check,
  Cpu,
  Lock,
  Sparkles
} from 'lucide-react';
import type { AgentDetail } from '@/lib/types';

export function AgentDetailClient({ agent }: { agent: AgentDetail }) {
  const router = useRouter();
  const [copiedCli, setCopiedCli] = useState(false);

  const cliCommand = `carefold run --agent ${agent.id} "Hello"`;

  const handleCopyCli = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const getRiskDisclaimer = (risk: string) => {
    switch (risk) {
      case 'wellness':
        return 'Wellness Companion: Structured for appointment preparation, habit building, and general well-being. Not a healthcare provider.';
      case 'admin':
        return 'Administrative Navigation: Clarifies health insurance terms, billing statements, and plan benefits. Does not render medical decisions or guarantee insurance reimbursement.';
      case 'education':
        return 'Educational Guide: Explains physiological and scientific concepts in plain language. Never substitutes personalized medical counsel.';
      case 'clinical_assist':
        return 'Clinical Assistant: Elevated risk classification. Subject to strict clinician oversight and local safety refusal controls.';
      default:
        return 'Local health assistant with strict Phase 0 sandboxing.';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                {agent.risk_class.replace('_', ' ')}
              </span>
              <span className="text-xs font-mono text-slate-400">v{agent.version}</span>
              <span className="text-xs text-slate-400">• {agent.license}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{agent.title}</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">{getRiskDisclaimer(agent.risk_class)}</p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Link
              href={`/chat?agent=${agent.id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition active:scale-95 text-center"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Try in chat</span>
            </Link>

            <button
              type="button"
              onClick={handleCopyCli}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-mono transition"
            >
              {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedCli ? 'Copied CLI Command!' : `carefold run --agent ${agent.id}`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Starters Chips (CF-S50) */}
      {agent.starters.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Suggested Starter Prompts</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {agent.starters.map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => router.push(`/chat?agent=${agent.id}&prompt=${encodeURIComponent(starter)}`)}
                className="text-left text-xs bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl transition"
              >
                "{starter}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Persona & Intended Behavior */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-slate-500" />
            <span>Persona & Operating Instructions</span>
          </h2>
          <div className="text-xs text-slate-600 leading-relaxed max-h-60 overflow-y-auto bg-slate-50 p-4 rounded-xl border border-slate-200/60 font-sans whitespace-pre-wrap">
            {agent.persona}
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Forbidden Intent Filters (Refusal Gate)</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {agent.forbidden.map((f) => (
                <span
                  key={f}
                  className="bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-mono px-2 py-0.5 rounded"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Declared Skills & Effective Tools Allowlist */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Declared Skills */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Declared Skills ({agent.skills.length})</span>
            </h2>
            <div className="space-y-2.5">
              {agent.skills.map((skill) => (
                <div key={skill.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>{skill.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">v{skill.version}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Effective Tools Union */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Effective Tools Allowlist</span>
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Union of agent and skill declarations restricted to Phase 0 Closed Sandbox:
            </p>
            <div className="space-y-2">
              {agent.effectiveTools.map((tool) => (
                <div
                  key={tool}
                  className="flex items-center justify-between p-2.5 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs"
                >
                  <span className="font-mono font-bold text-emerald-900">{tool}</span>
                  <span className="text-[11px] text-emerald-700">Sandbox Permitted</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
