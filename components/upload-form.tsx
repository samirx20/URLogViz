'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useAnalysis } from '@/context/analysis-context';

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { setAnalysisInfo, closeModal } = useAnalysis();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleVisualize = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccess('Analyzing...');

    const supabase = createClient();
    const csvText = await file.text();

    const { data: functionData, error: functionError } = await supabase.functions.invoke('analyze-log', {
      body: {
        csvText: csvText,
        fileName: file.name,
      },
    });

    setIsAnalyzing(false);

    if (functionError) {
      setError(`Analysis failed: ${functionError.message}`);
    } else {
      setSuccess('Analysis complete! Redirecting...');
      setAnalysisInfo(functionData.analysisId, file.name);
      closeModal();
      router.push(`/dashboard`);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-center mb-4">Upload Log File</h2>
      <form onSubmit={handleVisualize} className="space-y-6">
        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium">
            Log File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs">.log files up to 10MB</p>
            </div>
          </div>
          {file && <p className="text-sm mt-2">Selected file: {file.name}</p>}
        </div>

        <div>
          <button
            type="submit"
            disabled={isAnalyzing || !file}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium disabled:opacity-50"
          >
            {isAnalyzing ? 'Analyzing...' : 'Visualize'}
          </button>
        </div>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
    </div>
  );
}