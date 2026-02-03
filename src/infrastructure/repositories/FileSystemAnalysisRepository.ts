// File: src/infrastructure/repositories/FileSystemAnalysisRepository.ts
import { IAnalysisRepository } from '../../domain/repositories/IAnalysisRepository';
import { Analysis } from '../../domain/entities/Analysis';
import { promises as fs } from 'fs';
import path from 'path';

export class FileSystemAnalysisRepository implements IAnalysisRepository {
  private readonly storageDir: string;
  private readonly TTL = 86400 * 1000; // 24 hours in milliseconds

  constructor() {
    // Store data in a 'data' folder in your project root
    this.storageDir = path.join(process.cwd(), 'data', 'analyses');
    this.ensureStorageDir();
  }

  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create storage directory:', error);
    }
  }

  private getFilePath(id: string): string {
    return path.join(this.storageDir, `${id}.json`);
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

  async save(analysis: Analysis): Promise<void> {
    try {
      await this.ensureStorageDir();
      
      const filePath = this.getFilePath(analysis.id);
      const data = {
        id: analysis.id,
        searchability: analysis.searchability,
        hardSkills: analysis.hardSkills,
        softSkills: analysis.softSkills,
        recruiterTips: analysis.recruiterTips,
        overall: analysis.overall,
        createdAt: analysis.createdAt.toISOString(),
        savedAt: new Date().toISOString(), // Track when it was saved
      };
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to save analysis:', error);
      throw new Error('Failed to save analysis to file system');
    }
  }

  async findById(id: string): Promise<Analysis | null> {
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
      
      return new Analysis(
        parsed.id,
        parsed.searchability,
        parsed.hardSkills,
        parsed.softSkills,
        parsed.recruiterTips,
        parsed.overall,
        new Date(parsed.createdAt)
      );
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'ENOENT') {
        return null; // File doesn't exist
      }
      console.error('Failed to read analysis:', error);
      throw new Error('Failed to read analysis from file system');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const filePath = this.getFilePath(id);
      await fs.unlink(filePath);
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code !== 'ENOENT') {
        console.error('Failed to delete analysis:', error);
        throw new Error('Failed to delete analysis from file system');
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
            console.log(`Cleaned up expired file: ${file}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup expired files:', error);
    }
  }
}