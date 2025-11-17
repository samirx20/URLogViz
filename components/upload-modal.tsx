'use client';

import { useAnalysis } from '@/context/analysis-context';
import { UploadForm } from './upload-form';
import { X } from 'lucide-react';

export function UploadModal() {
  const { isModalOpen, closeModal } = useAnalysis();

  if (!isModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-xl p-6 relative w-full max-w-md">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>
        <UploadForm />
      </div>
    </div>
  );
}
