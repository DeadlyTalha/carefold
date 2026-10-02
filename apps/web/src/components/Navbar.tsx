/*
 * Carefold — Healthcare AI Agent Marketplace & Runtime
 * Copyright 2026 Spectrayan
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartHandshake, LayoutGrid, MessageSquare, Activity, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOptionalTheme } from '@/components/ThemeProvider';
import { type Theme, getStoredTheme, setStoredTheme, resolveTheme, applyThemeToDOM } from '@/lib/theme';

export function Navbar() {
  const pathname = usePathname();
  const [ollamaOnline, setOllamaOnline] = useState<boolean | null>(null);

  const [mounted, setMounted] = useState(false);

  // Safely consume ThemeContext, falling back to local state if rendered without provider
  const themeContext = useOptionalTheme();
  const [fallbackTheme, setFallbackTheme] = useState<Theme>('system');

  useEffect(() => {
    setMounted(true);
    setFallbackTheme(getStoredTheme());
  }, []);

  const theme = themeContext ? themeContext.theme : fallbackTheme;
  const resolvedTheme = themeContext ? themeContext.resolvedTheme : resolveTheme(fallbackTheme);
  const effectiveTheme = mounted ? theme : 'system';
  const effectiveResolvedTheme = mounted ? resolvedTheme : 'light';

  const toggleTheme = () => {
    if (themeContext) {
      themeContext.toggleTheme();
    } else {
      const nextTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark';
      setFallbackTheme(nextTheme);
      setStoredTheme(nextTheme);
      applyThemeToDOM(resolveTheme(nextTheme));
    }
  };

  useEffect(() => {
    let mounted = true;
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          if (mounted) setOllamaOnline(Boolean(data.ollama?.reachable || data.modelReachable));
        } else {
          if (mounted) setOllamaOnline(false);
        }
      } catch {
        if (mounted) setOllamaOnline(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const navLinks = [
    { href: '/', label: 'Marketplace', icon: LayoutGrid },
    { href: '/chat', label: 'Chat', icon: MessageSquare }
  ];

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Carefold</span>
          </Link>

          {/* Primary Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition',
                    isActive
                      ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 font-semibold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Runtime Status & Theme Toggle Cluster */}
        <div className="flex items-center gap-2.5">
          {/* Ollama Status */}
          <div
            title={
              ollamaOnline === null
                ? 'Checking local model...'
                : ollamaOnline
                ? 'Local Ollama endpoint active (127.0.0.1:11434)'
                : 'Ollama offline (Mock/Offline mode active)'
            }
            className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 text-slate-600 dark:text-zinc-300"
          >
            <Activity className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
            <span className="hidden md:inline text-slate-600 dark:text-zinc-300">Ollama:</span>
            {ollamaOnline === null ? (
              <span className="inline-block w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
            ) : ollamaOnline ? (
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span className="hidden sm:inline">Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}
          </div>

          {/* Accessible Theme Toggle Button */}
          <button
            type="button"
            data-testid="theme-toggle-btn"
            aria-label={`Switch to ${effectiveResolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Current theme: ${effectiveTheme} (${effectiveResolvedTheme}). Click to switch.`}
            onClick={toggleTheme}
            suppressHydrationWarning
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-700 transition cursor-pointer shadow-sm"
          >
            {mounted && effectiveResolvedTheme === 'dark' ? (
              <Sun data-testid="theme-icon-sun" className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon data-testid="theme-icon-moon" className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
