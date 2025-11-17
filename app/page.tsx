'use client';

import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/context/analysis-context";
import { UploadModal } from "@/components/upload-modal";
import { CurrentFile } from "@/components/current-file";

export default function Home() {
  const { openModal } = useAnalysis();

  return (
    <div className="w-full flex-grow flex flex-col justify-center items-center p-8 text-center">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold">
          Universal Robot Log Visualizer
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload your Universal Robot log files to instantly analyze, visualize, and gain insights from your operational data.
        </p>
        <div className="flex flex-col items-center gap-4 mt-8">
          <CurrentFile />
          <Button size="lg" onClick={openModal}>
            Upload Log File
          </Button>
        </div>
      </div>
      <UploadModal />
    </div>
  );
}