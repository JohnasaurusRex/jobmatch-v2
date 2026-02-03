import { Analysis } from '../../domain/entities/Analysis';

export class AnalysisResponse {
	constructor(
		public readonly id: string,
		public readonly searchability: any,
		public readonly hardSkills: any,
		public readonly softSkills: any,
		public readonly recruiterTips: any,
		public readonly overall: any,
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
