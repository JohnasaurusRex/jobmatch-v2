import { Job } from '../entities/Job';
import { JobId } from '../value-objects/JobId';

export interface IJobRepository {
  save(job: Job): Promise<void>;
  findById(id: JobId): Promise<Job | null>;
  update(job: Job): Promise<void>;
  delete(id: JobId): Promise<void>;
}
