'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AnalysisContextType {
  analysisId: string | null;
  fileName: string | null;
  isModalOpen: boolean;
  setAnalysisInfo: (id: string, name: string) => void;
  clearAnalysisInfo: () => void;
  openModal: () => void;
  closeModal: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // On initial load, try to get the info from sessionStorage
    const storedId = sessionStorage.getItem('analysisId');
    const storedName = sessionStorage.getItem('fileName');
    if (storedId && storedName) {
      setAnalysisId(storedId);
      setFileName(storedName);
    }
  }, []);

  const setAnalysisInfo = (id: string, name: string) => {
    sessionStorage.setItem('analysisId', id);
    sessionStorage.setItem('fileName', name);
    setAnalysisId(id);
    setFileName(name);
  };

  const clearAnalysisInfo = () => {
    sessionStorage.removeItem('analysisId');
    sessionStorage.removeItem('fileName');
    setAnalysisId(null);
    setFileName(null);
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <AnalysisContext.Provider value={{ analysisId, fileName, setAnalysisInfo, clearAnalysisInfo, isModalOpen, openModal, closeModal }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
}
