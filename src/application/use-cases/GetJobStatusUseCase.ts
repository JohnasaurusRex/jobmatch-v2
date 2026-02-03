import { IUseCase } from '../interfaces/IUseCase';
import { JobStatusResponse } from '../dto/JobStatusResponse';
import { IJobStatusService } from '../../domain/services/IJobStatusService';
import { IAnalysisRepository } from '../../domain/repositories/IAnalysisRepository';
import { JobId } from '../../domain/value-objects/JobId';
import { AnalysisResponse } from '../dto/AnalysisResponse';

export class GetJobStatusUseCase implements IUseCase<string, JobStatusResponse> {
  constructor(
    private readonly jobStatusService: IJobStatusService,
    private readonly analysisRepository: IAnalysisRepository
  ) {}

  async execute(jobIdValue: string): Promise<JobStatusResponse> {
    const jobId = new JobId(jobIdValue);
    const job = await this.jobStatusService.getJobStatus(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    let analysisResult: AnalysisResponse | undefined;

    if (job.isCompleted() && job.analysisId) {
      const analysis = await this.analysisRepository.findById(job.analysisId);
      if (analysis) {
        analysisResult = AnalysisResponse.fromDomain(analysis);
      }
    }

    return new JobStatusResponse(
      job.id.value,
      job.status,
      job.createdAt,
      job.completedAt,
      job.errorMessage,
      analysisResult
    );
  }
}
