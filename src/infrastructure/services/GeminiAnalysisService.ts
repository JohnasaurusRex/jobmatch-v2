// src/infrastructure/services/GeminiAnalysisService.ts
import { IAnalysisService } from '../../domain/services/IAnalysisService';
import { Resume } from '../../domain/entities/Resume';
import { JobDescription } from '../../domain/entities/JobDescription';
import { Analysis } from '../../domain/entities/Analysis';
import { Score } from '../../domain/value-objects/Score';
import { geminiModel } from '../ai/gemini';
import { v4 as uuidv4 } from 'uuid';

// Types for validation
interface GeminiResponse {
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

// Type for unknown JSON response validation
type JsonValue = string | number | boolean | null | undefined | JsonObject | JsonArray;
interface JsonObject { [key: string]: JsonValue; }
type JsonArray = Array<JsonValue>;

export class GeminiAnalysisService implements IAnalysisService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  async analyzeResume(resume: Resume, jobDescription: JobDescription): Promise<Analysis> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`Analysis attempt ${attempt}/${this.MAX_RETRIES}`);
        
        const prompt = this.buildPrompt(resume.content, jobDescription.content);
        const response = await geminiModel.generateContent(prompt);
        
        if (!response.response) {
          throw new Error('No response from Gemini AI');
        }

        const analysisText = response.response.text();
        
        if (!analysisText || analysisText.trim().length === 0) {
          throw new Error('Empty response from Gemini AI');
        }

        // Clean and parse response
        const cleanedText = this.cleanResponse(analysisText);
        const parsedAnalysis = this.parseAndValidateResponse(cleanedText);

        return this.mapToAnalysisEntity(parsedAnalysis);

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error occurred');
        console.error(`Analysis attempt ${attempt} failed:`, lastError.message);

        if (attempt < this.MAX_RETRIES) {
          console.log(`Retrying in ${this.RETRY_DELAY}ms...`);
          await this.sleep(this.RETRY_DELAY);
        }
      }
    }

    throw new Error(`Analysis failed after ${this.MAX_RETRIES} attempts: ${lastError?.message}`);
  }

  private buildPrompt(resumeText: string, jobDescriptionText: string): string {
    // Truncate inputs to prevent token limits
    const truncatedResume = resumeText.substring(0, 10000);
    const truncatedJobDesc = jobDescriptionText.substring(0, 5000);

    return `
As the Head of Talent Acquisition, conduct a highly critical and objective analysis of this resume against the job description.
Provide a concise and precise ATS analysis with strict adherence to the JSON format below.
No extra text or explanations are permitted before, within, or after the JSON.

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

  private cleanResponse(response: string): string {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    
    if (cleaned.includes('```json')) {
      const jsonStart = cleaned.indexOf('```json') + 7;
      const jsonEnd = cleaned.indexOf('```', jsonStart);
      if (jsonEnd !== -1) {
        cleaned = cleaned.substring(jsonStart, jsonEnd).trim();
      }
    } else if (cleaned.includes('```')) {
      const codeStart = cleaned.indexOf('```') + 3;
      const codeEnd = cleaned.indexOf('```', codeStart);
      if (codeEnd !== -1) {
        cleaned = cleaned.substring(codeStart, codeEnd).trim();
      }
    }

    // Remove any leading/trailing whitespace or newlines
    cleaned = cleaned.replace(/^[\s\n\r]+|[\s\n\r]+$/g, '');
    
    // Ensure it starts with { and ends with }
    if (!cleaned.startsWith('{')) {
      const jsonStart = cleaned.indexOf('{');
      if (jsonStart !== -1) {
        cleaned = cleaned.substring(jsonStart);
      }
    }
    
    if (!cleaned.endsWith('}')) {
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonEnd !== -1) {
        cleaned = cleaned.substring(0, jsonEnd + 1);
      }
    }

    return cleaned;
  }

  private parseAndValidateResponse(responseText: string): GeminiResponse {
    try {
      const parsed: unknown = JSON.parse(responseText);
      this.validateGeminiResponse(parsed);
      return parsed as GeminiResponse;
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('JSON parsing failed. Response text:', responseText);
        throw new Error(`Invalid JSON response from Gemini AI: ${error.message}`);
      }
      throw error;
    }
  }

  private validateGeminiResponse(data: unknown): void {
    const requiredSections = ['searchability', 'hard_skills', 'soft_skills', 'recruiter_tips', 'overall'];
    
    if (!data || typeof data !== 'object') {
      throw new Error('Response is not a valid object');
    }

    const jsonData = data as JsonObject;

    for (const section of requiredSections) {
      if (!jsonData[section]) {
        throw new Error(`Missing required section: ${section}`);
      }
    }

    // Validate score fields
    const scoreFields = [
      'searchability.score',
      'hard_skills.score',
      'soft_skills.score',
      'recruiter_tips.score',
      'overall.total_score',
      'searchability.job_title_match.score',
      'hard_skills.technical_proficiency.score'
    ];

    for (const field of scoreFields) {
      const value = this.getNestedProperty(jsonData, field);
      if (typeof value !== 'number' || value < 0 || value > 100) {
        throw new Error(`Invalid score value for ${field}: ${value}`);
      }
    }

    // Validate required arrays
    const arrayFields = [
      'searchability.contact_info.missing',
      'searchability.recommendations',
      'hard_skills.matched_skills',
      'hard_skills.missing_skills',
      'hard_skills.technical_proficiency.strengths',
      'hard_skills.technical_proficiency.gaps',
      'hard_skills.recommendations',
      'soft_skills.matched_skills',
      'soft_skills.missing_skills',
      'soft_skills.leadership_indicators',
      'soft_skills.recommendations',
      'recruiter_tips.measurable_results.present',
      'recruiter_tips.measurable_results.missing',
      'recruiter_tips.resume_tone.improvements',
      'recruiter_tips.web_presence.mentioned',
      'recruiter_tips.web_presence.recommended',
      'overall.critical_improvements',
      'overall.key_strengths'
    ];

    for (const field of arrayFields) {
      const value = this.getNestedProperty(jsonData, field);
      if (!Array.isArray(value)) {
        throw new Error(`Expected array for ${field}, got: ${typeof value}`);
      }
    }
  }

  private getNestedProperty(obj: JsonObject, path: string): JsonValue {
    return path.split('.').reduce((current: JsonValue, key: string): JsonValue => {
      if (current && typeof current === 'object' && !Array.isArray(current) && key in current) {
        return (current as JsonObject)[key];
      }
      return undefined as JsonValue;
    }, obj);
  }

  private mapToAnalysisEntity(data: GeminiResponse): Analysis {
    try {
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
          recommendations: [], // Not in the original structure, so empty array
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
    } catch (error) {
      console.error('Error mapping to Analysis entity:', error);
      console.error('Data that failed to map:', JSON.stringify(data, null, 2));
      throw new Error(`Failed to create Analysis entity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

