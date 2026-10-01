'use client';

import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export interface SuggestedQuestionsChipsProps {
  /** Array of 2-3 contextual follow-up question strings emitted by the agent runner. */
  suggestions?: string[];
  /** Callback fired when a chip is clicked, passing the chosen question to submit. */
  onSelectSuggestion: (question: string) => void;
  /** Whether the chips are disabled (e.g. while an answer is currently streaming). */
  disabled?: boolean;
}

export function SuggestedQuestionsChips({
  suggestions,
  onSelectSuggestion,
  disabled = false
}: SuggestedQuestionsChipsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  // Deduplicate and cap at 3 suggestions
  const cleanSuggestions = Array.from(
    new Set(suggestions.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean))
  ).slice(0, 3);

  if (cleanSuggestions.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="suggested-questions-container"
      aria-label="Suggested follow-up questions"
      className="w-full flex flex-col gap-1.5 pt-1 pb-2"
    >
      <div className="flex items-center gap-1.5 text-xs text-blue-700 dark:text-blue-400 font-semibold select-none">
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span>Suggested follow-ups:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {cleanSuggestions.map((question, idx) => (
          <button
            key={`${idx}-${question.slice(0, 24)}`}
            type="button"
            data-testid="suggested-question-chip"
            disabled={disabled}
            onClick={() => onSelectSuggestion(question)}
            className="inline-flex items-center text-left text-xs min-h-[32px] px-3.5 py-1.5 rounded-full border border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-950 dark:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-950 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm hover:shadow group cursor-pointer"
          >
            <span className="truncate max-w-xs sm:max-w-md md:max-w-lg">{question}</span>
            <ArrowRight className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
