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
                job_title: string,
                explanation: string
            },
      shortlist_recommendation: {
        decision: string;
        explanation: string;
      };
      critical_improvements: string[];
      key_strengths: string[];
    };
  }