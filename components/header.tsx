'use client';

import Link from 'next/link';
import { useAnalysis } from '@/context/analysis-context';
import { ThemeSwitcher } from './theme-switcher';
import { Button } from './ui/button';
import { CurrentFile } from './current-file';

export function Header() {
  const { analysisId, openModal } = useAnalysis();

  return (
    <header className="flex justify-between items-center p-4 border-b w-full">
      <nav className="flex gap-4 items-center">
        <Link href="/" className="text-lg font-bold">
          URLogViz
        </Link>
        <Link
          href="/dashboard"
          className={`text-lg ${!analysisId ? 'text-muted-foreground pointer-events-none' : ''}`}
          aria-disabled={!analysisId}
          tabIndex={!analysisId ? -1 : undefined}
        >
          Dashboard
        </Link>
        <Link
          href="/analysis"
          className={`text-lg ${!analysisId ? 'text-muted-foreground pointer-events-none' : ''}`}
          aria-disabled={!analysisId}
          tabIndex={!analysisId ? -1 : undefined}
        >
          Analysis
        </Link>
      </nav>
      <div className="flex items-center gap-4">
        <CurrentFile />
        <Button onClick={openModal}>Upload Log</Button>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
