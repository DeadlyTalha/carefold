import type { Metadata } from 'next';
import './globals.css';
import { SafetyDisclaimerBanner } from '@/components/SafetyDisclaimerBanner';
import { Navbar } from '@/components/Navbar';
import { ThemeProvider, ThemeScript } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Carefold — Specialist Health Agents',
  description: 'Local-first runtime and marketplace for specialist health agents (wellness, care navigation, clinic-admin).'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 transition-colors">
        <ThemeProvider>
          <SafetyDisclaimerBanner />
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 mt-auto transition-colors">
            <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 dark:text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>Carefold Phase 0 • Open-Source Local Runtime • Apache-2.0</div>
              <div>Zero cloud sync • No prompt telemetry • 100% on-device</div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
