// src/infrastructure/repositories/InMemoryJobRepository.ts
import { IJobRepository } from '../../domain/repositories/IJobRepository';
import { Job } from '../../domain/entities/Job';
import { JobId } from '../../domain/value-objects/JobId';

/**
 * In-memory implementation of IJobRepository.
 * Used for temporary job status tracking during analysis.
 * Data is lost on server restart (acceptable for ephemeral job tracking).
 */
export class InMemoryJobRepository implements IJobRepository {
  private jobs: Map<string, Job> = new Map();
  private readonly TTL = 3600 * 1000; // 1 hour TTL for cleanup

  async save(job: Job): Promise<void> {
    this.jobs.set(job.id.value, job);
    this.cleanupExpiredJobs();
  }

  async findById(id: JobId): Promise<Job | null> {
    const job = this.jobs.get(id.value);
    if (!job) return null;
    
    // Check if expired
    const age = Date.now() - job.createdAt.getTime();
    if (age > this.TTL) {
      this.jobs.delete(id.value);
      return null;
    }
    
    return job;
  }

  async update(job: Job): Promise<void> {
    this.jobs.set(job.id.value, job);
  }

  async delete(id: JobId): Promise<void> {
    this.jobs.delete(id.value);
  }

  /**
   * Cleanup jobs older than TTL to prevent memory leaks.
   */
  private cleanupExpiredJobs(): void {
    const now = Date.now();
    for (const [id, job] of this.jobs.entries()) {
      if (now - job.createdAt.getTime() > this.TTL) {
        this.jobs.delete(id);
      }
    }
  }
}
