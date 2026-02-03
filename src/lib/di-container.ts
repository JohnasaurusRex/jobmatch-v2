// src/lib/di-container.ts
import { AnalyzeResumeUseCase } from '../application/use-cases/AnalyzeResumeUseCase';
import { OpenAIAnalysisService } from '../infrastructure/services/OpenAIAnalysisService';
import { PdfProcessor } from '../infrastructure/repositories/PdfProcessor';

// Services
const analysisService = new OpenAIAnalysisService();
const pdfProcessor = new PdfProcessor();

// Use Cases (simplified - no job tracking needed for synchronous API)
export const createAnalyzeResumeUseCase = (): AnalyzeResumeUseCase => 
  new AnalyzeResumeUseCase(analysisService, pdfProcessor);

// Direct instance
export const analyzeResumeUseCase = createAnalyzeResumeUseCase();

// Cleanup utility
export const cleanupFiles = async (): Promise<void> => {
  try {
    await pdfProcessor.cleanupOldFiles();
    console.log('File cleanup completed');
  } catch (error) {
    console.warn('Cleanup failed:', error);
  }
};