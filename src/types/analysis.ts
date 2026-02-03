// src/types/analysis.ts

/**
 * Interface for analysis data as returned by the API (snake_case).
 * This is what comes directly from the OpenAI structured output.
 */
export interface AnalysisResponse {
  searchability: {
    score: number;
    contact_info: {
      present: boolean;
      missing: string[];
    };
    sections: {
      has_summary: boolean;
      has_proper_headings: boolean;
      properly_formatted_dates: boolean;
    };
    job_title_match: {
      score: number;
      explanation: string;
    };
    recommendations: string[];
  };
  hard_skills: {
    score: number;
    matched_skills: string[];
    missing_skills: string[];
    technical_proficiency: {
      score: number;
      strengths: string[];
      gaps: string[];
    };
    recommendations: string[];
  };
  soft_skills: {
    score: number;
    matched_skills: string[];
    missing_skills: string[];
    leadership_indicators: string[];
    recommendations: string[];
  };
  recruiter_tips: {
    score: number;
    job_level_match: {
      assessment: string;
      recommendation: string;
    };
    measurable_results: {
      present: string[];
      missing: string[];
    };
    resume_tone: {
      assessment: string;
      improvements: string[];
    };
    web_presence: {
      mentioned: string[];
      recommended: string[];
    };
  };
  overall: {
    total_score: number;
    applying_for: {
      job_title: string;
      explanation: string;
    };
    shortlist_recommendation: {
      decision: string;
      explanation: string;
    };
    critical_improvements: string[];
    key_strengths: string[];
  };
}

/**
 * Interface for analysis data as stored in the frontend (camelCase).
 * This is the transformed version used throughout the UI.
 */
export interface StoredAnalysis {
  searchability: {
    score: number;
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
      score: number;
      explanation: string;
    };
    recommendations: string[];
  };
  hardSkills: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    technicalProficiency: {
      score: number;
      strengths: string[];
      gaps: string[];
    };
    recommendations: string[];
  };
  softSkills: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    leadershipIndicators: string[];
    recommendations: string[];
  };
  recruiterTips: {
    score: number;
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
  };
  overall: {
    totalScore: number;
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
  };
}

/**
 * Interface for analysis history items stored in localStorage.
 */
export interface AnalysisHistoryItem {
  id: string;
  jobTitle: string;
  totalScore: number;
  createdAt: string; // ISO date string
  analysis: StoredAnalysis;
}