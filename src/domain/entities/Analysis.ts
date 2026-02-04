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

  static fromJSON(data: any): Analysis {
    // Helper to Convert raw score (number or object) to Score entity
    const toScore = (s: any) => new Score(typeof s === 'number' ? s : s._value || s.value || 0);

    return new Analysis(
      data.id,
      {
        ...data.searchability,
        score: toScore(data.searchability.score),
        jobTitleMatch: {
           ...data.searchability.jobTitleMatch,
           score: toScore(data.searchability.jobTitleMatch.score)
        }
      },
      {
        ...data.hardSkills,
        score: toScore(data.hardSkills.score),
        technicalProficiency: {
            ...data.hardSkills.technicalProficiency,
            score: toScore(data.hardSkills.technicalProficiency.score)
        }
      },
      {
        ...data.softSkills,
        score: toScore(data.softSkills.score)
      },
      {
        ...data.recruiterTips,
        score: toScore(data.recruiterTips.score)
      },
      {
        ...data.overall,
        totalScore: toScore(data.overall.totalScore)
      },
      new Date(data.createdAt)
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
