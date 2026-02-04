import { RedisJobRepository } from './RedisJobRepository';
import { Job, JobStatus } from '../../domain/entities/Job';
import { JobId } from '../../domain/value-objects/JobId';
import { v4 as uuidv4 } from 'uuid';
import { Analysis } from '../../domain/entities/Analysis';
import { Score } from '../../domain/value-objects/Score';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local explicitly for integration testing
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Only run this test if REDIS_URL is present
const runIfRedis = process.env.REDIS_URL ? describe : describe.skip;

runIfRedis('RedisJobRepository', () => {
  let repository: RedisJobRepository;
  let testJobId: JobId;

  beforeAll(() => {
    repository = new RedisJobRepository();
  });

  afterAll(async () => {
    // Clean up test key
    if (testJobId) {
      await repository.delete(testJobId);
    }
    // We can't easily disconnect redis here as it's private, but Jest will handle force exit if needed
  });

  it('should save and retrieve a job', async () => {
    testJobId = new JobId(uuidv4());
    const job = new Job(testJobId, JobStatus.PROCESSING, new Date());
    
    await repository.save(job);
    
    const retrievedJob = await repository.findById(testJobId);
    
    expect(retrievedJob).toBeDefined();
    expect(retrievedJob?.id.toString()).toBe(testJobId.toString());
    expect(retrievedJob?.status).toBe(JobStatus.PROCESSING);
  });

  it('should update a job with analysis result', async () => {
    // Retrieve the job again
    const job = await repository.findById(testJobId);
    if (!job) throw new Error('Job not found');

    // Create a mock analysis result with proper Score objects
    const analysis = new Analysis(
        uuidv4(),
        { 
          score: new Score(80), 
          recommendations: [], 
          contactInfo: { present: true, missing: [] }, 
          sections: { hasSummary: true, hasProperHeadings: true, properlyFormattedDates: true }, 
          jobTitleMatch: { score: new Score(90), explanation: 'Good fit' } 
        },
        { 
          score: new Score(70), 
          recommendations: [], 
          matchedSkills: ['React', 'TypeScript'], 
          missingSkills: [], 
          technicalProficiency: { score: new Score(80), strengths: [], gaps: [] } 
        },
        { 
          score: new Score(90), 
          recommendations: [], 
          matchedSkills: ['Communication'], 
          missingSkills: [], 
          leadershipIndicators: [] 
        },
        { 
          score: new Score(60), 
          recommendations: [], 
          jobLevelMatch: { assessment: 'Senior', recommendation: 'Good' }, 
          measurableResults: { present: [], missing: [] }, 
          resumeTone: { assessment: 'Professional', improvements: [] }, 
          webPresence: { mentioned: [], recommended: [] } 
        },
        { 
          totalScore: new Score(85), 
          applyingFor: { jobTitle: 'Developer', explanation: 'Direct match' }, 
          shortlistRecommendation: { decision: 'Yes', explanation: 'Strong candidate' }, 
          criticalImprovements: [], 
          keyStrengths: [] 
        },
        new Date()
    );

    job.markAsCompleted(analysis);
    await repository.update(job);

    // Verify update
    const updatedJob = await repository.findById(testJobId);
    
    expect(updatedJob).toBeDefined();
    expect(updatedJob?.status).toBe(JobStatus.COMPLETED);
    expect(updatedJob?.analysisResult).toBeDefined();
    expect(updatedJob?.analysisResult?.overall.totalScore.value).toBe(85);
  });

  it('should return null for non-existent job', async () => {
    const nonExistentId = new JobId(uuidv4());
    const job = await repository.findById(nonExistentId);
    expect(job).toBeNull();
  });
});
