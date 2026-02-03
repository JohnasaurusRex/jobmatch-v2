import { Job } from '../entities/Job';
import { JobId } from '../value-objects/JobId';

export interface IJobStatusService {
	createJob(): Promise<Job>;
	updateJobStatus(job: Job): Promise<void>;
	getJobStatus(id: JobId): Promise<Job | null>;
}
