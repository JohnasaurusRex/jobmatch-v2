// src/application/use-cases/AnalyzeResumeUseCase.ts
import { IUseCase } from '../interfaces/IUseCase';
import { AnalyzeResumeRequest } from '../dto/AnalyzeResumeRequest';
import { AnalysisResponse } from '../dto/AnalysisResponse';
import { Resume } from '../../domain/entities/Resume';
import { JobDescription } from '../../domain/entities/JobDescription';
import { IAnalysisService } from '../../domain/services/IAnalysisService';
import { IPdfProcessor } from '../../domain/repositories/IPdfProcessor';
import { v4 as uuidv4 } from 'uuid';

/**
 * Synchronous use case for analyzing a resume.
 * Waits for the OpenAI analysis to complete and returns the result directly.
 * This is optimized for serverless environments like Vercel.
 */
export class AnalyzeResumeUseCase implements IUseCase<AnalyzeResumeRequest, AnalysisResponse> {
  constructor(
    private readonly analysisService: IAnalysisService,
    private readonly pdfProcessor: IPdfProcessor
  ) {}

  async execute(request: AnalyzeResumeRequest): Promise<AnalysisResponse> {
    // Validation
    if (!request.resumeFile || !request.jobDescription) {
      throw new Error('Resume file and job description are required');
    }

    console.log('File validation - Size:', request.resumeFile.length, 'bytes');

    // Validate file size (5MB limit)
    const maxFileSize = 5 * 1024 * 1024;
    if (request.resumeFile.length > maxFileSize) {
      throw new Error('Resume file too large');
    }

    // Basic PDF validation
    if (!this.isBasicPdfValid(request.resumeFile)) {
      throw new Error('File is not a valid PDF format');
    }

    // Extract text from PDF
    console.log('Extracting text from PDF...');
    const resumeText = await this.pdfProcessor.extractText(request.resumeFile);
    console.log('Text extracted, length:', resumeText.length);
    
    if (!resumeText.trim()) {
      throw new Error('Empty resume text extracted');
    }

    // Create domain entities
    const resume = new Resume(
      uuidv4(),
      resumeText,
      request.fileName || 'resume.pdf',
      new Date()
    );

    const jobDescription = new JobDescription(request.jobDescription);

    // Validate entities
    if (resume.isEmpty() || !resume.hasValidContent()) {
      throw new Error('Invalid resume content');
    }

    if (jobDescription.isEmpty() || !jobDescription.hasValidContent()) {
      throw new Error('Invalid job description content');
    }

    // Perform AI analysis (synchronous - waits for completion)
    console.log('Starting AI analysis...');
    const analysis = await this.analysisService.analyzeResume(resume, jobDescription);
    console.log('AI analysis completed');

    // Return the analysis result directly
    return AnalysisResponse.fromDomain(analysis);
  }

  private isBasicPdfValid(file: Buffer): boolean {
    try {
      if (!Buffer.isBuffer(file) || file.length === 0) {
        return false;
      }

      // Check for PDF magic number
      const pdfSignature = file.subarray(0, 4).toString('ascii');
      return pdfSignature.startsWith('%PDF');
    } catch {
      return false;
    }
  }
}