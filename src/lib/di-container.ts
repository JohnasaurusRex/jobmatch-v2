// src/lib/di-container.ts
import { AnalyzeResumeUseCase } from '../application/use-cases/AnalyzeResumeUseCase';
import { GetJobStatusUseCase } from '../application/use-cases/GetJobStatusUseCase';
import { OpenAIAnalysisService } from '../infrastructure/services/OpenAIAnalysisService';
import { PdfProcessor } from '../infrastructure/repositories/PdfProcessor';
import { RedisJobRepository } from '../infrastructure/repositories/RedisJobRepository';

// Services & Repositories
const analysisService = new OpenAIAnalysisService();
const pdfProcessor = new PdfProcessor();
const jobRepository = new RedisJobRepository();

// Use Cases
export const createAnalyzeResumeUseCase = (): AnalyzeResumeUseCase => 
  new AnalyzeResumeUseCase(analysisService, jobRepository, pdfProcessor);

export const createGetJobStatusUseCase = (): GetJobStatusUseCase => 
  new GetJobStatusUseCase(jobRepository);

// Direct instances
export const analyzeResumeUseCase = createAnalyzeResumeUseCase();
export const getJobStatusUseCase = createGetJobStatusUseCase();

// Cleanup utility
export const cleanupFiles = async (): Promise<void> => {
  try {
    await pdfProcessor.cleanupOldFiles();
    console.log('File cleanup completed');
  } catch (error) {
    console.warn('Cleanup failed:', error);
  }
};