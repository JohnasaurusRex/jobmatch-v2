// File: src/infrastructure/repositories/FileSystemJobRepository.ts
import { IJobRepository } from '../../domain/repositories/IJobRepository';
import { Job, JobStatus } from '../../domain/entities/Job';
import { JobId } from '../../domain/value-objects/JobId';
import { promises as fs } from 'fs';
import path from 'path';

export class FileSystemJobRepository implements IJobRepository {
  private readonly storageDir: string;
  private readonly TTL = 86400 * 1000; // 24 hours in milliseconds

  constructor() {
    // Store data in a 'data' folder in your project root
    this.storageDir = path.join(process.cwd(), 'data', 'jobs');
    this.ensureStorageDir();
  }

  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directory:', error);
    }
  }

  private getFilePath(id: JobId): string {
    return path.join(this.storageDir, `${id.value}.json`);
  }

  private async isExpired(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      const fileAge = Date.now() - stats.mtime.getTime();
      return fileAge > this.TTL;
    } catch {
      return true; // If file doesn't exist or error, consider it expired
    }
  }

  async save(job: Job): Promise<void> {
    try {
      await this.ensureStorageDir();
      
      const filePath = this.getFilePath(job.id);
      const data = {
        id: job.id.value,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
        completedAt: job.completedAt?.toISOString(),
        errorMessage: job.errorMessage,
        analysisId: job.analysisId,
        savedAt: new Date().toISOString(), // Track when it was saved
      };
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save job:', error);
      throw new Error('Failed to save job to file system');
    }
  }

  async findById(id: JobId): Promise<Job | null> {
    try {
      const filePath = this.getFilePath(id);
      
      // Check if file exists and is not expired
      if (await this.isExpired(filePath)) {
        // Clean up expired file
        await this.delete(id);
        return null;
      }

      const fileContent = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(fileContent);
      
      const job = new Job(
        new JobId(parsed.id),
        parsed.status as JobStatus,
        new Date(parsed.createdAt),
        parsed.completedAt ? new Date(parsed.completedAt) : undefined,
        parsed.errorMessage,
        parsed.analysisId
      );

      return job;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'ENOENT') {
        return null; // File doesn't exist
      }
      console.error('Failed to read job:', error);
      throw new Error('Failed to read job from file system');
    }
  }

  async update(job: Job): Promise<void> {
    await this.save(job); // Same as save for file system
  }

  async delete(id: JobId): Promise<void> {
    try {
      const filePath = this.getFilePath(id);
      await fs.unlink(filePath);
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code !== 'ENOENT') {
        console.error('Failed to delete job:', error);
        throw new Error('Failed to delete job from file system');
      }
      // If file doesn't exist, that's fine - it's already "deleted"
    }
  }

  // Bonus: Cleanup method to remove expired files (optional)
  async cleanupExpiredFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.storageDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.storageDir, file);
          if (await this.isExpired(filePath)) {
            await fs.unlink(filePath);
            console.log(`Cleaned up expired job file: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup expired job files:', error);
    }
  }
}