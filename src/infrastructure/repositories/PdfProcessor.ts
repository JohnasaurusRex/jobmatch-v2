// src/infrastructure/repositories/PdfProcessor.ts
import { IPdfProcessor } from '../../domain/repositories/IPdfProcessor';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class PdfProcessor implements IPdfProcessor {
  private readonly uploadDirectory: string;

  constructor() {
    this.uploadDirectory = path.join(process.cwd(), 'uploads');
    this.ensureDirectoryExists();
  }

  async extractText(file: Buffer): Promise<string> {
    let temporaryFilePath: string | null = null;
    
    try {
      console.log('Starting PDF text extraction');
      console.log('File size:', file.length, 'bytes');

      temporaryFilePath = await this.saveToTemporaryFile(file);
      const extractedText = await this.readTextFromFile(temporaryFilePath);
      
      console.log('Text extraction completed, length:', extractedText.length);
      return extractedText;
    } catch (error) {
      console.error('Text extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${this.getErrorMessage(error)}`);
    } finally {
      if (temporaryFilePath) {
        await this.removeTemporaryFile(temporaryFilePath);
      }
    }
  }

  async validatePdf(file: Buffer): Promise<boolean> {
    try {
      console.log('Validating PDF file');

      if (!this.isValidBuffer(file)) {
        console.log('Validation failed: Invalid buffer');
        return false;
      }

      if (!this.hasValidPdfHeader(file)) {
        console.log('Validation failed: Invalid PDF header');
        return false;
      }

      return await this.canProcessFile(file);
    } catch (error) {
      console.warn('PDF validation failed:', error);
      return false;
    }
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.uploadDirectory, { recursive: true });
      console.log('Upload directory ready:', this.uploadDirectory);
    } catch (error) {
      console.error('Failed to create upload directory:', error);
      throw new Error('Unable to initialize upload directory');
    }
  }

  private async saveToTemporaryFile(fileBuffer: Buffer): Promise<string> {
    const fileName = this.generateTemporaryFileName();
    const filePath = path.join(this.uploadDirectory, fileName);

    try {
      await fs.writeFile(filePath, fileBuffer);
      console.log('Temporary file created:', fileName);
      return filePath;
    } catch (error) {
      console.error('Failed to save temporary file:', error);
      throw new Error('Unable to save temporary file');
    }
  }

  private async readTextFromFile(filePath: string): Promise<string> {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      
      console.log('Processing file:', path.basename(filePath));
      
      const fileBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(fileBuffer);

      if (!pdfData.text || pdfData.text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      const text = pdfData.text.trim();
      
      console.log('PDF processed successfully:');
      console.log('- Pages:', pdfData.numpages);
      console.log('- Text length:', text.length);

      return text;
    } catch (error) {
      console.error('Failed to read text from file:', error);
      throw error;
    }
  }

  private async removeTemporaryFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      console.log('Temporary file removed:', path.basename(filePath));
    } catch (error) {
      console.warn('Failed to remove temporary file:', error);
      // Don't throw error for cleanup failures
    }
  }

  private async canProcessFile(file: Buffer): Promise<boolean> {
    let temporaryFilePath: string | null = null;

    try {
      temporaryFilePath = await this.saveToTemporaryFile(file);
      
      const pdfParse = (await import('pdf-parse')).default;
      const fileBuffer = await fs.readFile(temporaryFilePath);
      await pdfParse(fileBuffer);
      
      console.log('PDF validation successful with pdf-parse');
      return true;
    } catch (error) {
      console.warn('pdf-parse validation failed:', error);
      return false;
    } finally {
      if (temporaryFilePath) {
        await this.removeTemporaryFile(temporaryFilePath);
      }
    }
  }

  private isValidBuffer(file: Buffer): boolean {
    return Buffer.isBuffer(file) && file.length > 0;
  }

  private hasValidPdfHeader(file: Buffer): boolean {
    const header = file.subarray(0, 8).toString('ascii');
    return header.startsWith('%PDF');
  }

  private generateTemporaryFileName(): string {
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0];
    return `temp_${timestamp}_${uniqueId}.pdf`;
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown error occurred';
  }

  // Public method for cleanup (can be called by external services)
  async cleanupOldFiles(maxAgeHours: number = 24): Promise<void> {
    try {
      const files = await fs.readdir(this.uploadDirectory);
      const currentTime = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        if (this.isTemporaryFile(file)) {
          const filePath = path.join(this.uploadDirectory, file);
          const fileStats = await fs.stat(filePath);
          
          if (currentTime - fileStats.mtime.getTime() > maxAge) {
            await fs.unlink(filePath);
            console.log('Cleaned up old file:', file);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup old files:', error);
    }
  }

  private isTemporaryFile(fileName: string): boolean {
    return fileName.startsWith('temp_') && fileName.endsWith('.pdf');
  }
}