import { Score } from '../value-objects/Score';

export interface AnalysisSection {
  score: Score;
  recommendations: string[];
}

export interface SearchabilityAnalysis extends AnalysisSection {
  contactInfo: {
    present: boolean;
    missing: string[];
  };
  sections: {
    hasSummary: boolean;
    hasProperHeadings: boolean;
    properlyFormattedDates: boolean;
  };
  jobTitleMatch: {
    score: Score;
    explanation: string;
  };
}

export interface HardSkillsAnalysis extends AnalysisSection {
  matchedSkills: string[];
  missingSkills: string[];
  technicalProficiency: {
    score: Score;
    strengths: string[];
    gaps: string[];
  };
}

export interface SoftSkillsAnalysis extends AnalysisSection {
  matchedSkills: string[];
  missingSkills: string[];
  leadershipIndicators: string[];
}

export interface RecruiterTipsAnalysis extends AnalysisSection {
  jobLevelMatch: {
    assessment: string;
    recommendation: string;
  };
  measurableResults: {
    present: string[];
    missing: string[];
  };
  resumeTone: {
    assessment: string;
    improvements: string[];
  };
  webPresence: {
    mentioned: string[];
    recommended: string[];
  };
}

export interface OverallAnalysis {
  totalScore: Score;
  applyingFor: {
    jobTitle: string;
    explanation: string;
  };
  shortlistRecommendation: {
    decision: string;
    explanation: string;
  };
  criticalImprovements: string[];
  keyStrengths: string[];
}

export class Analysis {
  constructor(
    private readonly _id: string,
    private readonly _searchability: SearchabilityAnalysis,
    private readonly _hardSkills: HardSkillsAnalysis,
    private readonly _softSkills: SoftSkillsAnalysis,
    private readonly _recruiterTips: RecruiterTipsAnalysis,
    private readonly _overall: OverallAnalysis,
    private readonly _createdAt: Date
  ) {}

  get id(): string { return this._id; }
  get searchability(): SearchabilityAnalysis { return this._searchability; }
  get hardSkills(): HardSkillsAnalysis { return this._hardSkills; }
  get softSkills(): SoftSkillsAnalysis { return this._softSkills; }
  get recruiterTips(): RecruiterTipsAnalysis { return this._recruiterTips; }
  get overall(): OverallAnalysis { return this._overall; }
  get createdAt(): Date { return this._createdAt; }

  /**
   * Deserializes JSON data into an Analysis entity using Zod validation.
   * @param data - Unknown data structure from JSON.parse()
   * @returns A fully typed Analysis instance.
   * @throws ZodError if validation fails.
   */
  static fromJSON(data: unknown): Analysis {
    // Import schema dynamically to avoid circular dependencies
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { AnalysisJSONSchema } = require('../schemas/AnalysisSchema');
    const parsed = AnalysisJSONSchema.parse(data);

    // Helper to convert parsed number to Score entity
    const toScore = (s: number) => new Score(s);

    return new Analysis(
      parsed.id,
      {
        ...parsed.searchability,
        score: toScore(parsed.searchability.score),
        jobTitleMatch: {
           ...parsed.searchability.jobTitleMatch,
           score: toScore(parsed.searchability.jobTitleMatch.score)
        }
      },
      {
        ...parsed.hardSkills,
        score: toScore(parsed.hardSkills.score),
        technicalProficiency: {
            ...parsed.hardSkills.technicalProficiency,
            score: toScore(parsed.hardSkills.technicalProficiency.score)
        }
      },
      {
        ...parsed.softSkills,
        score: toScore(parsed.softSkills.score)
      },
      {
        ...parsed.recruiterTips,
        score: toScore(parsed.recruiterTips.score)
      },
      {
        ...parsed.overall,
        totalScore: toScore(parsed.overall.totalScore)
      },
      parsed.createdAt
    );
  }

  toJSON() {
    return {
      id: this._id,
      searchability: this._searchability,
      hardSkills: this._hardSkills,
      softSkills: this._softSkills,
      recruiterTips: this._recruiterTips,
      overall: this._overall,
      createdAt: this._createdAt,
    };
  }
}
