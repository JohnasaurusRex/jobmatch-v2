'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { AnimatedPage } from '@/components/ui/AnimatedPage';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  // Use a hydration-safe pattern for Zustand persist
  const analysisData = useAnalysisStore(state => state.currentAnalysis);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Redirect if no data is found after hydration
  useEffect(() => {
    if (isHydrated && !analysisData) {
        // Optional: Redirect to home if strictly required, but for now just showing loading/empty state is safer
        // router.push('/'); 
    }
  }, [isHydrated, analysisData, router]);

  if (!isHydrated) {
      return null; // or a skeleton loader
  }

  if (!analysisData) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
            <div className="flex flex-col items-center">
                 <p className="mb-4">No analysis data found.</p>
                 <button 
                    onClick={() => router.push('/')}
                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                 >
                    Start New Analysis
                 </button>
            </div>
        </div>
    );
  }

  return (
    <AnimatedPage className="h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-hidden relative">
       {/* Background Decor */}
       <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[60px]" />
       </div>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto z-10 h-full">
        <MainContent activeTab={activeTab} analysis={analysisData} />
      </main>
    </AnimatedPage>
  );
}
