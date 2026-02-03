'use client';

import { useRouter } from 'next/navigation';
import { Clock, Trash2, TrendingUp, ChevronRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import { AnalysisHistoryItem } from '@/types/analysis';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Displays a list of past analyses from localStorage.
 * Allows users to view or delete past analyses.
 */
export function AnalysisHistory() {
  const router = useRouter();
  const history = useAnalysisStore((state) => state.history);
  const loadFromHistory = useAnalysisStore((state) => state.loadFromHistory);
  const deleteFromHistory = useAnalysisStore((state) => state.deleteFromHistory);

  const handleView = (id: string) => {
    loadFromHistory(id);
    router.push('/dashboard');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteFromHistory(id);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-cyan-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-cyan-400" />
        <h2 className="text-xl font-semibold text-white">Recent Analyses</h2>
        <span className="text-slate-500 text-sm">({history.length})</span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {history.map((item: AnalysisHistoryItem, index: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard
                className="p-4 cursor-pointer hover:border-cyan-500/50 transition-all group flex items-center justify-between"
                hoverEffect={false}
                onClick={() => handleView(item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700/50">
                    <TrendingUp className={`w-5 h-5 ${getScoreColor(item.totalScore)}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                      {item.jobTitle}
                    </h3>
                    <p className="text-sm text-slate-500">{formatDate(item.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${getScoreColor(item.totalScore)}`}>
                      {item.totalScore}%
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete analysis"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
