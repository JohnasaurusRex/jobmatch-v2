import { IUseCase } from '../interfaces/IUseCase';
import { AnalyzeResumeRequest } from '../dto/AnalyzeResumeRequest';
import { JobStatusResponse } from '../dto/JobStatusResponse';
import { Resume } from '../../domain/entities/Resume';
import { JobDescription } from '../../domain/entities/JobDescription';
import { Job, JobStatus } from '../../domain/entities/Job';
import { JobId } from '../../domain/value-objects/JobId';
import { IAnalysisService } from '../../domain/services/IAnalysisService';
import { IJobRepository } from '../../domain/repositories/IJobRepository';
import { IPdfProcessor } from '../../domain/repositories/IPdfProcessor';
import { v4 as uuidv4 } from 'uuid';

export class AnalyzeResumeUseCase implements IUseCase<AnalyzeResumeRequest, JobStatusResponse> {
  constructor(
    private readonly analysisService: IAnalysisService,
    private readonly jobRepository: IJobRepository,
    private readonly pdfProcessor: IPdfProcessor
  ) {}

  async execute(request: AnalyzeResumeRequest): Promise<JobStatusResponse> {
    if (!request.resumeFile || !request.jobDescription) {
      throw new Error('Resume file and job description are required');
    }

    const job = this.createInitialJob();
    await this.jobRepository.save(job);

    this.runBackgroundAnalysis(job, request).catch(error => {
        this.handleAnalysisError(job, error);
    });

    return new JobStatusResponse(
      job.id.toString(),
      job.status,
      job.createdAt
    );
  }

  private createInitialJob(): Job {
    return new Job(
        new JobId(uuidv4()),
        JobStatus.PROCESSING,
        new Date()
    );
  }

  private async runBackgroundAnalysis(job: Job, request: AnalyzeResumeRequest): Promise<void> {
      console.log(`Starting analysis for job: ${job.id.toString()}`);
      
      try {
        const resumeText = await this.pdfProcessor.extractText(request.resumeFile);
        
        const resume = new Resume(
            uuidv4(),
            resumeText,
            request.fileName || 'resume.pdf',
            new Date()
        );

        const jobDescription = new JobDescription(request.jobDescription);
        const analysis = await this.analysisService.analyzeResume(resume, jobDescription);
        
        job.markAsCompleted(analysis);
        await this.jobRepository.save(job);
        
        console.log(`Job ${job.id.toString()} completed`);
      } catch (error) {
        // Re-throw to be caught by the caller (.catch block in execute)
        throw error;
      }
  }

  private handleAnalysisError(job: Job, error: unknown): void {
      console.error(`Analysis failed for job ${job.id.toString()}:`, error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      job.markAsError(message);
      
      this.jobRepository.save(job).catch(saveError => {
          console.error('Failed to save error status:', saveError);
      });
  }
}