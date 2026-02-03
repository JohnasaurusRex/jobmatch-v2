'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';

export function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    // Small delay to ensure hydration/client-side execution
    const loadAnalysis = () => {
      try {
        const storedData = sessionStorage.getItem('analysisResult');
        if (!storedData) {
          router.push('/');
          return;
        }
        
        const parsedData = JSON.parse(storedData);
        setAnalysis(parsedData);
      } catch (error) {
        console.error('Failed to parse analysis data:', error);
        router.push('/');
      }
    };

    loadAnalysis();
  }, [router]);

  if (!analysis) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="px-6 py-8">
            <MainContent activeTab={activeTab} analysis={analysis} />
          </div>
        </main>
      </div>
    </div>
  );
}
