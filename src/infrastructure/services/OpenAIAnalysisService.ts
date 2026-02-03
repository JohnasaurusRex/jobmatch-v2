import { IAnalysisService } from '../../domain/services/IAnalysisService';
import { Resume } from '../../domain/entities/Resume';
import { JobDescription } from '../../domain/entities/JobDescription';
import { Analysis } from '../../domain/entities/Analysis';
import { Score } from '../../domain/value-objects/Score';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

// Types for validation (Copied/Adapted from GeminiAnalysisService)
interface AnalysisResponse {
  searchability: {
    score: number;
    contact_info: { present: boolean; missing: string[] };
    sections: { has_summary: boolean; has_proper_headings: boolean; properly_formatted_dates: boolean };
    job_title_match: { score: number; explanation: string };
    recommendations: string[];
  };
  hard_skills: {
    score: number;
    matched_skills: string[];
    missing_skills: string[];
    technical_proficiency: { score: number; strengths: string[]; gaps: string[] };
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
    job_level_match: { assessment: string; recommendation: string };
    measurable_results: { present: string[]; missing: string[] };
    resume_tone: { assessment: string; improvements: string[] };
    web_presence: { mentioned: string[]; recommended: string[] };
  };
  overall: {
    total_score: number;
    applying_for: { job_title: string; explanation: string };
    shortlist_recommendation: { decision: string; explanation: string };
    critical_improvements: string[];
    key_strengths: string[];
  };
}

