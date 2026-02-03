import { OpenAIAnalysisService } from './OpenAIAnalysisService';
import { Resume } from '../../domain/entities/Resume';
import { JobDescription } from '../../domain/entities/JobDescription';
import { Analysis } from '../../domain/entities/Analysis';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

// Mock OpenAI
jest.mock('openai');

describe('OpenAIAnalysisService', () => {
  let service: OpenAIAnalysisService;
  let mockOpenAI: jest.Mocked<OpenAI>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup mock instance
    mockOpenAI = new OpenAI({ apiKey: 'test' }) as jest.Mocked<OpenAI>;
    (OpenAI as unknown as jest.Mock).mockImplementation(() => mockOpenAI);

    // Mock chat.completions.create
    mockOpenAI.chat = {
      completions: {
        create: jest.fn(),
      },
    } as unknown as OpenAI.Chat;

    service = new OpenAIAnalysisService();
  });

  it('should analyze resume and return Analysis entity', async () => {
    const resume = new Resume(uuidv4(), 'Resume Content', 'resume.pdf', new Date());
    const jobDescription = new JobDescription('Job Description Content');

    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              searchability: {
                score: 85,
                contact_info: { present: true, missing: [] },
                sections: { has_summary: true, has_proper_headings: true, properly_formatted_dates: true },
                job_title_match: { score: 90, explanation: 'Good match' },
                recommendations: []
              },
              hard_skills: {
                score: 80,
                matched_skills: ['React'],
                missing_skills: [],
                technical_proficiency: { score: 80, strengths: [], gaps: [] },
                recommendations: []
              },
              soft_skills: {
                score: 90,
                matched_skills: ['Communication'],
                missing_skills: [],
                leadership_indicators: [],
                recommendations: []
              },
              recruiter_tips: {
                score: 85,
                job_level_match: { assessment: 'Senior', recommendation: 'Good' },
                measurable_results: { present: [], missing: [] },
                resume_tone: { assessment: 'Professional', improvements: [] },
                web_presence: { mentioned: [], recommended: [] }
              },
              overall: {
                total_score: 88,
                applying_for: { job_title: 'Frontend Dev', explanation: '...' },
                shortlist_recommendation: { decision: 'Yes', explanation: '...' },
                critical_improvements: [],
                key_strengths: []
              }
            }),
          },
        },
      ],
    };

    (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue(mockResponse);

    const result = await service.analyzeResume(resume, jobDescription);

    expect(result).toBeInstanceOf(Analysis);
    expect(result.overall.totalScore.value).toBe(88);
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(1);
    expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
            model: "gpt-4o",
            response_format: { type: "json_object" }
        })
    );
  });
});
