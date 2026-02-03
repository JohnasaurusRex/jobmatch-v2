// src/application/use-cases/AnalyzeResumeUseCase.ts
import { IUseCase } from '../interfaces/IUseCase';
import { AnalyzeResumeRequest } from '../dto/AnalyzeResumeRequest';
import { JobStatusResponse } from '../dto/JobStatusResponse';
import { Resume } from '../../domain/entities/Resume';
import { JobDescription } from '../../domain/entities/JobDescription';
import { Job } from '../../domain/entities/Job';
import { IAnalysisService } from '../../domain/services/IAnalysisService';
import { IJobStatusService } from '../../domain/services/IJobStatusService';
import { IPdfProcessor } from '../../domain/repositories/IPdfProcessor';
import { v4 as uuidv4 } from 'uuid';

export class AnalyzeResumeUseCase implements IUseCase<AnalyzeResumeRequest, JobStatusResponse> {
  constructor(
    private readonly analysisService: IAnalysisService,
    private readonly jobStatusService: IJobStatusService,
    private readonly pdfProcessor: IPdfProcessor
  ) {}

  async execute(request: AnalyzeResumeRequest): Promise<JobStatusResponse> {
    // Validation
    if (!request.resumeFile || !request.jobDescription) {
      throw new Error('Resume file and job description are required');
    }

    console.log('File validation - Size:', request.resumeFile.length, 'bytes');
    console.log('File validation - Is Buffer:', Buffer.isBuffer(request.resumeFile));
    console.log('File validation - First 10 bytes:', request.resumeFile.subarray(0, 10));

    // Validate file size (5MB limit)
    const maxFileSize = 5 * 1024 * 1024;
    if (request.resumeFile.length > maxFileSize) {
      throw new Error('Resume file too large');
    }

    // Basic PDF validation first
    if (!this.isBasicPdfValid(request.resumeFile)) {
      throw new Error('File is not a valid PDF format');
    }

    // Try advanced PDF validation, but don't fail if it doesn't work
    try {
      const isValidPdf = await this.pdfProcessor.validatePdf(request.resumeFile);
      console.log('Advanced PDF validation result:', isValidPdf);
    } catch (validationError) {
      console.warn('PDF validation warning (proceeding anyway):', validationError);
    }

    // Create job
    const job = await this.jobStatusService.createJob();

    // Start background processing
    this.processResumeInBackground(job, request).catch(async (error: unknown) => {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Background processing failed:', errorMessage);
      job.markAsError(errorMessage);
      await this.jobStatusService.updateJobStatus(job);
    });

    return new JobStatusResponse(
      job.id.value,
      job.status,
      job.createdAt
    );
  }

  private isBasicPdfValid(file: Buffer): boolean {
    try {
      if (!Buffer.isBuffer(file)) {
        console.log('Validation failed: Not a Buffer');
        return false;
      }

      if (file.length === 0) {
        console.log('Validation failed: Empty file');
        return false;
      }

      // Check for PDF magic number
      const pdfSignature = file.subarray(0, 4).toString('ascii');
      console.log('PDF signature found:', pdfSignature);
      
      if (!pdfSignature.startsWith('%PDF')) {
        console.log('Validation failed: Invalid PDF signature');
        return false;
      }

      // Check for EOF marker (basic PDF structure validation)
      const fileEnd = file.subarray(-50).toString('ascii');
      const hasEOF = fileEnd.includes('%%EOF') || fileEnd.includes('xref');
      console.log('PDF has proper ending:', hasEOF);

      return true;
    } catch (error) {
      console.error('Basic PDF validation error:', error);
      return false;
    }
  }

  private async processResumeInBackground(job: Job, request: AnalyzeResumeRequest): Promise<void> {
    try {
      console.log('Starting background processing for job:', job.id.value);
      
      // Extract text from PDF
      console.log('Attempting to extract text from PDF...');
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

      console.log('Starting AI analysis...');
      // Perform analysis
      const analysis = await this.analysisService.analyzeResume(resume, jobDescription);
      console.log('AI analysis completed');

      // Update job with analysis result (stored in-memory)
      job.markAsCompleted(analysis);
      await this.jobStatusService.updateJobStatus(job);
      console.log('Job marked as completed:', job.id.value);

    } catch (error: unknown) {
      const errorMessage = this.extractErrorMessage(error);
      console.error('Background processing error:', errorMessage);
      job.markAsError(errorMessage);
      await this.jobStatusService.updateJobStatus(job);
      throw error;
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Unknown error occurred';
  }
}