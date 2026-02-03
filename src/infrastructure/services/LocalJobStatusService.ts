import { IJobStatusService } from '../../domain/services/IJobStatusService';
import { Job, JobStatus } from '../../domain/entities/Job';
import { JobId } from '../../domain/value-objects/JobId';
import { IJobRepository } from '../../domain/repositories/IJobRepository';

export class LocalJobStatusService implements IJobStatusService {
  constructor(private readonly jobRepository: IJobRepository) {}

  async createJob(): Promise<Job> {
    const job = new Job(new JobId(), JobStatus.PROCESSING, new Date());
    await this.jobRepository.save(job);
    return job;
  }

  async updateJobStatus(job: Job): Promise<void> {
    await this.jobRepository.update(job);
  }

  async getJobStatus(id: JobId): Promise<Job | null> {
    return await this.jobRepository.findById(id);
  }
}
