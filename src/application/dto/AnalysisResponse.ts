import { Analysis, SearchabilityAnalysis, HardSkillsAnalysis, SoftSkillsAnalysis, RecruiterTipsAnalysis, OverallAnalysis } from '../../domain/entities/Analysis';

/**
 * DTO for sending analysis data to the client.
 */
export class AnalysisResponse {
	constructor(
		public readonly id: string,
		public readonly searchability: SearchabilityAnalysis,
		public readonly hardSkills: HardSkillsAnalysis,
		public readonly softSkills: SoftSkillsAnalysis,
		public readonly recruiterTips: RecruiterTipsAnalysis,
		public readonly overall: OverallAnalysis,
		public readonly createdAt: Date
	) {}

	static fromDomain(analysis: Analysis): AnalysisResponse {
		return new AnalysisResponse(
			analysis.id,
			analysis.searchability,
			analysis.hardSkills,
			analysis.softSkills,
			analysis.recruiterTips,
			analysis.overall,
			analysis.createdAt
		);
	}

	toJSON() {
		return {
			id: this.id,
			searchability: this.searchability,
			hardSkills: this.hardSkills,
			softSkills: this.softSkills,
			recruiterTips: this.recruiterTips,
			overall: this.overall,
			createdAt: this.createdAt,
		};
	}
}
