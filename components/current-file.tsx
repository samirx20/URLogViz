'use client';

import { useAnalysis } from '@/context/analysis-context';
import { FileText } from 'lucide-react';

export function CurrentFile() {
  const { fileName } = useAnalysis();

  if (!fileName) {
    return null;
  }

  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <FileText className="mr-2 h-4 w-4" />
      <span className="truncate max-w-xs">{fileName}</span>
    </div>
  );
}
