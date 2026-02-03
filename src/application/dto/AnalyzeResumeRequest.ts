export class AnalyzeResumeRequest {
	constructor(
		public readonly resumeFile: Buffer,
		public readonly jobDescription: string,
		public readonly fileName?: string
	) {}

	static fromFormData(resumeFile: Buffer, jobDescription: string, fileName?: string): AnalyzeResumeRequest {
		return new AnalyzeResumeRequest(resumeFile, jobDescription, fileName);
	}
}
