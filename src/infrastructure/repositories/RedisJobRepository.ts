import { IJobRepository } from '../../domain/repositories/IJobRepository';
import { Job, JobStatus } from '../../domain/entities/Job';
import { JobId } from '../../domain/value-objects/JobId';
import { Analysis } from '../../domain/entities/Analysis';
import Redis from 'ioredis';

export class RedisJobRepository implements IJobRepository {
  private redis: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not defined');
    }
    
    this.redis = new Redis(redisUrl, {
      tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
      maxRetriesPerRequest: 3,
    });
    
    this.redis.on('error', (err) => console.error('Redis Client Error:', err));
  }

  async save(job: Job): Promise<void> {
    const key = `job:${job.id.toString()}`;
    const data = {
      id: job.id.toString(),
      status: job.status,
      createdAt: job.createdAt.toISOString(),
      completedAt: job.completedAt?.toISOString(),
      errorMessage: job.errorMessage,
      analysisResult: job.analysisResult ? JSON.stringify(job.analysisResult.toJSON()) : undefined,
    };

    // Store with 1 hour TTL (Ephemeral job tracking)
    await this.redis.setex(key, 3600, JSON.stringify(data));
  }

  async findById(id: JobId): Promise<Job | null> {
    const key = `job:${id.toString()}`;
    const dataStr = await this.redis.get(key);
    
    if (!dataStr) return null;

    try {
      const data = JSON.parse(dataStr);
      
      let analysisResult: Analysis | undefined;
      
      if (data.analysisResult) {
        try {
            const rawAnalysis = JSON.parse(data.analysisResult);
            analysisResult = Analysis.fromJSON(rawAnalysis);
        } catch (e) {
            console.error('Failed to rehydrate analysis:', e);
        }
      }

      const job = new Job(
        new JobId(data.id),
        data.status as JobStatus,
        new Date(data.createdAt),
        data.completedAt ? new Date(data.completedAt) : undefined,
        data.errorMessage,
        analysisResult?.id,
        analysisResult
      );

      // Restore status/meta
      if (data.status === JobStatus.COMPLETED && analysisResult) {
        job.markAsCompleted(analysisResult);
      } else if (data.status === JobStatus.ERROR) {
        job.markAsError(data.errorMessage || 'Unknown error');
      }

      return job;
    } catch (error) {
      console.error('Error parsing job from Redis:', error);
      return null;
    }
  }

  async update(job: Job): Promise<void> {
    return this.save(job);
  }

  async delete(id: JobId): Promise<void> {
    const key = `job:${id.toString()}`;
    await this.redis.del(key);
  }
}
