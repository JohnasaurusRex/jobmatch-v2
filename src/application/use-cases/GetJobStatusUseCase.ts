// src/application/use-cases/GetJobStatusUseCase.ts
import { IUseCase } from '../interfaces/IUseCase';
import { JobStatusResponse } from '../dto/JobStatusResponse';
import { AnalysisResponse } from '../dto/AnalysisResponse';
import { IJobRepository } from '../../domain/repositories/IJobRepository';
import { JobId } from '../../domain/value-objects/JobId';

export class GetJobStatusUseCase implements IUseCase<string, JobStatusResponse> {
  constructor(private readonly jobRepository: IJobRepository) {}

  async execute(id: string): Promise<JobStatusResponse> {
    const job = await this.jobRepository.findById(new JobId(id));

    if (!job) {
      throw new Error('Job not found');
    }

    let analysisResponse: AnalysisResponse | undefined;
    if (job.analysisResult) {
      analysisResponse = AnalysisResponse.fromDomain(job.analysisResult);
    }

    return new JobStatusResponse(
      job.id.toString(),
      job.status,
      job.createdAt,
      job.completedAt,
      job.errorMessage,
      analysisResponse
    );
  }
}
