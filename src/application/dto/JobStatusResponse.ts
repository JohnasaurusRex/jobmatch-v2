import { AnalysisResponse } from './AnalysisResponse';

/**
 * DTO for job status responses.
 */
export class JobStatusResponse {
	constructor(
		public readonly jobId: string,
		public readonly status: string,
		public readonly createdAt: Date,
		public readonly completedAt?: Date,
		public readonly errorMessage?: string,
		public readonly analysis?: AnalysisResponse
	) {}

	toJSON() {
		return {
			job_id: this.jobId,
			status: this.status,
			created_at: this.createdAt,
			completed_at: this.completedAt,
			error_message: this.errorMessage,
			result: this.analysis,
		};
	}
}