export class OpenAIAnalysisService implements IAnalysisService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    // We don't throw here to allow instantiation in tests with mocked OpenAI, 
    // but in real run it might fail if key is missing when call is made. 
    // Typically better to check, but since we are mocking OpenAI constructor in test...
    this.openai = new OpenAI({
      apiKey: apiKey || 'dummy', // Prevent crash if missing in dev/test, but API calls will fail
    });
  }

  async analyzeResume(resume: Resume, jobDescription: JobDescription): Promise<Analysis> {
    const prompt = this.buildPrompt(resume.content, jobDescription.content);

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // Or gpt-3.5-turbo-json if preferred, but gpt-4o is standard now
        messages: [
          { role: "system", content: "You are an expert ATS and Recruiter AI." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2, // Low temp for consistent JSON
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("OpenAI returned empty content");
      }

      const parsed = JSON.parse(content) as AnalysisResponse;
      // TODO: Add structural validation similar to GeminiAnalysisService if needed.
      // For now trust OpenAI JSON mode but type cast.
      
      return this.mapToAnalysisEntity(parsed);

    } catch (error) {
      console.error("OpenAI Analysis failed:", error);
      throw error;
    }
  }

  private buildPrompt(resumeText: string, jobDescriptionText: string): string {
    // Truncate inputs
    const truncatedResume = resumeText.substring(0, 10000);
    const truncatedJobDesc = jobDescriptionText.substring(0, 5000);

    return `
As the Head of Talent Acquisition, conduct a highly critical and objective analysis of this resume against the job description.
Provide a concise and precise ATS analysis with strict adherence to the JSON format below.

Categories:
1. Searchability: Evaluate resume formatting for ATS compatibility
2. Hard Skills: Analyze technical skills match
3. Soft Skills: Evaluate soft skills demonstration
4. Recruiter Tips: Assess overall presentation
5. Overall: Provide comprehensive scoring

JSON Format (Strictly Enforced):
{
  "searchability": {
    "score": <number 0-100>,
    "contact_info": { "present": <boolean>, "missing": ["<string>"] },
    "sections": {
      "has_summary": <boolean>,
      "has_proper_headings": <boolean>,
      "properly_formatted_dates": <boolean>
    },
    "job_title_match": { "score": <number 0-100>, "explanation": "<string>" },
    "recommendations": ["<string>"]
  },
  "hard_skills": {
    "score": <number 0-100>,
    "matched_skills": ["<string>"],
    "missing_skills": ["<string>"],
    "technical_proficiency": {
      "score": <number 0-100>,
      "strengths": ["<string>"],
      "gaps": ["<string>"]
    },
    "recommendations": ["<string>"]
  },
  "soft_skills": {
    "score": <number 0-100>,
    "matched_skills": ["<string>"],
    "missing_skills": ["<string>"],
    "leadership_indicators": ["<string>"],
    "recommendations": ["<string>"]
  },
  "recruiter_tips": {
    "score": <number 0-100>,
    "job_level_match": { "assessment": "<string>", "recommendation": "<string>" },
    "measurable_results": { "present": ["<string>"], "missing": ["<string>"] },
    "resume_tone": { "assessment": "<string>", "improvements": ["<string>"] },
    "web_presence": { "mentioned": ["<string>"], "recommended": ["<string>"] }
  },
  "overall": {
    "total_score": <number 0-100>,
    "applying_for": { "job_title": "<string>", "explanation": "<string>" },
    "shortlist_recommendation": { "decision": "<string>", "explanation": "<string>" },
    "critical_improvements": ["<string>"],
    "key_strengths": ["<string>"]
  }
}

Resume: ${truncatedResume}

Job Description: ${truncatedJobDesc}
`;
  }

  private mapToAnalysisEntity(data: AnalysisResponse): Analysis {
     // Reuse logic/structure from GeminiAnalysisService
      return new Analysis(
        uuidv4(),
        // Searchability Analysis
        {
          score: new Score(data.searchability.score),
          contactInfo: {
            present: data.searchability.contact_info.present,
            missing: data.searchability.contact_info.missing || [],
          },
          sections: {
            hasSummary: data.searchability.sections.has_summary,
            hasProperHeadings: data.searchability.sections.has_proper_headings,
            properlyFormattedDates: data.searchability.sections.properly_formatted_dates,
          },
          jobTitleMatch: {
            score: new Score(data.searchability.job_title_match.score),
            explanation: data.searchability.job_title_match.explanation,
          },
          recommendations: data.searchability.recommendations || [],
        },
        // Hard Skills Analysis
        {
          score: new Score(data.hard_skills.score),
          matchedSkills: data.hard_skills.matched_skills || [],
          missingSkills: data.hard_skills.missing_skills || [],
          technicalProficiency: {
            score: new Score(data.hard_skills.technical_proficiency.score),
            strengths: data.hard_skills.technical_proficiency.strengths || [],
            gaps: data.hard_skills.technical_proficiency.gaps || [],
          },
          recommendations: data.hard_skills.recommendations || [],
        },
        // Soft Skills Analysis
        {
          score: new Score(data.soft_skills.score),
          matchedSkills: data.soft_skills.matched_skills || [],
          missingSkills: data.soft_skills.missing_skills || [],
          leadershipIndicators: data.soft_skills.leadership_indicators || [],
          recommendations: data.soft_skills.recommendations || [],
        },
        // Recruiter Tips Analysis
        {
          score: new Score(data.recruiter_tips.score),
          jobLevelMatch: {
            assessment: data.recruiter_tips.job_level_match.assessment,
            recommendation: data.recruiter_tips.job_level_match.recommendation,
          },
          measurableResults: {
            present: data.recruiter_tips.measurable_results.present || [],
            missing: data.recruiter_tips.measurable_results.missing || [],
          },
          resumeTone: {
            assessment: data.recruiter_tips.resume_tone.assessment,
            improvements: data.recruiter_tips.resume_tone.improvements || [],
          },
          webPresence: {
            mentioned: data.recruiter_tips.web_presence.mentioned || [],
            recommended: data.recruiter_tips.web_presence.recommended || [],
          },
          recommendations: [], 
        },
        // Overall Analysis
        {
          totalScore: new Score(data.overall.total_score),
          applyingFor: {
            jobTitle: data.overall.applying_for.job_title,
            explanation: data.overall.applying_for.explanation,
          },
          shortlistRecommendation: {
            decision: data.overall.shortlist_recommendation.decision,
            explanation: data.overall.shortlist_recommendation.explanation,
          },
          criticalImprovements: data.overall.critical_improvements || [],
          keyStrengths: data.overall.key_strengths || [],
        },
        new Date()
      );
  }
}
