import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StoredAnalysis, AnalysisHistoryItem } from '@/types/analysis';
import { v4 as uuidv4 } from 'uuid';

/**
 * State interface for the analysis Zustand store.
 */
export interface AnalysisState {
  /** Currently viewed analysis (for Dashboard) */
  currentAnalysis: StoredAnalysis | null;
  
  /** History of all analyses (persisted to localStorage) */
  history: AnalysisHistoryItem[];
  
  /** Loading state indicator */
  isLoading: boolean;

  /** Set the current analysis and add to history */
  setAnalysis: (data: StoredAnalysis) => void;
  
  /** Set loading state */
  setIsLoading: (loading: boolean) => void;
  
  /** Load a specific analysis from history into current view */
  loadFromHistory: (id: string) => void;
  
  /** Delete an analysis from history */
  deleteFromHistory: (id: string) => void;
  
  /** Clear the current analysis (but keep history) */
  clearCurrent: () => void;
  
  /** Reset the entire store */
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set, get) => ({
      currentAnalysis: null,
      history: [],
      isLoading: false,

      setAnalysis: (data: StoredAnalysis) => {
        const historyItem: AnalysisHistoryItem = {
          id: uuidv4(),
          jobTitle: data.overall.applyingFor.jobTitle,
          totalScore: data.overall.totalScore,
          createdAt: new Date().toISOString(),
          analysis: data,
        };
        
        set((state) => ({
          currentAnalysis: data,
          history: [historyItem, ...state.history].slice(0, 20), // Keep max 20 items
        }));
      },

      setIsLoading: (loading: boolean) => set({ isLoading: loading }),

      loadFromHistory: (id: string) => {
        const state = get();
        const item = state.history.find((h) => h.id === id);
        if (item) {
          set({ currentAnalysis: item.analysis });
        }
      },

      deleteFromHistory: (id: string) => {
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
          // Also clear current if it matches the deleted item
          currentAnalysis: state.history.find((h) => h.id === id)?.analysis === state.currentAnalysis
            ? null
            : state.currentAnalysis,
        }));
      },

      clearCurrent: () => set({ currentAnalysis: null }),

      reset: () => set({ currentAnalysis: null, history: [], isLoading: false }),
    }),
    {
      name: 'jobmatch-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        history: state.history,
        currentAnalysis: state.currentAnalysis,
      }),
    }
  )
);
