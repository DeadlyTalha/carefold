'use client';

import React from 'react';
import { Bot } from 'lucide-react';
import { ToolTraceCard, ToolTraceItem } from './ToolTraceCard';
import { MessageToolbar } from './chat/MessageToolbar';
import { CodeBlock } from './chat/CodeBlock';
import { ThinkingIndicator } from './chat/ThinkingIndicator';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
  isRefusal?: boolean;
  refusalReason?: string;
  toolTraces?: ToolTraceItem[];
  traces?: ToolTraceItem[];
  attachments?: string[];
}

export interface ChatMessageItemProps {
  message: ChatMessage;
  onRerun?: (prompt: string) => void;
  onRegenerate?: (messageId: string) => void;
  disabled?: boolean;
  agentTitle?: string;
}

const SAFE_REFUSAL_SNIPPET = 'I am a wellness and care navigation assistant, not a licensed medical professional';

/**
 * Strips internal suggestion generator preamble or raw JSON question blocks
 * from assistant message content so they are never displayed in the chat bubble.
 */
export function stripSuggestionLeakage(text: string): string {
  if (!text) return text;
  let hasLeakage = false;
  let cleaned = text.replace(
    /(\.|\?|\!)?\s*(?:assistant\s*\n+|\n|^)Here are \d+ concise follow-up questions.*$/is,
    (_, punct) => {
      hasLeakage = true;
      return punct || '';
    }
  );
  cleaned = cleaned.replace(
    /(?:\n|^)\[\s*"[^"]+\?\s*"(?:,\s*"[^"]+\?\s*")*\s*\]\s*$/s,
    () => {
      hasLeakage = true;
      return '';
    }
  );
  return hasLeakage ? cleaned.trimEnd() : cleaned;
}

export function formatMessageTimestamp(timestamp?: string): string | null {
  if (!timestamp) return null;
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return null;
  }
}

/**
 * Strips robotic "Based on the provided reference document/guide..." opening phrases
 * from assistant messages so responses read naturally without confusing the user.
 */
