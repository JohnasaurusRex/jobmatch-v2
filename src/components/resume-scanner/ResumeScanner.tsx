'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, CheckCircle, AlertCircle, Scan, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalysisStore } from '@/store/useAnalysisStore';

const scanSteps = [
    "Initializing quantum scanner...",
    "Parsing semantic structure...",
    "Analyzing keyword density...",
    "Evaluating competency model...",
    "Calculating fit probability...",
    "Generating visualization matrices..."
];

export function ResumeScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const setAnalysis = useAnalysisStore(state => state.setAnalysis);

  // Cycle through scan steps during loading
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setScanStep(prev => (prev < scanSteps.length - 1 ? prev + 1 : 0));
    }, 2500);
    
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
    } else {
        setError('Please upload a valid PDF file.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jobDescription) {
        setError("Please provide both a resume and job description.");
        return;
    }

    setIsLoading(true);
    setScanStep(0);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);

    try {
        // Synchronous API call - waits for analysis to complete
        const res = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Analysis failed");
        }

        const data = await res.json();
        
        // SUCCESS: Store in Zustand (persisted to localStorage)
        setAnalysis(data);
        
        // Navigate to dashboard
        router.push('/dashboard');
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
        setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Section */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-transparent bg-clip-text drop-shadow-sm p-2">
            AI Resume Analyzer
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Optimize your ATS score with our deep-learning matching engine.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
          >
              <GlassCard className="flex flex-col items-center justify-center py-24 text-center border-cyan-500/30 relative overflow-hidden bg-slate-900/80">
                 {/* Scanning Line Animation */}
                 <motion.div 
                    className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.8)] z-20"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 />
                 
                 <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-8 relative">
                        <Scan className="w-24 h-24 text-cyan-400 animate-pulse" />
                        <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-ping" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Analyzing Profile</h3>
                    <p className="text-cyan-400/80 font-mono text-lg mb-2 min-h-[1.75rem]">{scanSteps[scanStep]}</p>
                    <p className="text-slate-500 text-sm mb-8">This may take 10-20 seconds...</p>
                    
                    <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                            animate={{ width: ["0%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    </div>
                 </div>
              </GlassCard>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            onSubmit={handleSubmit} 
            className="space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Upload Area */}
            <GlassCard 
                className={`p-10 border-2 border-dashed transition-all duration-300 group cursor-pointer
                    ${isDragOver ? 'border-cyan-400/70 bg-cyan-400/5' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
                `}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if(f) {
                            if(f.type === 'application/pdf') { setFile(f); setError(null); }
                            else setError('PDF only please');
                        }
                    }} 
                    accept=".pdf" 
                    className="hidden" 
                />
                
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className={`p-4 rounded-full transition-all duration-300 ${file ? 'bg-green-500/20' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
                        {file ? <CheckCircle className="w-10 h-10 text-green-400" /> : <Upload className="w-10 h-10 text-cyan-400" />}
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {file ? file.name : "Upload Resume"}
                        </h3>
                        <p className="text-slate-400">
                            {file ? "Ready for analysis" : "Drag & drop your PDF here, or click to browse"}
                        </p>
                    </div>
                </div>
            </GlassCard>

            {/* Job Description Area */}
            <GlassCard className="p-1">
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here (Ctrl+V)..."
                    className="w-full h-48 bg-slate-950/50 text-slate-100 placeholder:text-slate-600 p-6 rounded-xl border-none focus:ring-1 focus:ring-cyan-500/50 resize-none scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent transition-all"
                />
            </GlassCard>

            {/* Error Message */}
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200"
                >
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    {error}
                </motion.div>
            )}

            {/* Action Button */}
            <Button 
                type="submit" 
                size="lg"
                disabled={!file || !jobDescription}
                className={`
                    w-full h-14 text-lg font-bold tracking-wide transition-all duration-300
                    ${(!file || !jobDescription) 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-[1.01] text-white border-none'}
                `}
            >
                <Scan className="w-5 h-5 mr-3" />
                Start Analysis
                <ArrowRight className="w-5 h-5 ml-2 opacity-70" />
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
