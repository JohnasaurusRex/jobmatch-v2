// src/lib/di-container.ts
import { AnalyzeResumeUseCase } from '../application/use-cases/AnalyzeResumeUseCase';
import { GetJobStatusUseCase } from '../application/use-cases/GetJobStatusUseCase';
import { GetAnalysisResultUseCase } from '../application/use-cases/GetAnalysisResultUseCase';
import { OpenAIAnalysisService } from '../infrastructure/services/OpenAIAnalysisService';
import { FileSystemJobRepository } from '../infrastructure/repositories/FileSystemJobRepository';
import { FileSystemAnalysisRepository } from '../infrastructure/repositories/FileSystemAnalysisRepository';
import { LocalJobStatusService } from '../infrastructure/services/LocalJobStatusService';
import { PdfProcessor } from '../infrastructure/repositories/PdfProcessor';

// Repositories
const jobRepository = new FileSystemJobRepository();
const analysisRepository = new FileSystemAnalysisRepository();
const pdfProcessor = new PdfProcessor();

// Services
const analysisService = new OpenAIAnalysisService();
const jobStatusService = new LocalJobStatusService(jobRepository);

// Use Cases
export const createAnalyzeResumeUseCase = (): AnalyzeResumeUseCase => 
  new AnalyzeResumeUseCase(analysisService, jobStatusService, analysisRepository, pdfProcessor);

export const createGetJobStatusUseCase = (): GetJobStatusUseCase => 
  new GetJobStatusUseCase(jobStatusService, analysisRepository);

export const createGetAnalysisResultUseCase = (): GetAnalysisResultUseCase => 
  new GetAnalysisResultUseCase(analysisRepository);

// Direct instances
export const analyzeResumeUseCase = createAnalyzeResumeUseCase();
export const getJobStatusUseCase = createGetJobStatusUseCase();
export const getAnalysisResultUseCase = createGetAnalysisResultUseCase();

// Utility for testing
export const testPdfProcessing = async (file: Buffer): Promise<string> => {
  try {
    const result = await pdfProcessor.extractText(file);
    console.log('PDF processing test successful');
    return result;
  } catch (error) {
    console.error('PDF processing test failed:', error);
    throw error;
  }
};

// Cleanup utility
export const cleanupFiles = async (): Promise<void> => {
  try {
    await pdfProcessor.cleanupOldFiles();
    console.log('File cleanup completed');
  } catch (error) {
    console.warn('Cleanup failed:', error);
  }
};