export function stripReferencePreamble(text: string): string {
  if (!text) return text;
  const pattern = /^(?:(?:\*|_){0,2}(?:(?:Based on|According to|From) (?:the )?(?:provided )?reference (?:document|guide|material|checklist|information|docs?)(?: provided)?)[,:]?(?:\*|_){0,2}[,:]?\s*)/i;
  let cleaned = text.trimStart().replace(pattern, '').replace(/^[*_\s]+/, '');
  if (cleaned && cleaned !== text) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

export function ChatMessageItem({
  message,
  onRerun,
  onRegenerate,
  disabled = false,
  agentTitle
}: ChatMessageItemProps) {
  const displayContent = message.role === 'assistant'
    ? stripReferencePreamble(stripSuggestionLeakage(message.content))
    : message.content;
  const isRefusal = Boolean(message.isRefusal || displayContent.includes(SAFE_REFUSAL_SNIPPET));
  const traces = message.toolTraces || message.traces || [];
  const formattedTime = formatMessageTimestamp(message.timestamp);

  if (message.role === 'user') {
    return (
      <div data-testid="chat-message-user" className="relative group flex justify-end my-3">
        {/* User Message Bubble */}
        <div className="max-w-[85%] md:max-w-[75%] min-w-[200px] rounded-2xl px-4 py-2.5 bg-blue-600 text-white shadow-sm">
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-1">
              {message.attachments.map((att) => (
                <span key={att} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-700/60 font-mono">
                  📎 {att}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>

          {/* User Message Bottom Footer Row */}
          <div className="flex items-center justify-between gap-3 mt-2 pt-1.5 border-t border-blue-500/40 text-[11px] text-blue-100 select-none">
            {/* Left: Role indicator & Timestamp */}
            <div className="flex items-center gap-1.5 opacity-90">
              <span data-testid="message-role-user" className="font-semibold text-blue-50">
                You
              </span>
              {formattedTime && (
                <>
                  <span className="opacity-60">•</span>
                  <time data-testid="message-timestamp" dateTime={message.timestamp} className="text-blue-100 tabular-nums">
                    {formattedTime}
                  </time>
                </>
              )}
            </div>

            {/* Right: Message Action Toolbar */}
            <MessageToolbar
              role="user"
              content={message.content}
              messageId={message.id}
              onRerun={onRerun}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid={isRefusal ? 'chat-message-refusal' : 'chat-message-assistant'}
      className={`relative group flex flex-col my-3 max-w-[95%] md:max-w-[85%] min-w-[240px] rounded-2xl p-4 shadow-sm transition-colors ${
        isRefusal
          ? 'border-2 border-amber-500 bg-amber-50/70 dark:bg-amber-950/25 text-amber-950 dark:text-amber-100'
          : 'border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
      }`}
    >
      {/* Safe Refusal Header Badge */}
      {isRefusal && (
        <div data-testid="safe-refusal-badge" className="flex items-center gap-2 pb-2 mb-2 border-b border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold text-xs">
          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Safety Refusal Gate: Protected Clinical Boundary</span>
        </div>
      )}

      {/* Refusal Reason Callout */}
      {isRefusal && message.refusalReason && (
        <div data-testid="refusal-reason-callout" className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-2 italic">
          Blocked Category: {message.refusalReason}
        </div>
      )}

      {/* Embedded Tool Execution Traces */}
      {traces.length > 0 && (
        <div data-testid="embedded-tool-traces" className="mb-3 space-y-1">
          {traces.map((trace, idx) => (
            <ToolTraceCard key={trace.id || `${trace.tool}-${trace.status}-${idx}`} trace={trace} />
          ))}
        </div>
      )}

      {/* Message Content with Markdown Formatting */}
      <div className="text-sm leading-relaxed space-y-2 markdown-body">
        {message.isStreaming && !displayContent.trim() ? (
          <ThinkingIndicator
            text={
              traces.some((t) => t.status === 'running')
                ? 'Executing clinical tools...'
                : 'Planning clinical navigation...'
            }
          />
        ) : (
          <>
            {renderSimpleMarkdown(displayContent)}
            {message.isStreaming && displayContent.length > 0 && (
              <span
                data-testid="streaming-indicator"
                className="inline-block w-2 h-4 ml-1 bg-blue-600 dark:bg-blue-400 animate-pulse align-middle"
              />
            )}
          </>
        )}
      </div>

      {/* Assistant Message Bottom Footer Row */}
      <div
        className={`mt-3 pt-2 border-t flex items-center justify-between gap-2 text-xs select-none ${
          isRefusal
            ? 'border-amber-200 dark:border-amber-900/60'
            : 'border-slate-100 dark:border-zinc-800'
        }`}
      >
        {/* Left: Role indicator & Timestamp */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 select-none">
          <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
          <span data-testid="message-role-assistant" className="font-semibold text-slate-700 dark:text-zinc-300">
            {agentTitle || 'Carefold Assistant'}
          </span>
          {formattedTime && (
            <>
              <span className="opacity-50 text-slate-400 dark:text-zinc-600">•</span>
              <time data-testid="message-timestamp" dateTime={message.timestamp} className="text-slate-500 dark:text-zinc-400 tabular-nums">
                {formattedTime}
              </time>
            </>
          )}
        </div>

        {/* Right: Message Action Toolbar */}
        {!message.isStreaming && (
          <MessageToolbar
            role="assistant"
            content={displayContent}
            messageId={message.id}
            onRegenerate={onRegenerate}
            disabled={disabled}
            isStreaming={message.isStreaming}
          />
        )}
      </div>
    </div>
  );
}

/**
 * Lightweight, safe markdown rendering with CodeBlock, list grouping, and typography support.
 */
function renderSimpleMarkdown(content: string): React.ReactNode {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let currentLanguage = 'text';

  let currentListType: 'ul' | 'ol' | null = null;
  let currentListItems: React.ReactNode[] = [];

  const flushList = () => {
    if (currentListType && currentListItems.length > 0) {
      if (currentListType === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="list-disc pl-5 my-1.5 space-y-1 text-sm">
            {currentListItems}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="list-decimal pl-5 my-1.5 space-y-1 text-sm">
            {currentListItems}
          </ol>
        );
      }
      currentListType = null;
      currentListItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    if (rawLine.startsWith('```')) {
      flushList();
      if (inCodeBlock) {
        elements.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeBlockLines.join('\n')}
            language={currentLanguage}
          />
        );
        codeBlockLines = [];
        inCodeBlock = false;
        currentLanguage = 'text';
      } else {
        inCodeBlock = true;
        const tag = rawLine.slice(3).trim().split(/\s+/)[0];
        currentLanguage = tag || 'text';
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    const trimmed = rawLine.trim();

    // Horizontal Rule
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={`hr-${i}`} className="my-3 border-zinc-200 dark:border-zinc-700" />);
      continue;
    }

    // Headings
    if (rawLine.startsWith('#### ')) {
      flushList();
      elements.push(<h4 key={`h4-${i}`} className="text-sm font-bold mt-2 mb-1">{parseInline(rawLine.slice(5))}</h4>);
      continue;
    }
    if (rawLine.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={`h3-${i}`} className="text-base font-bold mt-2 mb-1">{parseInline(rawLine.slice(4))}</h3>);
      continue;
    }
    if (rawLine.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={`h2-${i}`} className="text-lg font-bold mt-3 mb-1">{parseInline(rawLine.slice(3))}</h2>);
      continue;
    }
    if (rawLine.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={`h1-${i}`} className="text-xl font-bold mt-4 mb-2">{parseInline(rawLine.slice(2))}</h1>);
      continue;
    }

    // Bullet List Items (e.g. "* item", "- item", "+ item", or with indentation)
    const bulletMatch = rawLine.match(/^(\s*)([-*+])\s+(.*)$/);
    if (bulletMatch) {
      if (currentListType !== 'ul') {
        flushList();
        currentListType = 'ul';
      }
      const itemContent = bulletMatch[3];
      currentListItems.push(
        <li key={`li-${i}`} className="text-sm leading-relaxed">
          {parseInline(itemContent)}
        </li>
      );
      continue;
    }

    // Ordered / Numbered List Items (e.g. "1. item", "2. item")
    const orderedMatch = rawLine.match(/^(\s*)(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      if (currentListType !== 'ol') {
        flushList();
        currentListType = 'ol';
      }
      const itemContent = orderedMatch[3];
      currentListItems.push(
        <li key={`oli-${i}`} className="text-sm leading-relaxed">
          {parseInline(itemContent)}
        </li>
      );
      continue;
    }

    // Blockquote
    if (rawLine.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote key={`bq-${i}`} className="pl-3 border-l-2 border-zinc-400 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 italic text-sm my-1">
          {parseInline(rawLine.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Empty lines
    if (trimmed.length === 0) {
      flushList();
      elements.push(<div key={`empty-${i}`} className="h-1.5" />);
      continue;
    }

    // Standard paragraph
    flushList();
    elements.push(<p key={`p-${i}`} className="text-sm leading-relaxed">{parseInline(rawLine)}</p>);
  }

  flushList();

  // Handle unclosed code block during active SSE streaming
  if (inCodeBlock) {
    elements.push(
      <CodeBlock
        key="code-unclosed"
        code={codeBlockLines.join('\n')}
        language={currentLanguage}
      />
    );
  }

  return elements;
}

function parseInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split tokens by priority: code, bold-italic, bold, italic, strikethrough, links
  const regex = /(`[^`]+`|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|(?<=\s|^)_[^_]+_(?=\s|$|[.,!?;:])|~~[^~]+~~|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Inline code: `...`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={idx}
          className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-xs text-blue-600 dark:text-blue-400"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Bold-italic: ***...***
    if (part.startsWith('***') && part.endsWith('***') && part.length >= 6) {
      return (
        <strong key={idx} className="font-semibold italic">
          {part.slice(3, -3)}
        </strong>
      );
    }

    // Bold: **...**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Bold: __...__
    if (part.startsWith('__') && part.endsWith('__') && part.length >= 4) {
      return (
        <strong key={idx} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic: *...*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={idx} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Italic: _..._
    if (part.startsWith('_') && part.endsWith('_') && part.length >= 2) {
      return (
        <em key={idx} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Strikethrough: ~~...~~
    if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
      return (
        <del key={idx} className="line-through opacity-70">
          {part.slice(2, -2)}
        </del>
      );
    }

    // Link: [text](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={idx}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline hover:opacity-80 transition-opacity"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return part;
  });
}
