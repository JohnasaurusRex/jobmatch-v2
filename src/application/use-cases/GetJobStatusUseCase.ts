import { IUseCase } from '../interfaces/IUseCase';
import { JobStatusResponse } from '../dto/JobStatusResponse';
import { IJobStatusService } from '../../domain/services/IJobStatusService';
import { JobId } from '../../domain/value-objects/JobId';
import { AnalysisResponse } from '../dto/AnalysisResponse';

export class GetJobStatusUseCase implements IUseCase<string, JobStatusResponse> {
  constructor(
    private readonly jobStatusService: IJobStatusService
  ) {}

  async execute(jobIdValue: string): Promise<JobStatusResponse> {
    const jobId = new JobId(jobIdValue);
    const job = await this.jobStatusService.getJobStatus(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    let analysisResult: AnalysisResponse | undefined;

    // Get analysis directly from job (stored in-memory)
    if (job.isCompleted() && job.analysisResult) {
      analysisResult = AnalysisResponse.fromDomain(job.analysisResult);
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
