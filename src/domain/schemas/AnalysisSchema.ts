/**
 * Zod schema for validating Analysis JSON data.
 * This enables type-safe deserialization without using 'any'.
 */
import { z } from 'zod';

// Score can be a number (from toJSON) or an object with _value (from Score class serialization)
const ScoreSchema = z.union([
  z.number(),
  z.object({ _value: z.number() }),
  z.object({ value: z.number() })
]).transform(val => typeof val === 'number' ? val : ('_value' in val ? val._value : val.value));

const AnalysisSectionSchema = z.object({
  score: ScoreSchema,
  recommendations: z.array(z.string())
});

const SearchabilityAnalysisSchema = AnalysisSectionSchema.extend({
  contactInfo: z.object({
    present: z.boolean(),
    missing: z.array(z.string())
  }),
  sections: z.object({
    hasSummary: z.boolean(),
    hasProperHeadings: z.boolean(),
    properlyFormattedDates: z.boolean()
  }),
  jobTitleMatch: z.object({
    score: ScoreSchema,
    explanation: z.string()
  })
});

const HardSkillsAnalysisSchema = AnalysisSectionSchema.extend({
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  technicalProficiency: z.object({
    score: ScoreSchema,
    strengths: z.array(z.string()),
    gaps: z.array(z.string())
  })
});

const SoftSkillsAnalysisSchema = AnalysisSectionSchema.extend({
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  leadershipIndicators: z.array(z.string())
});

const RecruiterTipsAnalysisSchema = AnalysisSectionSchema.extend({
  jobLevelMatch: z.object({
    assessment: z.string(),
    recommendation: z.string()
  }),
  measurableResults: z.object({
    present: z.array(z.string()),
    missing: z.array(z.string())
  }),
  resumeTone: z.object({
    assessment: z.string(),
    improvements: z.array(z.string())
  }),
  webPresence: z.object({
    mentioned: z.array(z.string()),
    recommended: z.array(z.string())
  })
});

const OverallAnalysisSchema = z.object({
  totalScore: ScoreSchema,
  applyingFor: z.object({
    jobTitle: z.string(),
    explanation: z.string()
  }),
  shortlistRecommendation: z.object({
    decision: z.string(),
    explanation: z.string()
  }),
  criticalImprovements: z.array(z.string()),
  keyStrengths: z.array(z.string())
});

export const AnalysisJSONSchema = z.object({
  id: z.string(),
  searchability: SearchabilityAnalysisSchema,
  hardSkills: HardSkillsAnalysisSchema,
  softSkills: SoftSkillsAnalysisSchema,
  recruiterTips: RecruiterTipsAnalysisSchema,
  overall: OverallAnalysisSchema,
  createdAt: z.union([z.string(), z.date()]).transform(val => new Date(val))
});

export type AnalysisJSON = z.infer<typeof AnalysisJSONSchema>;
