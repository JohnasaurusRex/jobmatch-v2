'use client';

import { ResumeScanner } from '@/components/resume-scanner/ResumeScanner';
import { AnalysisHistory } from '@/components/resume-scanner/AnalysisHistory';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <ResumeScanner />
      <AnalysisHistory />
    </div>
  );
}
