export interface IAnalysisService {
	analyzeResume(resume: import('../entities/Resume').Resume, jobDescription: import('../entities/JobDescription').JobDescription): Promise<import('../entities/Analysis').Analysis>;
}
